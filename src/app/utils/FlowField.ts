import p5 from 'p5';

const saturationRange = 100;
const brightnessRange = 100;

export class FlowField {
    rows: number;
    cols: number;
    data: p5.Vector[];
    inc: number = 0.2;
    z: number;
    scale: number;
    show: boolean;
    deltaZ: number;
    p: p5;
    withCircle: boolean;

    constructor(rows: number, cols: number, deltaZ: number = 0, scale: number, p: p5, withCircle: boolean = false) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        this.z = 0;
        this.deltaZ = deltaZ;
        this.scale = scale;
        this.show = false;
        this.p = p;
        this.withCircle = withCircle;

        this.generate(p, this.show)
    }

    generate(p: p5, show: boolean = false): Array<p5.Vector> {
        const rMin = 300;
        const rMax = 400;
        const circlePeriodSeconds = 30;
        const circlePeriodFrames = circlePeriodSeconds * 64;
        const progressCircle = Math.pow(Math.sin(this.p.PI * (this.p.frameCount / circlePeriodFrames)), 2);
        const progressRays = Math.pow(Math.sin(this.p.PI * (this.p.frameCount / circlePeriodFrames) + this.p.PI / 2), 2);
        const progressNoise = Math.pow(Math.sin(2 * this.p.PI * (this.p.frameCount / circlePeriodFrames)), 2);

        // Make saturation cycle
        const saturationPeriodSeconds = 15;
        const saturationPeriodFrames = saturationPeriodSeconds * 64;

        const center = this.p.createVector(this.p.width / 2, this.p.height / 2);

        let yOffset = 0;
        for (let y = 0; y < this.rows; y++) {
            let xOffset = 0;
            for (let x = 0; x < this.cols; x++) {
                const index = x + y * this.cols;
                const noiseValue = p.noise(xOffset, yOffset, this.z);
                const angle = p.map(noiseValue, 0, 0.5, 0, p.TWO_PI);
                let angleFinish = angle;

                const canvasX = x * this.scale;
                const canvasY = y * this.scale;
                const cellPosition = this.p.createVector(canvasX - center.x, canvasY - center.y);
                const norm = cellPosition.mag();

                let mag = 0.1;
                if (this.withCircle) {
                    if (norm > rMin && norm < rMax) {
                        const tangDir = this.tangentialDirection(cellPosition);

                        const angleToCircle = Math.atan2(tangDir.y, tangDir.x);
                        const angleToRay = Math.atan2(cellPosition.y, cellPosition.x);

                        angleFinish =
                            progressNoise * angle + // Noise-based angle
                            progressCircle * angleToCircle +             // Circular behavior
                            progressRays * angleToRay;                   // Radial behavior
                        mag = 1;
                    }
                }
                // Create vector, center there and rotate it according to its heading
                const v = p5.Vector.fromAngle(angleFinish);
                // Set Velocity magnitude
                v.setMag(mag);
                // Populate the flowfield array with the vector
                this.data[index] = v;

                // Map noise value to a color
                // HSB 2PI to link colors to a wheel
                const modulatedSaturationMax = 60;
                const minSaturation = 20;
                const baseBrightness = 80;
                const saturationModulator = Math.pow(Math.sin(this.p.PI * (norm / this.p.max(this.p.width, this.p.height)) - this.p.frameCount / saturationPeriodFrames), 4);

                if (show) {
                    p.push();
                    p.colorMode(p.HSB, p.TWO_PI, saturationRange, brightnessRange);
                    p.stroke(angle, minSaturation + modulatedSaturationMax * saturationModulator, baseBrightness);
                    p.translate((x + 1 / 2) * this.scale, (y + 1 / 2) * this.scale);
                    p.rotate(v.heading());
                    p.line(0, 0, this.scale / 2, 0);
                    p.pop();
                }
                xOffset += this.inc;
            }
            yOffset += this.inc;
        }
        this.z += this.deltaZ;
        return this.data
    }

    tangentialDirection(vector: p5.Vector, clockwise: boolean = true): p5.Vector {
        if (clockwise) {
            return this.p.createVector(vector.y, -vector.x); // Clockwise
        } else {
            return this.p.createVector(-vector.y, vector.x); // Counterclockwise
        }
    }
}