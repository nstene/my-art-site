import { Soul } from "./Soul";
import p5 from "p5";

export class Souls {
    souls: Soul[];
    interactions: Array<Soul[]>;

    constructor(souls: Soul[]) {
        this.souls = souls;
        this.interactions = [];
    }

    draw(p: p5) {
        for (const soul of this.souls) {
            soul.draw(p);
        }
    }

    checkInteractions() {
        for (let i = 0; i < this.souls.length; i++) {
            for (let j = i + 1; j < this.souls.length; j++) {
                const soulA = this.souls[i];
                const soulB = this.souls[j];
                if (soulA.hasInteractionWith(soulB)) {
                    console.log(`Collision detected between ${soulA.id} and ${soulB.id}`);
                    this.interactions.push([soulA, soulB]);
                }
            }
        }
    }

    processInteractions(p: p5) {
        for (let pair of this.interactions) {
            let soulA = pair[0];
            let soulB = pair[1];
            const velDiff = p.createVector(soulA.velocity.x - soulB.velocity.x, soulA.velocity.y - soulB.velocity.y);
            velDiff.setMag(0.01);
            soulA.acceleration.add(velDiff);
            soulB.acceleration.add(velDiff);
        }
    }

    animate(p: p5) {
        for (const soul of this.souls) {
            soul.move();
            soul.rotate(0.1);
            soul.draw(p);
        }
    }

    showInteractions(p: p5) {
        const dendriteLength = 50;
        for (let pair of this.interactions) {
            let soulA = pair[0];
            let soulB = pair[1];
            const interactionDirection = p.createVector(soulB.position.x - soulA.position.x, soulB.position.y - soulA.position.y);
            interactionDirection.setMag(dendriteLength);
            const distanceSqr = Math.pow((soulA.position.x - soulB.position.x), 2) + Math.pow((soulA.position.y - soulB.position.y), 2)

            p.push();
            p.stroke(255, 0, 0);
            if ( distanceSqr <= Math.pow(2 * dendriteLength, 2) ) {
                p.strokeWeight(10);
            }
            p.line(soulA.position.x, soulA.position.y, soulA.position.x + interactionDirection.x, soulA.position.y + interactionDirection.y); // Draw a line between interacting hexagons
            p.line(soulB.position.x, soulB.position.y, soulB.position.x - interactionDirection.x, soulB.position.y - interactionDirection.y); // Draw a line between interacting hexagons
            p.pop();
        }   
    }
}