import p5 from "p5";

const directions = { "LEFT": new p5.Vector(-1, 0), "RIGHT": new p5.Vector(1, 0), "DOWN": new p5.Vector(0, -1), "UP": new p5.Vector(0, 1) };

export class SnakeSegment {
    position: p5.Vector;
    direction: p5.Vector;

    constructor(
        position: p5.Vector,
        direction: p5.Vector
    ) {
        this.position = position;
        this.direction = direction;
    }
}

export class Snake {
    segments: SnakeSegment[];
    headNextDirection: p5.Vector;
    thickness: number;
    velocity: number;
    length: p5.Vector;
    color: number[];
    headDirection: p5.Vector;

    constructor(
        segments: SnakeSegment[],
        thickness: number = 2,
        headNextDirection: p5.Vector = segments[0].direction,
        velocity: number = thickness,
        length: p5.Vector = new p5.Vector(0, 0),
        color = [255, 255, 255],
    ) {
        this.segments = segments;
        this.headDirection = segments[0].direction;
        this.headNextDirection = headNextDirection;
        this.velocity = velocity;
        this.color = color;
        this.thickness = thickness;
        this.length = length;
    }

    update() {
        // Use .copy() to keep original position and direction unchanged
        const resultMult = this.segments[0].direction.copy().mult(this.velocity);
        const newHeadPosition = this.segments[0].position.copy().add(resultMult);
        const newHeadDirection = this.headNextDirection;
        this.segments.unshift(new SnakeSegment(newHeadPosition, newHeadDirection));
        this.segments.pop();
    }

    show(p: p5) {
        p.push();
        p.stroke(0);
        p.fill(255);
        for (let segment of this.segments) {
            p.rect(segment.position.x, segment.position.y, this.thickness, this.thickness);
        }
        p.pop();
    }

    setNextDirection(nextDirection: p5.Vector) {
        this.headNextDirection = nextDirection;
    }

    edges(p: p5) {
        if (this.segments[0].position.x <= 1 || this.segments[0].position.x >= p.width || this.segments[0].position.y <= 1 || this.segments[0].position.y >= p.height) {
            // Choose random border
            const randomBorder = p.random([1, 2, 3, 4]);

            if (randomBorder === 1) {  // Top border
                this.segments[0].position.x = p.random(p.width);
                this.segments[0].position.y = 2;
                this.segments[0].direction = new p5.Vector(0, 1);
                this.headNextDirection = new p5.Vector(0, 1);
            } else if (randomBorder === 2) {  // RIGHT BORDER
                this.segments[0].position.y = p.random(p.height);
                this.segments[0].position.x = p.width;
                this.segments[0].direction = new p5.Vector(-1, 0);
                this.headNextDirection = new p5.Vector(-1, 0);
            } else if (randomBorder === 3) {  // BOTTOM BORDER
                this.segments[0].position.x = p.random(p.width);
                this.segments[0].position.y = p.height;
                this.segments[0].position.y = p.height;
                this.headNextDirection = new p5.Vector(0, -1);
            } else if (randomBorder === 4) {  // LEFT BORDER
                this.segments[0].position.y = p.random(p.height);
                this.segments[0].position.x = 2;
                this.segments[0].direction = new p5.Vector(1, 0);
                this.headNextDirection = new p5.Vector(1, 0);
            }
        }
    }
}