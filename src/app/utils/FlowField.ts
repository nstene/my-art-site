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

    constructor(rows: number, cols: number, deltaZ: number = 0, scale: number, show: boolean = false, p: p5) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        this.z = 0;
        this.deltaZ = deltaZ;
        this.scale = scale;
        this.show = show;

        this.generate(p)
    }

    generate(p: p5): Array<p5.Vector> {
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
                if (this.show) {
                    p.push();
                    p.colorMode(p.HSB, p.TWO_PI, 100, 100);
                    p.stroke(angle, 30, 80);
                    p.translate((x + 1 / 2) * this.scale, (y + 1 / 2) * this.scale);
                    p.rotate(v.heading());
                    p.line(0, 0, this.scale/2, 0);
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
}