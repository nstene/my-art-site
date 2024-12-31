import p5 from 'p5';
import { Hash } from '../../../utils/HashMap';
import { Particle } from '../../../utils/Particle';
import { Calculus } from '../../../utils/Calculus';
import { Palette } from '@/app/utils/Colorimetry';
import { MobileAdaptator } from '@/app/utils/MobileAdaptator';

// USE DLA ALGORITHM

// 1. Create a seed
// 2. Create diffusing particles
// 3. When a particle comes close to another particle that's part of the aggregation, aggregate that one too
// 4. Repeat

function removeElementsAtIndices(array: Particle[], indices: number[]) {
    indices.sort((a, b) => b - a);

    const removedElements = [];
    for (const index of indices) {
        if (index >= 0 && index < array.length) {
            removedElements.push(...array.splice(index, 1));
        }
    }

    return
}


export const MySketch = () => (p: p5) => {

    let freeParticles: Particle[] = [];
    let aggregatedParticles: Particle[] = [];
    const aggregatedParticleColor = [203, 108, 44]//[167, 36, 34];
    const freeParticleColor = [100, 100, 255, 150];
    const newFreeParticleColor = [255, 100, 100, 150];
    const initialRadius = 2;
    const terminalRadius = 20;
    const aggregationProbability = 1;
    const nParticlesMax = 10000;
    const nParticles = 2000;
    const radialMovementAmplitude = 2;
    const brownianJiggle = 5;
    const yellow = [217, 140, 48];
    const red = [217, 64, 50];
    const green = [111, 140, 96];
    const colorPalette = new Palette([green, yellow, red]);
    const colorGradientSteps = 30;
    const colorGradient = colorPalette.createGradient(colorGradientSteps);
    let fullscreenButton: p5.Element;
    let dropdown: p5.Element;
    let runButton: p5.Element;
    let run = false;
    let initialConditionsSelection: string;
    const onClickString = 'On click';
    const initialConditionsString = 'Initial conditions';
    const terminalMaxDensity = 3;
    const initialMaxDensity = 1.1;
    const replacementProbability = 0.9;

    function particleRadius(position: number[]): number {
        const progress = Math.sqrt((position[0] - p.width / 2) ** 2 + (position[1] - p.height / 2) ** 2) / Math.sqrt(p.width ** 2 + p.height ** 2);
        const easedProgressRadius = Calculus.easeOut(progress, 1.2);
        const r = p.map(easedProgressRadius, 0, 1, initialRadius, terminalRadius);
        return r
    }

    function particleColor(position: number[]): number[] {
        const progress = Math.sqrt((position[0] - p.width / 2) ** 2 + (position[1] - p.height / 2) ** 2) / Math.sqrt(p.width ** 2 + p.height ** 2);
        const easedProgressRadius = Calculus.easeOut(progress, 3);
        const step = p.floor(p.map(easedProgressRadius, 0, 1, 0, colorGradientSteps));
        return colorGradient[step]
    }

    function toggleFullScreen() {
        const isFullScreen = p.fullscreen(); // Check if currently in full-screen mode
        p.fullscreen(!isFullScreen); // Toggle full-screen mode
    }

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.angleMode(p.DEGREES);
        p.frameRate(64);

        // Create button for full screen mode
        let fullScreenButtonPosition = 100;
        let dropDownPosition = 150;
        let runButtonPosition = 200;
        let fontSize = '18px';
        if (MobileAdaptator.isMobileDevice()) {
            fullScreenButtonPosition = 50;
            dropDownPosition = 100;
            runButtonPosition = 150;
            fontSize = '12px';
        }
        fullscreenButton = p.createButton('Full Screen');
        fullscreenButton.position(0, fullScreenButtonPosition);
        fullscreenButton.mousePressed(toggleFullScreen);
        fullscreenButton.style('font-size', fontSize);

        // Create the dropdown menu
        dropdown = p.createSelect();
        dropdown.position(0, dropDownPosition);
        dropdown.child(p.createElement('option', initialConditionsString));
        dropdown.child(p.createElement('option', onClickString));
        dropdown.style('background-color', 'transparent');
        dropdown.style('color', 'white');
        dropdown.style('font-size', fontSize);
        // Add global styles for the unrolled options
        const styleTag = p.createElement('style', `
            select option {
            background-color: rgba(0, 0, 0); /* Semi-transparent black for options */
            color: white; /* White text for options */
            }
        `);
        styleTag.parent(document.head); // Attach to the document's head

        // Create run button
        runButton = p.createButton('Run');
        runButton.position(0, runButtonPosition);
        runButton.mousePressed(toggleRun);
        runButton.style('font-size', fontSize)

        // Initialize seed
        initialSeeding();
        if (String(dropdown.value()) === initialConditionsString) {
            initialConditions();
        }
    }

    p.draw = () => {
        p.background(0, 50);

        // Move agents if playing
        if (!run) {
            return;
        }

        ////////////////////
        // DRAW PARTICLES //
        ////////////////////

        // Dessiner la particule diffusante
        for (const freeParticle of freeParticles) {
            p.fill(freeParticle.color);
            p.circle(freeParticle.position.x, freeParticle.position.y, 2 * freeParticle.radius);
        }

        console.log(aggregatedParticles.length);
        for (const aggregatedParticle of aggregatedParticles) {
            p.fill(aggregatedParticle.color);
            p.circle(aggregatedParticle.position.x, aggregatedParticle.position.y, 2 * aggregatedParticle.radius);
        }

        // Make hash map of aggregated particles
        const maxDist = initialRadius * 2;
        const hash = new Hash(maxDist, aggregatedParticles.length);
        hash.create(aggregatedParticles);


        ////////////////////////
        // Move the particles //
        ////////////////////////

        for (let i = freeParticles.length - 1; i >= 0; i--) {
            const particle = freeParticles[i];

            // Déplacement aléatoire avec biais
            const dx = p.windowWidth / 2 - particle.position.x;
            const dy = p.windowHeight / 2 - particle.position.y;
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
            particle.position.x = p.constrain(particle.position.x, 0, p.windowWidth);
            particle.position.y = p.constrain(particle.position.y, 0, p.windowHeight);

        }

        /////////////////////////
        // AGGREGATE PARTICLES //
        /////////////////////////

        // After having moved the free particles, loop over the aggregated particles and check which of the freeParticles should be aggregated
        const newAggregatedParticles = JSON.parse(JSON.stringify(aggregatedParticles));
        const convertedFreeParticleIndices = [];
        const suppressedFreeParticleIndices = [];
        for (let i = 0; i < freeParticles.length; i++) {

            const freeParticle = freeParticles[i];
            const newRadius = particleRadius([freeParticle.position.x, freeParticle.position.y]);
            const newColor = particleColor([freeParticle.position.x, freeParticle.position.y]);

            // Query all freeParticles within maxDist of aggregatedParticle in focus
            hash.query(freeParticle.position, 2 * newRadius);

            // If freeParticle in vincinity of any aggregatedParticle in HashMap, add it to the aggregatedParticles list 
            if (hash.querySize > 0 && p.random() < aggregationProbability) {
                // If density is too high, don't aggregate it)
                const progress = newRadius / terminalRadius;
                const maxDensity = p.map(progress, 0, 1, initialMaxDensity, terminalMaxDensity);
                if (hash.querySize >= maxDensity) {
                    if (p.random() > replacementProbability) {
                        suppressedFreeParticleIndices.push(i);
                    }
                    continue;
                }
                freeParticle.setColor(newColor);
                freeParticle.setRadius(newRadius);
                newAggregatedParticles.push(freeParticle); // Ajouter la particule à l'agrégat
                convertedFreeParticleIndices.push(i);
            }
        }

        removeElementsAtIndices(freeParticles, convertedFreeParticleIndices.concat(suppressedFreeParticleIndices)); // Retirer ces particules des freeParticles
        aggregatedParticles = newAggregatedParticles;

        /////////////////////////////////////////////
        // Create new free particles at the border //
        /////////////////////////////////////////////

        if (initialConditionsSelection === onClickString && p.mouseIsPressed) {
            freeParticles.push(new Particle(initialRadius, p.createVector(p.mouseX, p.mouseY), p.createVector(0, 0), p.createVector(0, 0), newFreeParticleColor));
        }

        if (initialConditionsSelection === initialConditionsString) {

            // Randomly generate diffusing particles 
            const lastAggregatedParticle = aggregatedParticles[aggregatedParticles.length - 1];
            const generationRadiusMin = Math.sqrt((lastAggregatedParticle.position.x - p.width / 2) ** 2 + (lastAggregatedParticle.position.y - p.height / 2) ** 2);
            const generationRadius = p.random(generationRadiusMin * 2, p.min(generationRadiusMin * 5, p.min(p.width, p.height)));
            for (let i = 0; i < convertedFreeParticleIndices.length; i++) {

                const randomAngle = p.random(360);

                const x = generationRadius * p.cos(randomAngle) + p.width / 2;
                const y = generationRadius * p.sin(randomAngle) + p.height / 2;

                freeParticles.push(new Particle(initialRadius, p.createVector(x, y), p.createVector(0, 0), p.createVector(0, 0), newFreeParticleColor));
            }
        }

        // Terminer si toutes les particules sont agrégées
        if (aggregatedParticles.length >= nParticlesMax) {
            p.noLoop();
            console.log("Simulation terminée");
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    function initialSeeding() {
        aggregatedParticles.push(new Particle(initialRadius, p.createVector(p.windowWidth / 2, p.windowHeight / 2), p.createVector(0, 0), p.createVector(0, 0), aggregatedParticleColor));
    }

    function initialConditions() {
        initialConditionsSelection = String(dropdown.value());
        if (initialConditionsSelection === initialConditionsString) {
            // Randomly generate diffusing particles on a circle
            const generatingCircleRadius = p.min(p.width, p.height);
            for (let i = 0; i < nParticles; i++) {
                const angle = p.random(360);
                const x = 3 * generatingCircleRadius / 4 * p.cos(angle) + p.windowWidth / 2;
                const y = 3 * generatingCircleRadius / 4 * p.sin(angle) + p.windowHeight / 2;
                freeParticles.push(new Particle(initialRadius, p.createVector(x, y), p.createVector(0, 0), p.createVector(0, 0), freeParticleColor));
            }
        }
    }

    function toggleRun() {
        if (run) {
            // Stop simulation and reset
            runButton.html('Run');
            run = false;
            resetSketch();
        } else {
            // Start simulation
            runButton.html('Reset');
            initialConditionsSelection = String(dropdown.value());
            resetSketch();
            initialSeeding();
            if (initialConditionsSelection === initialConditionsString) {
                initialConditions();
            }
            run = true;
        }
    }

    function resetSketch() {
        aggregatedParticles = [];
        freeParticles = [];
        p.background(0);
    }
};