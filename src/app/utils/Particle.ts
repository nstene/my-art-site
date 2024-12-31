export class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Velocity {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class PressureForce {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Particle {
    radius: number;
    position: Position;
    velocity: Velocity;
    pressureForce: PressureForce;
    color: number[];
    collided: boolean;

    constructor(radius: number, position: Position, velocity: Velocity = {x:0, y:0}, pressureForce: PressureForce = {x:0, y:0}, color=[255, 255, 255], collided=false) {
        this.position = position;
        this.velocity = velocity;
        this.pressureForce = pressureForce;
        this.color = color;
        this.collided = collided;
        this.radius = radius;
    }

    setColor(color: number[]) {
        this.color = color;
    }

    setRadius(radius: number) {
        this.radius = radius;
    }
}