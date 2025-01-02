import p5 from 'p5';

export class FlowField {
    rows: number;
    cols: number;
    data: p5.Vector[];
    inc: number = 0.1;
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
        let yOffset = 0;
        for (let y = 0; y < this.rows; y++) {
            let xOffset = 0;
            for (let x = 0; x < this.cols; x++) {
                let index = x + y * this.cols;
                let angle = p.noise(xOffset, yOffset, this.z) * p.TWO_PI;
                // Create vector, center there and rotate it according to its heading
                let v = p5.Vector.fromAngle(angle);
                // Set Velocity magnitude
                v.setMag(0.1);
                // Populate the flowfield array with the vector
                this.data[index] = v;
                xOffset += this.inc;

                if (this.show) {
                    p.fill(255);
                    p.stroke(255, 10);
                    p.push();
                    p.translate(x * this.scale, y * this.scale);
                    p.rotate(v.heading());
                    p.line(0, 0, this.scale, 0);
                    p.pop();
                }
                yOffset += this.inc;
            }
        }
        this.z += this.deltaZ;
        return this.data
    }
}