import p5 from 'p5';
import { Hash } from '../../../utils/HashMap';
import { Particle } from '../../../utils/Particle';
import { Calculus } from '../../../utils/Calculus';

// USE DLA ALGORITHM

// 1. Create a seed
// 2. Create diffusing particles
// 3. When a particle comes close to another particle that's part of the aggregation, aggregate that one too
// 4. Repeat

function removeElementsAtIndices(array: any[], indices: number[]): number[] {
    indices.sort((a, b) => b - a);
  
    let removedElements = [];
    for (const index of indices) {
      if (index >= 0 && index < array.length) {
        removedElements.push(...array.splice(index, 1));
      }
    }
  
    return removedElements; // Return the removed elements
  }


export const MySketch = () => (p: p5) => {

    let freeParticles: Particle[] = [];
    let aggregatedParticles: Particle[] = [];
    const aggregatedParticleColor = [255, 255, 255];
    const freeParticleColor = [100, 100, 255, 150];
    const newFreeParticleColor = [255, 100, 100, 150];
    const initialRadius = 2;
    const terminalRadius = 20;
    const aggregationProbability = 1;
    const nParticlesMax = 10000;
    const nParticles = 2000;
    const radialMovementAmplitude = 2;
    const branchParticleOffset = 5;
    const brownianJiggle = 5;
    const generatingCircleRadius = p.min(p.windowWidth, p.windowHeight);

    function particleRadius(position: number[]): number {
        const progress = Math.sqrt((position[0] - p.width/2)**2 + (position[1] - p.height/2)**2)/Math.sqrt(p.width**2 + p.height**2);
        const easedProgressRadius = Calculus.easeOut(progress, 1.2);
        const r = p.map(easedProgressRadius, 0, 1, initialRadius, terminalRadius);
        return r
    }

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.angleMode(p.DEGREES);
        p.frameRate(120);

        // Initialize seed 
        aggregatedParticles.push(new Particle(initialRadius, p.createVector(p.width / 2, p.height / 2), p.createVector(0, 0), p.createVector(0, 0), aggregatedParticleColor));

        // Randomly generate diffusing particles on a circle
        for (let i = 0; i < nParticles; i++) {
            const angle = p.random(360);
            const x = generatingCircleRadius * p.cos(angle) + p.width/2;
            const y = generatingCircleRadius * p.sin(angle) + p.height/2;
            freeParticles.push(new Particle(initialRadius, p.createVector(x, y),  p.createVector(0, 0), p.createVector(0, 0), freeParticleColor));
        }
    }

    p.draw = () => {
        p.background(0, 50);

        // Draw aggregated particles
        //p.noStroke();

        ////////////////////
        // DRAW PARTICLES //
        ////////////////////

        // Dessiner la particule diffusante
        for (let particle of freeParticles) {
            p.fill(particle.color);
            p.circle(particle.position.x, particle.position.y, 2 * particle.radius);
        }

        console.log(aggregatedParticles.length);
        for (let point of aggregatedParticles) {
            p.fill(point.color);
            p.circle(point.position.x, point.position.y, 2 * point.radius);
        }

        // TODO have the particles have their own radius and color depending on where it gets aggregated (have them darker or smaller on the edges of the structure)

        // Make hash map of aggregated particles
        const maxDist = initialRadius * 2;
        const hash = new Hash(maxDist, aggregatedParticles.length);
        hash.create(aggregatedParticles);


        ////////////////////////
        // Move the particles //
        ////////////////////////

        for (let i = freeParticles.length - 1; i >= 0; i--) {
            let particle = freeParticles[i];

            // Déplacement aléatoire avec biais
            const dx = p.width / 2 - particle.position.x;
            const dy = p.height / 2 - particle.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy); // Distance au centre

            // Normaliser le vecteur directionnel
            const dirX = dx / distance;
            const dirY = dy / distance;

            // Calcul des déplacements
            const movementX = radialMovementAmplitude * dirX + p.random(-brownianJiggle, brownianJiggle);
            const movementY = radialMovementAmplitude * dirY + p.random(-brownianJiggle, brownianJiggle);

            // Mise à jour des coordonnées de la particule
            particle.position.x += movementX;
            particle.position.y += movementY;


            // Contrainte : Garder les particules dans la fenêtre
            particle.position.x = p.constrain(particle.position.x, 0, p.width);
            particle.position.y = p.constrain(particle.position.y, 0, p.width);
        
        }

        /////////////////////////
        // AGGREGATE PARTICLES //
        /////////////////////////

        // After having moved the free particles, loop over the aggregated particles and check which of the freeParticles should be aggregated
        let newAggregatedParticles = JSON.parse(JSON.stringify(aggregatedParticles));
        let convertedFreeParticleIndices = [];
        for (let i=0; i < freeParticles.length; i++) {
            
            const freeParticle = freeParticles[i];
            const newRadius = particleRadius([freeParticle.position.x, freeParticle.position.y]);
            
            // Query all freeParticles within maxDist of aggregatedParticle in focus
            hash.query(freeParticle.position, 2*newRadius);

            // If freeParticle in vincinity of any aggregatedParticle in HashMap, add it to the aggregatedParticles list 
            if ( hash.querySize > 0 && p.random() < aggregationProbability) {
                freeParticle.setColor(aggregatedParticleColor)
                freeParticle.setRadius(newRadius)
                newAggregatedParticles.push(freeParticle); // Ajouter la particule à l'agrégat
                convertedFreeParticleIndices.push(i);
            }
        }

        removeElementsAtIndices(freeParticles, convertedFreeParticleIndices); // Retirer ces particules des freeParticles
        aggregatedParticles = newAggregatedParticles;

        /////////////////////////////////////////////
        // Create new free particles at the border //
        /////////////////////////////////////////////

        // Randomly generate diffusing particles 
        const lastAggregatedParticle = aggregatedParticles[aggregatedParticles.length-1];
        const generationRadiusMin = Math.sqrt((lastAggregatedParticle.position.x - p.width/2)**2 + (lastAggregatedParticle.position.y - p.height/2)**2);
        const generationRadius = p.min(generationRadiusMin*5, p.min(p.width, p.height));
        for (let i = 0; i < convertedFreeParticleIndices.length; i++) {

            const randomAngle = p.random(360);

            let x = generationRadius * p.cos(randomAngle) + p.width/2;
            let y = generationRadius * p.sin(randomAngle) + p.height/2;

            /*
            if ( rand <= 0.25 ) {
                x = 1;
                y = p.random(p.height - 1);
            } else if ( rand > 0.25 && rand <= 0.5) {
                x = p.random(p.width - 1);
                y = 1;
            } else if ( rand > 0.5 && rand <= 0.75) {
                x = p.width - 1;
                y = p.random(p.height - 1);
            } else {
                x = p.random(p.width - 1);
                y = p.height - 1;
            }
            */
            freeParticles.push(new Particle(initialRadius, p.createVector(x, y), p.createVector(0, 0), p.createVector(0, 0), newFreeParticleColor));
        }

        // Terminer si toutes les particules sont agrégées
        if (aggregatedParticles.length >= nParticlesMax) {
            p.noLoop();
            console.log("Simulation terminée");
        }
    }
};