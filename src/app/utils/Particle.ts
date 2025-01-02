import p5 from "p5";
import { FlowField } from "./FlowField";

export class Particle {
    radius: number;
    position: p5.Vector;
    velocity: p5.Vector;
    pressureForce: p5.Vector;
    color: number[];
    acceleration: p5.Vector;
    collided: boolean;
    maxSpeed = 2;
    prevPos: p5.Vector;

    constructor(
        radius: number = 2,
        position: p5.Vector = new p5.Vector(0, 0),
        velocity: p5.Vector = new p5.Vector(0, 0),
        acceleration: p5.Vector = new p5.Vector(0, 0),
        pressureForce: p5.Vector = new p5.Vector(0, 0),
        color = [255, 255, 255],
        collided = false,
    ) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.pressureForce = pressureForce;
        this.color = color;
        this.collided = collided;
        this.radius = radius;
        this.prevPos = this.position.copy();
    }

    setColor(color: number[]) {
        this.color = color;
    }

    setRadius(radius: number) {
        this.radius = radius;
    }

    update() {
        this.prevPos = this.position.copy();
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    applyForce(force: p5.Vector) {
        this.acceleration.add(force);
    }

    show(p: p5, asLine: boolean = false) {
        p.push();
        p.stroke(255);
        p.fill(255);
        p.line(this.position.x, this.position.y, this.prevPos.x, this.prevPos.y)
        p.pop();
        this.updatePrev();
    }

    updatePrev() {
        // When a particle hits a wall, its prevPos should be updated to avoid having lines plotted across the canvas
        this.prevPos = this.position;
    }

    edges(p: p5) {
        if (this.position.x <= 1) {
            this.position.x = p.width - 1;
            this.updatePrev();
        }
        else if (this.position.x >= p.width - 1) {
            this.position.x = 1;
            this.updatePrev();
        }
        if (this.position.y <= 1) {
            this.position.y = p.height - 1;
            this.updatePrev();
        }
        else if (this.position.y >= p.height) {
            this.position.y = 1;
            this.updatePrev();
        }
        this.position.x = p.constrain(this.position.x, 0, p.width);
        this.position.y = p.constrain(this.position.y, 0, p.height);
    }

    follow(flowField: Array<p5.Vector>, scale: number, cols: number) {
        const x = Math.floor(this.position.x / scale);
        const y = Math.floor(this.position.y / scale);
        const index = x + y * cols;
        const force = flowField[index];
        this.applyForce(force);
    }
}