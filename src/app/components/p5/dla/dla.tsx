import p5 from 'p5';

// USE DLA ALGORITHM

// 1. Create a seed
// 2. Create diffusing particles
// 3. When a particle comes close to another particle that's part of the aggregation, aggregate that one too
// 4. Repeat


export const MySketch = () => (p: p5) => {

    let particles: p5.Vector[] = [];
    let aggregate: p5.Vector[] = [];
    let radius = 2;
    const aggregationProbability = 0.7;
    const nParticles = 5000;
    const radialMovementAmplitude = 1;
    const branchParticleOffset = 5;

    p.setup = () => {
        p.createCanvas(800, 800);
        p.angleMode(p.DEGREES);

        // Initialize seed 
        aggregate.push(p.createVector(p.width / 2, p.height / 2));

        // Randomly generate diffusing particles 
        for (let i = 0; i < nParticles; i++) {
            particles.push(p.createVector(p.random(p.width), p.random(p.height)));
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

        // TODO have the particles have their own radius and color depending on where it gets aggregated (have them darker or smaller on the edges of the structure)

        // TODO instead of going through the whole thing, use the optimization techniques we implemented before with the hash map
        for (let point of aggregate) {
            let brightness = p.map(point.y, 0, p.height, 255, 50);
            p.fill(brightness, brightness, 255, 200);
            p.circle(point.x, point.y, 2 * radius);
        }

        // Move the particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let particle = particles[i];

            // Déplacement aléatoire avec biais
            // TODO this makes no sense, it doesn't make the central bias
            const dx = p.width / 2 - particle.x;
            const dy = p.height / 2 - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy); // Distance au centre

            // Normaliser le vecteur directionnel
            const dirX = dx / distance;
            const dirY = dy / distance;

            // Calcul des déplacements
            const movementX = radialMovementAmplitude * dirX;
            const movementY = radialMovementAmplitude * dirY;

            // Mise à jour des coordonnées de la particule
            particle.x += movementX;
            particle.y += movementY;


            // Contrainte : Garder les particules dans la fenêtre
            particle.x = p.constrain(particle.x, 0, p.width);
            particle.y = p.constrain(particle.y, 0, p.width);

            // Vérifier si elle touche la structure
            for (let a of aggregate) {
                if (distSq(particle, a) < (radius * 2) ** 2) {
                    if (Math.random() < aggregationProbability) {
                        aggregate.push(particle); // Ajouter la particule à l'agrégat
                        particles.splice(i, 1); // Retirer cette particule
                        // Introduce branching
                        if (Math.random() < 0.1) { // 10% chance to branch
                            let branchParticle = p.createVector(
                                particle.x + p.random(-branchParticleOffset, branchParticleOffset),
                                particle.y + p.random(-branchParticleOffset, branchParticleOffset)
                            );
                            aggregate.push(branchParticle);
                        }
                        break;
                    }
                }
            }

            // Dessiner la particule diffusante
            p.fill(100, 100, 255, 150);
            p.circle(particle.x, particle.y, 2 * radius);
        }

        // Terminer si toutes les particules sont agrégées
        if (particles.length === 0) {
            p.noLoop();
            console.log("Simulation terminée");
        }

    }

};

function distSq(a: p5.Vector, b: p5.Vector) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return dx * dx + dy * dy
}
