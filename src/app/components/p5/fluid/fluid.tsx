'use client';
import p5 from 'p5';


// We essentially compute the density of particles at any point and since we want to represent a fluid that's incompressible, with constance density,
// we move the particles such that they correct the density towards the density we expect of a fluid.
// To do that, we need to compute the gradient of density for 

export const MySketch = () => (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;
    const nParticles = 10;
    const particleRadius = 100;
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

        constructor(position: Position, velocity: Velocity, pressureForce: PressureForce) {
            this.position = position;
            this.velocity = velocity;
            this.pressureForce = pressureForce;
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
            const cellX = Math.round(point.x / this.spacing);
            const cellY = Math.round(point.y / this.spacing);
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

            for (let xi = minCellCoordinates.x; xi <= maxCellCoordinates.x; xi++) {
                for (let yi = minCellCoordinates.y; yi <= maxCellCoordinates.y; yi++) {
                    const h = this.hashCoords(new Position(xi, yi));
                    const start = this.cellStart[h];
                    const end = this.cellStart[h + 1];

                    for (let i = start; i < end; i++) {
                        this.queryIds[this.querySize] = this.cellEntries[i];
                        this.querySize++;
                    }
                }
            }

        }
    }


    p.setup = () => {
        p.createCanvas(width, height);

        p.frameRate(frameRate);

        // create N particles of radius R
        for (let i = 0; i < nParticles; i++) {
            const initialPosition = new Position(Math.round(Math.random() * width), Math.round(Math.random() * height));
            const initialVelocity = new Velocity(0, 0);
            const initialPressureForce = new PressureForce(0, 0);
            particles.push(new Particle(initialPosition, initialVelocity, initialPressureForce));
        };

    };

    p.draw = () => {

        p.background(0);
        p.fill(255);

        t = p.frameCount / frameRate;

        // Hash that shit
        const hash = new Hash(2 * influenceRadius, nParticles)
        const hash2 = new Hash(2 * influenceRadius, nParticles)
        hash.create(particles)
        hash2.create(particles)


        // Update the particle positions where they're supposed to be after t, with correct pressure forces
        for (let particleIndex = 0; particleIndex < particles.length; particleIndex++) {

            const particle = particles[particleIndex];

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

                const minDistance = 2*particleRadius;
                
                if ( distance <= minDistance ) {
                    // Separate the balls
                    const correction = (minDistance - distance)/2;
                    const normalDirection = [otherParticle.position.x - particle.position.x, otherParticle.position.y - particle.position.y];
                    particle.position.x += normalDirection[0] * correction;
                    particle.position.y += normalDirection[1] * correction;
                    otherParticle.position.x -= normalDirection[0] * correction;
                    otherParticle.position.y -= normalDirection[1] * correction;

                    // Reflect velocities along normal
                    const dotProductParticleNormal = particle.position.x * normalDirection[0] + particle.position.y * normalDirection[1];
                    const dotProductOtherParticleNormal = otherParticle.position.x * normalDirection[0] + otherParticle.position.y * normalDirection[1];

                    particle.velocity.x += normalDirection[0] * ( dotProductParticleNormal - dotProductOtherParticleNormal);
                    particle.velocity.y += normalDirection[1] * ( dotProductParticleNormal - dotProductOtherParticleNormal);
                    otherParticle.velocity.x -= normalDirection[0] * ( dotProductParticleNormal - dotProductOtherParticleNormal);
                    otherParticle.velocity.y -= normalDirection[1] * ( dotProductParticleNormal - dotProductOtherParticleNormal);
                }
            }
        }

        // Draw the particles where they're supposed to be
        for (let particle of particles) {
            p.circle(particle.position.x, particle.position.y, 2 * particleRadius);
            p.push();
            p.fill(0);
            p.text(`${particle.position.x}`, particle.position.x, particle.position.y);
            p.text(`${particle.position.y}`, particle.position.x, particle.position.y + 10);
            p.pop();
        }

    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

