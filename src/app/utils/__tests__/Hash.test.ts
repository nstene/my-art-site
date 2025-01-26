import '@testing-library/jest-dom';
import { Hash } from '../HashMap';
import { Particle } from '../Particle';
import p5 from 'p5'; 

describe('Hash', () => {
  test('query method should return the correct particles in the region', () => {
    // Create particles with known positions
    const particles = [
      new Particle(1, new p5.Vector(5, 5)),
      new Particle(1, new p5.Vector(15, 15)),
      new Particle(1, new p5.Vector(25, 25)),
      new Particle(1, new p5.Vector(35, 35)),
    ];

    // Initialize the hash grid with spacing = 10 and maxNumObjects = 10
    const hash = new Hash(10, 10);

    // Create the hash grid with particles
    hash.create(particles);

    // Query particles within a region centered at (10, 10) with maxDist = 10
    const regionCenter = new p5.Vector(10, 10);
    const maxDist = 10;
    const result = hash.query(regionCenter, maxDist);

    // Expected particles: Only the first and second particles are within the region
    const expected = [particles[0], particles[1]];

    const resultSorted = result.sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y);
    const expectedSorted = expected.sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y);

    console.log(resultSorted);
    console.log(expectedSorted);

    // Check that the result matches the expected particles
    expect(resultSorted).toEqual(expectedSorted);

    // Query a larger region
    const largerRegionCenter = new p5.Vector(20, 20);
    const largerMaxDist = 15;
    const largerResult = hash.query(largerRegionCenter, largerMaxDist);

    // Expected particles: The second and third particles are in the larger region
    const largerExpected = [particles[1], particles[2]];

    const largerResultSorted = largerResult.sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y);
    const largerExpectedSorted = largerExpected.sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y);

    console.log(largerResultSorted);
    console.log(largerExpectedSorted);

    // Check that the result matches the expected particles
    expect(largerResultSorted).toEqual(largerExpectedSorted);
  });
});
