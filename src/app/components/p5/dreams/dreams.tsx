import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5) => {
    let isPlaying = false;
    let aboutIsShowing = false;
    let fullscreenButton: p5.Element;
    let loadingMessage: p5.Element;
    let loadingDreamsMessage: p5.Element;
    let playPauseButton: p5.Element;
    let aboutButton: p5.Element;
    let sound: p5.SoundFile;
    let fft: p5.FFT;
    let spaceMono: p5.Font;
    const linesVibrationFactor = 1 / 25;
    const baseRadius = 370; // Original structure radius
    let frequencyMagnifier = 2;
    const maxStructureRadiusRatio = 1.5;
    const lerpSpeed = 0.7; // Adjust the smoothing speed (lower = smoother)
    const maxCircleRadiusGrowthFactor = 2;
    const aboutDreamsText = '"Dreams" is the result of analyzing my actual\ndream journal\'s content.\nThe circles represent the people\nthat have been appearing in them. \nThe circle radius is proportional to their appearances.\nThe links show when people\nappeared together in the same dream.\n Hover on a circle to see who it is.';
    let loadingMessageFontSize = '16px';

    function isMobileDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /iphone|ipod|android|blackberry|windows phone|webos|mobile/.test(userAgent);
    }

    function capitalizeFirstLetter(val: string) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    const scaleFactor = Math.min(p.windowWidth, p.windowHeight) / 1000; // Scale based on the smaller screen dimension
    const structureRadius = baseRadius * scaleFactor; // Adjusted structure radius

    if (isMobileDevice()) {
        frequencyMagnifier = 1;
        loadingMessageFontSize = '12px';
    }

    const maxStructureRadius = structureRadius * maxStructureRadiusRatio;
    const maxStructureRadiusGrowth = maxStructureRadius - structureRadius;

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
            this.name = capitalizeFirstLetter(name);
            this.hoverTimestamp = 0;
        }

        draw(vibrationFactor: number) {
            const x = this.position.r * Math.cos(p.radians(this.position.theta)) + p.width / 2;
            const y = this.position.r * Math.sin(p.radians(this.position.theta)) + p.height / 2;
            p.fill(255);
            p.circle(x, y, this.radius * 2 * vibrationFactor);
        }

        move(dr: number, dtheta: number) {
            this.position.theta += dtheta;

            // Avoid jumps in radius moving
            const currentRadius = this.position.r;
            const targetRadius = this.position.r + dr;

            this.position.r = p.lerp(currentRadius, targetRadius, lerpSpeed);
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

    const sigmoid = (x: number) => 1 / (1 + Math.exp(-0.05 * (x - 220))); // Adjust slope (0.05) and center (128)

    p.preload = () => {
        spaceMono = p.loadFont('/fonts/SpaceMono-Regular.ttf');
        loadingMessage = p.createP('Loading music... Please wait.');
        loadingMessage.position(p.windowWidth / 2 - 100, p.windowHeight / 2);
        loadingMessage.style('font-size', loadingMessageFontSize);
        sound = p.loadSound('/music/Cenizas-006-NicolasJaar-Mud.mp3', onLoadComplete);
    };

    function onLoadComplete() {
        loadingMessage.remove(); // Remove the loading message from the screen
    }

    function toggleFullScreen() {
        const isFullScreen = p.fullscreen(); // Check if currently in full-screen mode
        p.fullscreen(!isFullScreen); // Toggle full-screen mode
    }

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

    function toggleAbout() {
        if (aboutIsShowing) {
            // Close about window
            aboutIsShowing = false;
        } else {
            // About is not yet showing, open about window
            aboutIsShowing = true;
        }
    }

    p.setup = async () => {
        p.createCanvas(p.windowWidth, window.innerHeight);
        p.frameRate(frameRate);
        p.textFont(spaceMono);

        let playPauseButtonPosition = 100;
        let fullScreenButtonPosition = 150;
        let aboutButtonPosition = 200;
        let fontSize = '18px';
        if (isMobileDevice()) {
            aboutButtonPosition = 150;
            fullScreenButtonPosition = 100;
            playPauseButtonPosition = 50;
            fontSize = '12px';
        }

        // Create button for full screen mode
        fullscreenButton = p.createButton('Full Screen');
        fullscreenButton.position(0, fullScreenButtonPosition);
        fullscreenButton.mousePressed(toggleFullScreen);
        fullscreenButton.style('font-size', fontSize);

        // Sound stuff
        fft = new p5.FFT(0.9, 512);
        // Create play button
        playPauseButton = p.createButton('Play');
        playPauseButton.position(0, playPauseButtonPosition);
        playPauseButton.mousePressed(togglePlayPause);
        playPauseButton.style('font-size', fontSize);

        // Create about button
        aboutButton = p.createButton('About "Dreams"');
        aboutButton.position(0, aboutButtonPosition);
        aboutButton.mousePressed(toggleAbout);
        aboutButton.style('font-size', fontSize);

        // Ensure some data is returned
        loadingDreamsMessage = p.createP('Loading dreams... Please wait.');
        loadingDreamsMessage.position(p.windowWidth / 2 - 100, p.windowHeight / 2);
        loadingDreamsMessage.style('font-size', loadingMessageFontSize)
        const data = await fetchAnalysis();
        if (data) {
            console.log('Dream data loaded:', data);
            // Remove the loading message once data is fetched
            loadingDreamsMessage.remove();
        } else {
            // Handle case where data fetching fails
            loadingDreamsMessage.html('Failed to load dreams. Please try again later.');
            return
        }

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
            const radius = Math.max(2, data.frequency * frequencyMagnifier);

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
        fft.analyze(); // Array of frequency amplitudes (0-255)
        const lowMid = fft.getEnergy('lowMid');
        const adjustedBass = sigmoid(lowMid) * 255;
        const treble = fft.getEnergy('treble');
        const mid = fft.getEnergy("mid");

        // Normalize the bass such that instead of going from 0 to 255, it goes from 0 to dR
        const mapBass = p.map(adjustedBass, 0, 255, 0, maxStructureRadiusGrowth); // becomes a radius growth between 0 and maxStructureRadiusGrowth
        const mapMid = p.map(mid, 0, 255, 1, maxCircleRadiusGrowthFactor); // becomes a vibration factor between 1 and maxCircleRadiusGrowthFactor

        let textSize = 15;
        if (isMobileDevice()) {
            textSize = 8;
        }

        // Display metadata
        p.push();
        p.fill(255);
        p.textAlign(p.CENTER);
        let textOffset = 100;
        if (isMobileDevice()) {
            textOffset = 50;
        }
        p.textSize(textSize);
        p.text(`Dreams: ${metadata.dreamCount}\nBetween ${metadata.minDate}\nand ${metadata.maxDate}`,
            p.width - textOffset,
            p.height - textOffset);
        p.pop();

        // Credits
        p.push();
        p.noStroke();
        p.textFont(spaceMono);
        p.textSize(textSize);
        p.fill('white');
        const text = "Jaar, Nicolas. 'Mud' Cenizas. https://www.jaar.site/";
        p.text(text, 5, p.windowHeight - 5);
        p.pop();

        // Move objects if music is playing
        if (isPlaying) {
            const radiusOffset = mapBass;

            for (const circle of Object.values(circles)) {
                circle.move(radiusOffset, dtheta);
            };
        }

        // Draw circles
        for (const circle of Object.values(circles)) {

            let vibrationFactor = 1;
            if (isPlaying) {
                vibrationFactor = mapMid;
            }

            if (circle.isHovered()) {
                circle.updateHoverTimestamp(); // Update hover timestamp when hovered
            }

            circle.draw(vibrationFactor);
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
            const radiusOffset = mapBass;

            for (const circle of Object.values(circles)) {
                circle.move(-radiusOffset, 0);
            };
        }

        // Check if the About window should be shown
        if (aboutIsShowing) {
            // Draw the About window with a black background and some transparency
            p.push();
            p.fill(0, 0, 0, 200);  // Black color with transparency (alpha = 150)
            p.noStroke();
            p.rectMode(p.CENTER);
            p.rect(p.width / 2, p.height / 2, 2*structureRadius, structureRadius, 20);  // Rectangular window with rounded corners
            p.pop();

            // Add the white text inside the window
            p.push();
            p.fill(255);  // White text
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(textSize);
            p.text(aboutDreamsText, p.width / 2, p.height / 2);
            p.pop();
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

