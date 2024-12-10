import p5 from 'p5';

export const MySketch = () => (p: p5) => {
    type AnalysisData = {
        [name: string]: {
            frequency: number; // The number of times this person appears
            coOccurrences: {
                [coName: string]: number; // The number of times this person appears with another person
            };
        };
    };

    let analyzedDreamData: AnalysisData = {};
    let metadata : { dreamCount: number; minDate: string; maxDate: string } = {
        dreamCount : 0,
        minDate: '',
        maxDate: ''
    };
    let edges: { source: string, target: string, count: number }[] = [];
    const frameRate = 24;
    let dataLoaded = false;
    let circles: { [key: string]: Circle } = {};
    const structureRadius = 400;

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

        constructor(radius: number, position: Position, name: string) {
            this.position = position;
            this.radius = radius;
            this.name = name;
        }

        draw() {
            const x = this.position.r * Math.cos(p.radians(this.position.theta)) + p.width / 2;
            const y = this.position.r * Math.sin(p.radians(this.position.theta)) + p.height / 2;
            p.fill(255);
            p.circle(x, y, this.radius * 2);
        }

        move(angle: number) {
            this.position.theta += angle;
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
            return distance <= this.radius;
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
                dataLoaded = true;
                return { analyzedDreamData, metadata }
            }
        } catch (error) {
            console.error('Error fetching analysis:', error);
            return null
        }
    };

    p.setup = async () => {
        p.createCanvas(p.windowWidth, window.innerHeight);
        p.frameRate(frameRate);

        // Ensure some data is returned
        const data = await fetchAnalysis();
        if (!data) return;

        // Create circle objects
        let theta = 0;
        Object.entries(analyzedDreamData).forEach(([name, data]) => {
            const radius = data.frequency * 5;
            const position = new Position(structureRadius, theta);
            circles[name] = new Circle(radius, position, name);
            // Move to the next position for the next circle
            theta += 360 / Object.keys(analyzedDreamData).length;
        });

        Object.entries(analyzedDreamData).forEach(([name, data]) => {
            Object.entries(data.coOccurrences).forEach(([coName, count]) => {
                if (name < coName) {
                    edges.push({ source: name, target: coName, count });
                }
            });
        });

        console.log(edges); // Array of unique edges
    };

    p.draw = () => {
        p.background(0, 50);
        const periodSeconds = 60;
        const periodFrames = periodSeconds * frameRate;
        const dtheta = 360 / periodFrames;

        // Display metadata
        p.push();
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(15);
        p.text(`Dreams: ${metadata.dreamCount}\nBetween ${metadata.minDate}\nand ${metadata.maxDate}`,
            p.width - 100,
            p.height - 100);
        p.pop();

        // Draw objects
        for (let circle of Object.values(circles)) {
            circle.draw();
            if (circle.isHovered()) {
                p.push();
                p.fill(255);
                p.textAlign(p.CENTER);
                p.textSize(15);
                p.text(circle.name, p.width / 2, p.height / 2);
                p.pop();
            };
        };

        // Draw links
        for (let link of edges) {
            const sourceCircle = circles[link.source];
            const targetCircle = circles[link.target];
            p.push();
            p.stroke(255);
            p.strokeWeight(link.count);
            p.line(sourceCircle.getX(), sourceCircle.getY(), targetCircle.getX(), targetCircle.getY())
            p.pop();
        }

        // Move objects
        for (let circle of Object.values(circles)) {
            circle.move(dtheta);
        };
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

