import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5) => {
    let isPlaying = false;
    let fullscreenButton: p5.Element;
    let loadingMessage: p5.Element;
    const linesVibrationFactor = 1 / 25;
    const circlesVibrationFactor = 1 / 15;
    const radiusBeatingFactor = 1 / 2;
    const structureRadius = 320;

    type AnalysisData = {
        [name: string]: {
            frequency: number; // The number of times this person appears
            coOccurrences: {
                [coName: string]: number; // The number of times this person appears with another person
            };
        };
    };

    let analyzedDreamData: AnalysisData = {};
    let metadata: { dreamCount: number; minDate: string; maxDate: string } = {
        dreamCount: 0,
        minDate: '',
        maxDate: ''
    };
    const edges: { source: string, target: string, count: number }[] = [];
    const frameRate = 24;
    const circles: { [key: string]: Circle } = {};

    class Position {
        r: number;
        theta: number;

        constructor(r: number, theta: number) {
            this.r = r;
            this.theta = theta;
        }
    }

    class Circle {
        position: Position;
        radius: number;
        name: string;
        hoverTimestamp: number;

        constructor(radius: number, position: Position, name: string) {
            this.position = position;
            this.radius = radius;
            this.name = name;
            this.hoverTimestamp = 0;
        }

        draw(vibration: number) {
            const x = this.position.r * Math.cos(p.radians(this.position.theta)) + p.width / 2;
            const y = this.position.r * Math.sin(p.radians(this.position.theta)) + p.height / 2;
            p.fill(255);
            p.circle(x, y, this.radius * 2 + vibration);
        }

        move(dr: number, dtheta: number) {
            this.position.theta += dtheta;
            this.position.r += dr;
        }

        getX(): number {
            return this.position.r * Math.cos(p.radians(this.position.theta)) + p.width / 2;
        }

        getY(): number {
            return this.position.r * Math.sin(p.radians(this.position.theta)) + p.height / 2;
        }

        isHovered(): boolean {
            const x = this.getX();
            const y = this.getY();
            const distance = p.dist(p.mouseX, p.mouseY, x, y);
            return distance <= 1.2 * this.radius;
        }

        updateHoverTimestamp() {
            this.hoverTimestamp = p.millis(); // Update with current time in milliseconds
        }

        shouldDisplayText(): boolean {
            const hoverDuration = 500; // Duration in milliseconds to keep the text on screen
            return p.millis() - this.hoverTimestamp < hoverDuration;
        }
    }

    const fetchAnalysis = async () => {
        try {
            const res = await fetch('/api/googleSheets');
            if (!res.ok) {
                console.error('Failed to fetch analysis:', res.statusText);
            } else {
                const rawData = await res.json();
                console.log(rawData);
                analyzedDreamData = rawData['analysis'];
                metadata = rawData['metadata'];
                return { analyzedDreamData, metadata }
            }
        } catch (error) {
            console.error('Error fetching analysis:', error);
            return null
        }
    };

    let sound: p5.SoundFile;
    let fft: p5.FFT;

    p.preload = () => {
        loadingMessage = p.createP('Loading... Please wait.');
        loadingMessage.position(p.windowWidth / 2 - 100, p.windowHeight / 2);
        sound = p.loadSound('/music/Cenizas-006-NicolasJaar-Mud.wav', onLoadComplete);
    };

    function onLoadComplete() {
        loadingMessage.remove(); // Remove the loading message from the screen
    }

    function toggleFullScreen() {
        const isFullScreen = p.fullscreen(); // Check if currently in full-screen mode
        p.fullscreen(!isFullScreen); // Toggle full-screen mode
    }

    let playPauseButton: p5.Element;

    function togglePlayPause() {
        if (isPlaying) {
            sound.pause();
            playPauseButton.html('Play'); // Update button text to "Play"
            isPlaying = false;
        } else {
            sound.play();
            playPauseButton.html('Pause'); // Update button text to "Pause"
            isPlaying = true;
        }
    }

    p.setup = async () => {
        p.createCanvas(p.windowWidth, window.innerHeight);
        p.frameRate(frameRate);

        // Create button for full screen mode
        fullscreenButton = p.createButton('Full Screen');
        fullscreenButton.position(0, 150);
        fullscreenButton.mousePressed(toggleFullScreen);

        // Sound stuff
        fft = new p5.FFT(0.9, 512);
        // Create play button
        playPauseButton = p.createButton('Play');
        playPauseButton.position(0, 100);
        playPauseButton.mousePressed(togglePlayPause);

        // Ensure some data is returned
        const data = await fetchAnalysis();
        if (!data) return;

        // Sort circles by frequency in descending order
        const sortedPeople = Object.entries(analyzedDreamData)
            .sort(([, a], [, b]) => b.frequency - a.frequency);

        // Initiate possible positions for the circles
        let theta = 0;
        const spots: Position[] = [];
        const spacingAngle = 360 / sortedPeople.length;
        for (let i = 0; i < sortedPeople.length; i++) {
            const position = new Position(structureRadius, theta);
            spots.push(position);
            theta += spacingAngle;
        };

        const takenIndices = new Set();
        let index = Math.floor(p.random(0, spots.length - 1));
        // Place circles around the structure circle
        for (const [name, data] of sortedPeople) {
            const radius = data.frequency * 2;

            // Check if the spot is already taken. If it is, go further
            let k = 0;
            while (takenIndices.has(index)) {
                index = (index + Math.floor(spots.length / 5) + k) % spots.length;
                k++;
            }

            const position = spots[index];
            takenIndices.add(index);
            circles[name] = new Circle(radius, position, name);
        }

        Object.entries(analyzedDreamData).forEach(([name, data]) => {
            Object.entries(data.coOccurrences).forEach(([coName, count]) => {
                if (name < coName) {
                    edges.push({ source: name, target: coName, count });
                }
            });
        });
    };

    p.draw = () => {
        p.background(0, 100);
        const periodSeconds = 60;
        const periodFrames = periodSeconds * frameRate;
        const dtheta = 360 / periodFrames;

        // Analyze audio frequencies
        const bass = fft.getEnergy('bass');
        const treble = fft.getEnergy('treble');
        const mid = fft.getEnergy("mid");

        // Display metadata
        p.push();
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(15);
        p.text(`Dreams: ${metadata.dreamCount}\nBetween ${metadata.minDate}\nand ${metadata.maxDate}`,
            p.width - 100,
            p.height - 100);
        p.pop();

        // Credits
        p.push();
        p.noStroke();
        p.fill('white');
        const text = "Jaar, Nicolas. 'Mud' Cenizas. https://www.jaar.site/";
        p.text(text, 0, p.windowHeight - 5);
        p.pop();

        // Move objects if music is playing
        if (isPlaying) {
            const radiusOffset = bass * radiusBeatingFactor;

            for (const circle of Object.values(circles)) {
                circle.move(radiusOffset, dtheta);
            };
        }

        // Draw circles
        for (const circle of Object.values(circles)) {

            let vibration = 0;
            if (isPlaying) {
                vibration = mid * circlesVibrationFactor;
            }

            if (circle.isHovered()) {
                circle.updateHoverTimestamp(); // Update hover timestamp when hovered
            }

            circle.draw(vibration);
            if (circle.shouldDisplayText()) {
                p.push();
                p.fill(255);
                p.textAlign(p.CENTER);
                p.textSize(15);
                p.text(circle.name, p.width / 2, p.height / 2);
                p.pop();
            };
        };

        // Draw links
        for (const link of edges) {
            const sourceCircle = circles[link.source];
            const targetCircle = circles[link.target];

            let vibrationX = 0;
            let vibrationY = 0;

            if (isPlaying) {
                // Calculate vibration offsets based on audio
                vibrationX = p.random(-treble * linesVibrationFactor, treble * linesVibrationFactor); // Bass mapped to small offsets
                vibrationY = p.random(-treble * linesVibrationFactor, treble * linesVibrationFactor);
            }

            // Apply vibration to link endpoints
            const x1 = sourceCircle.getX() + vibrationX;
            const y1 = sourceCircle.getY() + vibrationY;
            const x2 = targetCircle.getX() + vibrationX;
            const y2 = targetCircle.getY() + vibrationY;

            p.push();
            p.stroke(255);
            p.strokeWeight(link.count);
            p.line(x1, y1, x2, y2)
            p.pop();
        }

        // Move back circles to original radius when they have been beating with the music
        if (isPlaying) {
            const radiusOffset = bass * radiusBeatingFactor;

            for (const circle of Object.values(circles)) {
                circle.move(-radiusOffset, 0);
            };
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

