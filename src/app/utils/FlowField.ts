import { Tenali_Ramakrishna } from 'next/font/google';
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
    //img: p5.Image;

    constructor(rows: number, cols: number, deltaZ: number = 0, scale: number, p: p5) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        this.z = 0;
        this.deltaZ = deltaZ;
        this.scale = scale;
        this.show = false;
        this.p = p;
        //this.img = img;

        //this.generate(p, this.show)
        //this.createFlowFieldFromImage(img, p)
    }

    generate(p: p5, show: boolean = false): Array<p5.Vector> {
        let debugAngles = [];
        let debugNoise = [];
        let yOffset = 0;
        for (let y = 0; y < this.rows; y++) {
            let xOffset = 0;
            for (let x = 0; x < this.cols; x++) {
                let index = x + y * this.cols;
                let noiseValue = p.noise(xOffset, yOffset, this.z);
                let angle = p.map(noiseValue, 0, 0.5, 0, p.TWO_PI);
                debugAngles.push(angle);
                debugNoise.push(noiseValue);
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
        const sum = debugAngles.reduce((a, b) => a + b, 0);
        const avg = (sum / debugAngles.length) || 0;
        const sumNoise = debugNoise.reduce((a, b) => a + b, 0);
        const avgNoise = (sumNoise / debugNoise.length) || 0;
        console.log(avg);
        return this.data
    }

    createFlowFieldFromImage(
        //img: p5.Image,
    ): p5.Vector[] {
        let field: p5.Vector[] = [];

        //img.resize(this.cols, this.rows); // Resize the image to match the flow field resolution
        //img.loadPixels();
        //this.p.image(img, 0, 0, this.cols*this.scale, this.rows*this.scale);
        const center = this.p.createVector(this.p.width / 2, this.p.height / 2);

        const rMin = 300;
        const rMax = 400;

        let yOffset = 0;
        for (let y = 0; y < this.rows; y++) {
            let xOffset = 0;
            for (let x = 0; x < this.cols; x++) {
                this.p.colorMode(this.p.HSB, 100);
                //let index = (x + y * this.cols) * 4; // Index in pixel array (RGBA)
                //let r = img.pixels[index];
                //let g = img.pixels[index + 1];
                //let b = img.pixels[index + 2];

                // Calculate brightness or use another mapping (e.g., hue)
                //let brightness = this.p.brightness(this.p.color(r, g, b));
                let noiseValue = this.p.noise(xOffset, yOffset, this.z);
                let angle = this.p.map(noiseValue, 0, 0.5, 0, this.p.TWO_PI);
                let mag = 0.1;
                const canvasX = x*this.scale;
                const canvasY = y*this.scale;
                const cellPositions = this.p.createVector(canvasX - center.x, canvasY - center.y);
                const norm = cellPositions.mag();
                if (norm > rMin && norm < rMax) {
                    let vector = this.p.createVector(canvasX - center.x, canvasY - center.y);
                    let tangDir = this.tangentialDirection(vector);
                    const progress = this.p.map(this.p.frameCount%1000, 0, 1000, 0, 1, true)
                    angle *= (1 - progress);
                    angle += Math.atan2(tangDir.y, tangDir.x);
                    mag = 1;
                }

                // Create a vector and store it in the flow field
                let v = p5.Vector.fromAngle(angle);
                v.setMag(mag); // Set magnitude of the vector
                field.push(v);

                this.p.push();
                this.p.colorMode(this.p.HSB, this.p.TWO_PI, 100, 100);
                this.p.stroke(angle, 30, 80);
                this.p.translate((x + 1 / 2) * this.scale, (y + 1 / 2) * this.scale);
                this.p.rotate(v.heading());
                this.p.line(0, 0, this.scale / 2, 0);
                this.p.pop();
                
                xOffset += this.inc;
            }
            yOffset += this.inc;
        }
        this.z += this.deltaZ;
        return field;
    }

    tangentialDirection(vector: p5.Vector, clockwise: boolean = true): p5.Vector {
        if (clockwise) {
            return this.p.createVector(vector.y, -vector.x); // Clockwise
        } else {
            return this.p.createVector(-vector.y, vector.x); // Counterclockwise
        }
    }
}