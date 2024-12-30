import p5 from 'p5';
import { Hash } from '../../../utils/HashMap';
import { Particle } from '../../../utils/Particle';
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
    let radius = 2;
    const aggregationProbability = 0.7;
    const nParticles = 50000;
    const radialMovementAmplitude = 1;
    const branchParticleOffset = 5;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.angleMode(p.DEGREES);

        // Initialize seed 
        aggregatedParticles.push(new Particle(p.createVector(p.width / 2, p.height / 2)));

        // Randomly generate diffusing particles 
        for (let i = 0; i < nParticles; i++) {
            freeParticles.push(new Particle(p.createVector(p.random(p.width), p.random(p.height))));
        }
        /*
        for (let i = 0; i < nParticles; i++) {
            const randomNumber = Math.random();
            if (randomNumber <= 0.25) {
                // Top
                particles.push(p.createVector(p.random(p.width), 0));
            } else if (0.25 < randomNumber && randomNumber <= 0.5) {
                // Bottom
                particles.push(p.createVector(p.random(p.width), p.height));
            } else if (0.5 < randomNumber && randomNumber <= 0.75) {
                // Right
                particles.push(p.createVector(p.width, p.random(p.height)));
            } else if (0.75 < randomNumber) {
                // Left
                particles.push(p.createVector(0, p.random(p.height)));
            }
        }
        */
    }

    p.draw = () => {
        p.background(0, 50);

        // Draw aggregated particles
        p.noStroke();

        ////////////////////
        // DRAW PARTICLES //
        ////////////////////

        // Dessiner la particule diffusante
        for (let particle of freeParticles) {
            p.fill(100, 100, 255, 150);
            p.circle(particle.position.x, particle.position.y, 2 * radius);
        }

        console.log(aggregatedParticles.length);
        for (let point of aggregatedParticles) {
            let brightness = p.map(point.position.y, 0, p.height, 255, 50);
            p.fill(brightness, brightness, 255, 200);
            p.circle(point.position.x, point.position.y, 2 * radius);
        }

        // TODO have the particles have their own radius and color depending on where it gets aggregated (have them darker or smaller on the edges of the structure)

        // Make hash map of aggregated particles
        const maxDist = radius * 2;
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
            const movementX = radialMovementAmplitude * dirX;
            const movementY = radialMovementAmplitude * dirY;

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
            
            // Query all freeParticles within maxDist of aggregatedParticle in focus
            hash.query(freeParticle.position, maxDist);

            // If freeParticle in vincinity of any aggregatedParticle in HashMap, add it to the aggregatedParticles list 
            if ( hash.querySize > 0 ) {
                newAggregatedParticles.push(freeParticle); // Ajouter la particule à l'agrégat
                convertedFreeParticleIndices.push(i);
            }
        }

        removeElementsAtIndices(freeParticles, convertedFreeParticleIndices); // Retirer ces particules des freeParticles
        aggregatedParticles = newAggregatedParticles;

        // Terminer si toutes les particules sont agrégées
        if (freeParticles.length === 0) {
            p.noLoop();
            console.log("Simulation terminée");
        }
    }
};