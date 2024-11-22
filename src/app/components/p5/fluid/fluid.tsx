'use client';
import p5 from 'p5';


// We essentially compute the density of particles at any point and since we want to represent a fluid that's incompressible, with constance density,
// we move the particles such that they correct the density towards the density we expect of a fluid.
// To do that, we need to compute the gradient of density for 

export const MySketch = () => (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;
    const nParticles = 50;
    const particleRadius = 10;
    let particles: Particle[] = [];
    const initialVelocity = 0;
    const g = 0 / 10;
    const frameRate = 40;
    let t: number;
    const collisionDamp = 0;
    const influenceRadius = particleRadius * 2;
    let densities: number[] = [];
    const mass = 1;
    const targetDensity = 0.00001;
    const pressureMultiplier = 10e3;
    const maxDist = 2 * particleRadius; // see what it changes?
    const minDistance = 2*particleRadius;

    class Position {
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

    class Particle {
        position: Position;
        velocity: Velocity;
        pressureForce: PressureForce;
        color: number[];
        collided: boolean;

        constructor(position: Position, velocity: Velocity, pressureForce: PressureForce, color=[255, 255, 255], collided=false) {
            this.position = position;
            this.velocity = velocity;
            this.pressureForce = pressureForce;
            this.color = color;
            this.collided = collided;
        }
    }

    class Entry {
        particleIndex: number;
        cellKey: number;

        constructor(particleIndex: number, cellKey: number) {
            this.particleIndex = particleIndex;
            this.cellKey = cellKey;
        }
    }


    const SmoothingKernel = (influenceRadius: number, distance: number): number => {

        const normalizationFactor = p.PI * Math.pow(influenceRadius, 4) / 6;
        const smoothingValue = influenceRadius - distance

        return smoothingValue ** 2 / normalizationFactor;
    };

    const SmoothingKernelDerivative = (influenceRadius: number, distance: number): number => {

        if (distance >= influenceRadius) {
            return 0
        }

        return - 12 * (influenceRadius - distance) / p.PI / Math.pow(influenceRadius, 4)
    }


    const ConvertDensityToPressure = (density: number): number => {
        const densityDiff = density - targetDensity;
        const pressure = densityDiff * pressureMultiplier;
        return pressure
    };


    const ComputeSharedPressure = (densityA: number, densityB: number): number => {
        const sharedPressure = (ConvertDensityToPressure(densityA) + ConvertDensityToPressure(densityB)) / 2
        return sharedPressure
    };


    class Hash {
        spacing: number; // will probably be twice the influenceRadius
        tableSize: number;
        cellStart: number[];
        cellEntries: number[];
        queryIds: number[];
        querySize: number;

        constructor(spacing: number, maxNumObjects: number) {
            this.spacing = spacing;
            this.tableSize = 2 * maxNumObjects;
            this.cellStart = new Array(this.tableSize + 1);
            this.cellEntries = new Array(maxNumObjects);
            this.queryIds = new Array(maxNumObjects);
            this.querySize = 0;
        }


        // Converts particle coordinates into cell coordinates
        positionToCellCoord(point: Position): Position {
            const cellX = Math.floor(point.x / this.spacing);
            const cellY = Math.floor(point.y / this.spacing);
            return new Position(cellX, cellY)
        };


        // Convert a cell coordinate into a single number
        // Hash collisions (having different cells mapping to the same value) are unavoidable.
        hashCoords(cellPosition: Position): number {
            const prime1 = 73856093; // Large prime numbers for hashing
            const prime2 = 19349663;
            const h = (cellPosition.x * prime1 + cellPosition.y * prime2) % this.tableSize;
            return h < 0 ? h + this.tableSize : h; // Ensure positive hash value
        }


        // Takes the position of a particle and returns the hash = index in the flat grid array
        hashPos(position: Position): number {
            return this.hashCoords(this.positionToCellCoord(position));
        }


        // Create the grid hasing
        create(particles: Particle[]) {
            let numObjects = Math.min(particles.length, this.cellEntries.length);

            // determine cell sizes

            this.cellStart.fill(0);
            this.cellEntries.fill(0);

            for (let i = 0; i < numObjects; i++) {
                let h = this.hashPos(particles[i].position);
                this.cellStart[h]++;
            }

            // determine cells starts

            let start = 0;
            for (let i = 0; i < this.tableSize; i++) {
                start += this.cellStart[i];
                this.cellStart[i] = start;
            }
            this.cellStart[this.tableSize] = start; // guard

            // fill in objects ids

            for (let i = 0; i < numObjects; i++) {
                let h = this.hashPos(particles[i].position);
                this.cellStart[h]--;
                this.cellEntries[this.cellStart[h]] = i;
            }
        }


        // Query the particles around the one
        query(particles: Particle[], nr: number, maxDist: number) {
            const minPositionCoordinates = new Position(particles[nr].position.x - maxDist, particles[nr].position.y - maxDist);
            const minCellCoordinates = this.positionToCellCoord(minPositionCoordinates);

            const maxPositionCoordinates = new Position(particles[nr].position.x + maxDist, particles[nr].position.y + maxDist);
            const maxCellCoordinates = this.positionToCellCoord(maxPositionCoordinates);

            this.querySize = 0;
            this.queryIds = [];
            const uniqueParticles = new Set<number>();

            for (let xi = minCellCoordinates.x; xi <= maxCellCoordinates.x; xi++) {
                for (let yi = minCellCoordinates.y; yi <= maxCellCoordinates.y; yi++) {
                    const h = this.hashCoords(new Position(xi, yi));
                    const start = this.cellStart[h];
                    const end = this.cellStart[h + 1];

                    for (let i = start; i < end; i++) {
                        uniqueParticles.add(this.cellEntries[i]);
                    }
                }
            }
            this.queryIds = Array.from(uniqueParticles);
            this.querySize = this.queryIds.length;
        }
    }


    p.setup = () => {
        p.createCanvas(width, height);

        p.frameRate(frameRate);

        // create N particles of radius R
        for (let i = 0; i < nParticles; i++) {
            const initialVelocityX = 2*(0.5 - Math.random());
            const initialVelocityY = 2*(0.5 - Math.random());;
            let initialPosition = new Position(0, 0);

            let overlap = true;
            // create new particle and check for overlaps
            while ( overlap ){
                overlap = false;
                initialPosition = new Position(Math.round(Math.random() * width), Math.round(Math.random() * height));
                for ( let particle of particles ) {
                    const distance = Math.hypot((initialPosition.x - particle.position.x), (initialPosition.y - particle.position.y));
                    if ( distance <= minDistance ) {
                        overlap = true;
                        break;
                    }
                }
            }
            const initialVelocity = new Velocity(initialVelocityX, initialVelocityY);
            const initialPressureForce = new PressureForce(0, 0);
            particles.push(new Particle(initialPosition, initialVelocity, initialPressureForce));
        };
    };

    p.draw = () => {

        p.background(0);
        p.fill(255);

        t = p.frameCount / frameRate;

        // Hash that shit
        const hash = new Hash(maxDist, nParticles);
        hash.create(particles);


        // Update the particle positions where they're supposed to be after t, with correct pressure forces
        for (let particleIndex = 0; particleIndex < particles.length; particleIndex++) {

            const particle = particles[particleIndex];
            particle.collided = false;
            let normalDirection = [0, 0];

            particle.position.y += particle.velocity.y * t;
            particle.position.x += particle.velocity.x * t;

            /*
            hash.query(particles, particleIndex, maxDist);

            // Compute density
            let density = 0;
            for (let i = 0; i < hash.querySize; i++) {
                const otherParticle = particles[hash.queryIds[i]];

                let distance = 0;
                try {
                    distance = Math.hypot((otherParticle.position.x - particle.position.x), (otherParticle.position.y - particle.position.y));
                } catch {
                    continue;
                }
                const influence = SmoothingKernel(influenceRadius, distance);
                density += mass * influence;
            }

            // Compute pressure force
            let pressureForce = [0, 0];
            for (let j = 0; j < hash.querySize; j++) {
                const otherParticle = particles[hash.queryIds[j]];

                let distance = 0;
                try {
                    distance = Math.hypot((otherParticle.position.x - particle.position.x), (otherParticle.position.y - particle.position.y));
                } catch {
                    continue;
                }

                if (distance <= 10e-8) {
                    // we're probably comparing a particle to itself
                    continue;
                }

                // Compute density for other particle neighbourhood
                hash2.query(particles, hash.queryIds[j], maxDist);
                let densityOtherParticle = 0;
                for (let k = 0; k < hash2.querySize; k++) {
                    const thirdParticle = particles[hash2.queryIds[k]];

                    let newDistance = 0;
                    try {
                        newDistance = Math.hypot((thirdParticle.position.x - otherParticle.position.x), (thirdParticle.position.y - otherParticle.position.y));
                    } catch {
                        continue;
                    }
                    const influence = SmoothingKernel(influenceRadius, newDistance);
                    densityOtherParticle += mass * influence;
                }

                // Shared pressure and pressure force
                const slope = SmoothingKernelDerivative(influenceRadius, distance);
                const direction = [(otherParticle.position.x - particle.position.x) / distance, (otherParticle.position.y - particle.position.y) / distance];
                const sharedPressure = ComputeSharedPressure(density, densityOtherParticle);
                if (density <= 10e-8) {
                    continue;
                }
                pressureForce[0] += sharedPressure * direction[0] * slope * mass / density;
                pressureForce[1] += sharedPressure * direction[1] * slope * mass / density;
            }

            
            let acceleration_y = g;
            let acceleration_x = 0;

            if (density >= 10e-8) {
                acceleration_y += pressureForce[1] / density;
                acceleration_x += pressureForce[0] / density;
            }

            particle.velocity.y = acceleration_y * t;
            particle.velocity.x = acceleration_x * t;

            particle.position.y += particle.velocity.y * t;
            particle.position.x += particle.velocity.x * t;

            */

            // Resolve world collisions
            if ((particle.position.y + particleRadius) >= height || (particle.position.y - particleRadius) <= 0) {
                particle.position.y = Math.min(height - particleRadius, Math.max(particleRadius, particle.position.y));
                particle.velocity.y *= -1 * ( 1 - collisionDamp );
            }

            if ((particle.position.x + particleRadius) >= width || (particle.position.x - particleRadius) <= 0) {
                particle.position.x = Math.min(width - particleRadius, Math.max(particleRadius, particle.position.x));
                particle.velocity.x *= -1 * ( 1 - collisionDamp );
            }

            // Check for overlaps
            hash.query(particles, particleIndex, 2.0 * particleRadius);
            for (let i = 0; i < hash.querySize; i++) {
                const otherParticle = particles[hash.queryIds[i]];

                let distance = 0;
                try {
                    distance = Math.hypot((otherParticle.position.x - particle.position.x), (otherParticle.position.y - particle.position.y));
                } catch {
                    continue;
                }

                if ( distance <= 10e-8 ) {
                    continue;
                }
                
                if ( distance <= minDistance ) {

                    particle.collided = true;
                    otherParticle.collided = true;

                    // Separate the balls
                    const correction = (minDistance - distance)/2;
                    const norm = Math.sqrt((otherParticle.position.x - particle.position.x)**2 + (otherParticle.position.y - particle.position.y)**2);
                    normalDirection = [(otherParticle.position.x - particle.position.x)/norm, (otherParticle.position.y - particle.position.y)/norm];
                    particle.position.x -= normalDirection[0] * correction;
                    particle.position.y -= normalDirection[1] * correction;
                    otherParticle.position.x += normalDirection[0] * correction;
                    otherParticle.position.y += normalDirection[1] * correction;
                    const newNorm = Math.sqrt((otherParticle.position.x - particle.position.x)**2 + (otherParticle.position.y - particle.position.y)**2);

                    // Reflect velocities along normal
                    const dotProductParticleNormal = particle.velocity.x * normalDirection[0] + particle.velocity.y * normalDirection[1];
                    const dotProductOtherParticleNormal = otherParticle.velocity.x * normalDirection[0] + otherParticle.velocity.y * normalDirection[1];

                    particle.velocity.x -= normalDirection[0] * ( dotProductParticleNormal - dotProductOtherParticleNormal);
                    particle.velocity.y -= normalDirection[1] * ( dotProductParticleNormal - dotProductOtherParticleNormal);
                    otherParticle.velocity.x += normalDirection[0] * ( dotProductParticleNormal - dotProductOtherParticleNormal);
                    otherParticle.velocity.y += normalDirection[1] * ( dotProductParticleNormal - dotProductOtherParticleNormal);
                }
            }

            p.push();
            let color = [255, 255, 255];
            if ( particle.collided ) {
                color = [255, 0, 0];
            }
            p.pop();
            p.push();
            p.fill(color);
            p.circle(particle.position.x, particle.position.y, 2 * particleRadius);
            p.push();
            p.noFill();
            p.stroke(255, 0, 0)
            p.circle(particle.position.x, particle.position.y, 2 * influenceRadius);
            p.pop();
            p.push();
            p.fill(0);
            p.text(`${particle.position.x}`, particle.position.x, particle.position.y);
            p.text(`${particle.position.y}`, particle.position.x, particle.position.y + 10);
            p.pop();
            // Draw normal direction
            p.push();
            p.fill([0, 0, 0])
            p.stroke([0, 0, 0])
            p.line(particle.position.x, particle.position.y, particle.position.x + normalDirection[0]*100, particle.position.y + normalDirection[1]*100);
            p.pop();
            // Draw velocity
            p.push();
            p.fill([0, 0, 0])
            p.stroke([0, 255, 0])
            p.line(particle.position.x, particle.position.y, particle.position.x + particle.velocity.x*50, particle.position.y + particle.velocity.y*50);
            p.pop();


        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

