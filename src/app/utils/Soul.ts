import p5 from "p5";

export class Soul {
    radius: number;
    position: p5.Vector;
    velocity: p5.Vector;
    color: number[];
    acceleration: p5.Vector;
    interactingWith: Soul[];
    nVertices: number;
    angle: number;
    visionDistance: number;
    dendriteLength: number;
    id: string;

    constructor(
        radius: number = 20,
        position: p5.Vector = new p5.Vector(0, 0),
        velocity: p5.Vector = new p5.Vector(0, 0),
        acceleration: p5.Vector = new p5.Vector(0, 0),
        id: string
    ) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.color = [255, 255, 255];
        this.interactingWith = [];
        this.radius = radius;
        this.angle = 0;
        this.nVertices = 6;
        this.visionDistance = 200;
        this.dendriteLength = 300;
        this.id = id;
    }

    draw(p: p5) {

        p.push();
        p.translate(this.position.x, this.position.y);
        p.rotate(p.TWO_PI / 360 * this.angle);
        p.translate(-this.position.x, -this.position.y)
        p.noFill();
        p.stroke(255);
        p.beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = p.TWO_PI / 6 * i;

            // Hexagon vertices
            let x = this.position.x + p.cos(angle) * this.radius;
            let y = this.position.y + p.sin(angle) * this.radius;
            p.vertex(x, y);
        }
        p.endShape(p.CLOSE);

        p.fill(255);
        p.circle(this.position.x, this.position.y, 20);
        p.pop();
    }

    rotate(rotationIncrement: number) {
        this.angle += rotationIncrement; // Increment the rotation angle
    }

    move() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.velocity.add(-this.acceleration);
        this.acceleration.setMag(0);
    }

    hasInteractionWith(otherSoul: Soul) {
        const distanceSqr = Math.pow((this.position.x - otherSoul.position.x), 2) + Math.pow((this.position.y - otherSoul.position.y), 2)
        return distanceSqr <= Math.pow(this.visionDistance, 2);
    }
}