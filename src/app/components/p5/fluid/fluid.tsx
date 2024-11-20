'use client';
import p5 from 'p5';


// We essentially compute the density of particles at any point and since we want to represent a fluid that's incompressible, with constance density,
// we move the particles such that they correct the density towards the density we expect of a fluid.
// To do that, we need to compute the gradient of density for 

export const MySketch = () => (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;
    const nParticles = 100;
    const particleRadius = 10;
    let particles: Particle[] = [];
    const initialVelocity = 0;
    const g = 0 / 10;
    const frameRate = 60;
    let t: number;
    const collisionDamp = 0.95;
    const influenceRadius = particleRadius * 50;
    let densities: number[] = [];
    const mass = 1;
    const targetDensity = 0.00001;
    const pressureMultiplier = 10;

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

    const ComputeDensity = (particles: Particle[], samplePoint: Position): number => {

        let density = 0;

        for (let particle of particles) {
            const distance = Math.hypot((particle.position.x - samplePoint.x), (particle.position.y - samplePoint.y));
            const influence = SmoothingKernel(influenceRadius, distance);
            density += mass * influence;
        }
        return density;
    };

    const UpdateDensities = (particles: Particle[], spatialLookup: Entry[], startIndices: number[]): number[] => {

        densities = [];
        for (let particle of particles) {
            const particlesToUse = ForeachPointWithinRadius(particles, particle, spatialLookup, startIndices);
            const density = ComputeDensity(particlesToUse, particle.position)
            densities.push(density);
        };

        return densities
    };

    const ComputePressureForce = (particles: Particle[], particle: Particle, density: number): PressureForce => {
        let pressureForce = [0, 0];

        for (let i = 0; i < particles.length; i++) {
            const distance = Math.hypot((particles[i].position.x - particle.position.x), (particles[i].position.y - particle.position.y));
            const slope = SmoothingKernelDerivative(influenceRadius, distance);
            const direction = [(particles[i].position.x - particle.position.x) / distance, (particles[i].position.y - particle.position.y) / distance];
            pressureForce[0] += ConvertDensityToPressure(density) * direction[0] * slope * mass / density;
            pressureForce[1] += ConvertDensityToPressure(density) * direction[1] * slope * mass / density;
        }

        return new PressureForce(pressureForce[0], pressureForce[1])
    }


    const ConvertDensityToPressure = (density: number): number => {
        const densityDiff = density - targetDensity;
        const pressure = densityDiff * pressureMultiplier
        return pressure
    };


    const ComputeSharedPressure = (densityA: number, densityB: number): number => {
        const sharedPressure = (ConvertDensityToPressure(densityA) + ConvertDensityToPressure(densityB)) / 2
        return sharedPressure
    };


    // Convert a position to the coordinate of the cell it is in
    const PositionToCellCoord = (point: Position, radius: number): Position => {
        const cellX = Math.round(point.x / radius);
        const cellY = Math.round(point.y / radius);
        return new Position(cellX, cellY)
    };


    // Convert a cell coordinate into a single number
    // Hash collisions (having different cells mapping to the same value) are unavoidable.
    const HashCell = (cellPosition: Position): number => {
        const a = cellPosition.x * 15823;
        const b = cellPosition.y * 9737333;
        return a + b
    };


    // Wrap the hash value around the length of the array (so it can be used as an index)
    const GetKeyFromHash = (hash: number, spatialLookup: Entry[]): number => {
        return hash % spatialLookup.length
    };


    const UpdateSpatialLookup = (particles: Particle[], influenceRadius: number): [Entry[], number[]] => {
        let startIndices = [];
        let spatialLookup: Entry[] = [];
        // Create spatial lookup
        for (let i = 0; i < particles.length; i++) {
            const cellCoordinates = PositionToCellCoord(particles[i].position, influenceRadius);
            const cellKey = GetKeyFromHash(HashCell(cellCoordinates), spatialLookup);
            spatialLookup[i] = new Entry(i, cellKey);
            startIndices[i] = Number.MAX_SAFE_INTEGER; // Initialize start indices
        }

        // Sort by cell key
        spatialLookup.sort();

        // Calculate start indices of each unique cell key in the spatial lookup
        for (let i = 0; i < particles.length; i++) {
            const key = spatialLookup[i].cellKey
            const keyPrev = i == 0 ? Number.MAX_SAFE_INTEGER : spatialLookup[i - 1].cellKey
            if (key != keyPrev) {
                startIndices[key] = i;
            }
        }
        return [spatialLookup, startIndices]
    }


    const ForeachPointWithinRadius = (particles: Particle[], particle: Particle, spatialLookup: Entry[], startIndices: number[]): Particle[] => {
        // Find which cell the sample point is in (make it the center of our 3x3 block)
        const centreCoord = PositionToCellCoord(particle.position, influenceRadius);
        const indicesToUse = [];
        const particlesToUse: Particle[] = [];

        // Loop over all cells of the 3x3 block around the center cell
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            for (let offsetY = -1; offsetY <= 1; offsetY++) {
                const cellCoord = new Position(centreCoord.x + offsetX, centreCoord.y + offsetY);
                const key = GetKeyFromHash(HashCell(cellCoord), spatialLookup);
                const cellStartIndex = startIndices[key];

                for (let i = cellStartIndex; i < spatialLookup.length; i++) {

                    // Exit loop if we're no longer looking at the correct cell
                    if (spatialLookup[i].cellKey != key) break;

                    const particleIndex = spatialLookup[i].particleIndex;

                    const distance = Math.hypot((particles[particleIndex].position.x - particle.position.x), (particles[particleIndex].position.y - particle.position.y));

                    // Double check if the point is within the radius
                    if (distance <= influenceRadius) {
                        // Add it to the particles to be used
                        indicesToUse.push(particleIndex);
                        particlesToUse.push(particles[particleIndex]);
                    }
                }
            }
        }
        //const density = ComputeDensity(particlesToUse, particle.position);
        //const pressureForce = ComputePressureForce(particlesToUse, particle, density);
        return particlesToUse
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

        // Update spatial look up
        const [spatialLookup, startIndices] = UpdateSpatialLookup(particles, influenceRadius);
        const densities = UpdateDensities(particles, spatialLookup, startIndices);

        let sum = 0;
        for (let i in particles) {
            sum += densities[i];
        }
        const mean_density = sum / densities.length

        p.push();
        p.noStroke();
        p.text(`${mean_density}`, 0, p.windowHeight / 2);
        p.pop();

        // Update the particle positions where they're supposed to be after t, with correct pressure forces
        for (let particleIndex = 0; particleIndex < particles.length; particleIndex++) {

            const particle = particles[particleIndex];

            const particlesToUse = ForeachPointWithinRadius(particles, particle, spatialLookup, startIndices)

            const pressureForce = ComputePressureForce(particlesToUse, particle, densities[particleIndex])

            let acceleration_y = g
            let acceleration_x = 0;
            if (densities[particleIndex] !== 0) {
                acceleration_y += pressureForce.y / densities[particleIndex];
                acceleration_x += pressureForce.x / densities[particleIndex];
            } 
            particle.velocity.y = acceleration_y * t;
            particle.velocity.x = acceleration_x * t;

            particle.position.y += particle.velocity.y * t;
            particle.position.x += particle.velocity.x * t;

            // Resolve collisions
            if ((particle.position.y + particleRadius) >= height || (particle.position.y - particleRadius) <= 0) {
                particle.position.y = Math.min(height - 1, Math.max(0, particle.position.y));
                particle.velocity.y *= -1 * collisionDamp;
            }

            if ((particle.position.x + particleRadius) >= width || (particle.position.x - particleRadius) <= 0) {
                particle.position.x = Math.min(width - 1, Math.max(0, particle.position.x));
                particle.velocity.x *= -1 * collisionDamp;
            }
        }

        // Draw the particles where they're supposed to be
        for (let particle of particles) {
            p.circle(particle.position.x, particle.position.y, particleRadius);
        }

    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

