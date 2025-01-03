import { Calculus } from '@/app/utils/Calculus';
import p5 from 'p5';

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
        const periodFrames = 60 * 64;
        const progress = Math.pow(Math.sin(this.p.PI * (this.p.frameCount / periodFrames)), 3);
        console.log(progress);
        const center = this.p.createVector(this.p.width / 2, this.p.height / 2);

        let yOffset = 0;
        for (let y = 0; y < this.rows; y++) {
            let xOffset = 0;
            for (let x = 0; x < this.cols; x++) {
                let index = x + y * this.cols;
                let noiseValue = p.noise(xOffset, yOffset, this.z);
                let angle = p.map(noiseValue, 0, 0.5, 0, p.TWO_PI);

                if ( this.withCircle ) {
                    let mag = 0.1;
                    const canvasX = x * this.scale;
                    const canvasY = y * this.scale;
                    const cellPositions = this.p.createVector(canvasX - center.x, canvasY - center.y);
                    const norm = cellPositions.mag();
                    if (norm > rMin && norm < rMax) {
                        let vector = this.p.createVector(canvasX - center.x, canvasY - center.y);
                        let tangDir = this.tangentialDirection(vector);
                        angle *= (1 - progress);
                        angle += Math.atan2(tangDir.y, tangDir.x);
                        mag = 1;
                    }
                } 
                // Create vector, center there and rotate it according to its heading
                let v = p5.Vector.fromAngle(angle);
                // Set Velocity magnitude
                v.setMag(0.1);
                // Populate the flowfield array with the vector
                this.data[index] = v;

                // Map noise value to a color
                // HSB 2PI to link colors to a wheel, 100 values are for saturation and brightness ranges
                if (show) {
                    p.push();
                    p.colorMode(p.HSB, p.TWO_PI, 100, 100);
                    p.stroke(angle, 30, 80);
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