import { Particle, Position } from './Particle';

export class Hash {
    spacing: number; // will probably be twice the influenceRadius
    tableSize: number;
    cellStart: number[];
    cellEntries: number[];
    queryIds: number[];
    querySize: number;
    particles: Particle[];

    constructor(spacing: number, maxNumObjects: number) {
        this.spacing = spacing;
        this.tableSize = 2 * maxNumObjects;
        this.cellStart = new Array(this.tableSize + 1);
        this.cellEntries = new Array(maxNumObjects);
        this.queryIds = new Array(maxNumObjects);
        this.querySize = 0;
        this.particles = [];
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

        this.particles = particles;
    }

    // Query the particles in a region
    query(regionCenter: Position, maxDist: number): Particle[] {
        const minPositionCoordinates = new Position(regionCenter.x - maxDist, regionCenter.y - maxDist);
        const minCellCoordinates = this.positionToCellCoord(minPositionCoordinates);

        const maxPositionCoordinates = new Position(regionCenter.x + maxDist, regionCenter.y + maxDist);
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
                    const particleId = this.cellEntries[i];
                    const particle = this.particles[particleId];

                    // Calculate distance from the region center to the particle
                    const distance = Math.sqrt(
                        Math.pow(particle.position.x - regionCenter.x, 2) + Math.pow(particle.position.y - regionCenter.y, 2)
                    );

                    // Only add particles within the maxDist from the region center
                    if (distance <= maxDist) {
                        uniqueParticles.add(particleId);
                    }
                }
            }
        }
        this.queryIds = Array.from(uniqueParticles);
        this.querySize = this.queryIds.length;

        const particlesInRegion = [];
        for (let i = 0; i < this.queryIds.length; i++) {
            const particle = this.particles[this.queryIds[i]];
            particlesInRegion.push(particle);
        }
        return particlesInRegion
    }
}
