import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import { subtract, max } from 'mathjs';

export const MySketch = () => (p: p5) => {
  const width = p.windowWidth;
  const height = p.windowHeight;
  const pixelsWidth = Math.round(width/2);
  const pixelsHeight = Math.round(height/2);
  let isPlaying = false;
  const speed = 10; 
  const dt = 0.2;
  const nAgents = 1;
  const evaporationSpeed = 0.05;
  const vision = 4;
  const turnSpeed = 30;
  const frameRate = 24;

  const black = [0, 0, 0];
  const white = [255, 255, 255];

  let trailMap = new Array(pixelsHeight);
  // Implement grid for internal activation logic
  for (let i = 0; i < pixelsHeight; i++) {
    trailMap[i] = new Array(pixelsWidth).fill(black); // Initialize each row with zeros
  };

  let diffusedTrailMap = new Array(pixelsHeight);
  // Implement grid for internal activation logic
  for (let i = 0; i < pixelsHeight; i++) {
    diffusedTrailMap[i] = new Array(pixelsWidth).fill(black); // Initialize each row with zeros
  };

  class Direction {
    x: number;
    y: number;
  
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }

  class Position {
    x: number;
    y: number;
  
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }

  class Agent {
    position: Position;  
    angle: number;  
  
    constructor(position: Position, angle: number) {
      this.position = position;
      this.angle = angle;
    }

    sense(trailMap: Array<[]>, vision: number, sensorAngleOffset: number){
      let sensorSize = Math.round(vision/2)
      let sensorAngle = this.angle + sensorAngleOffset;
      let sensorCenterX = this.position.x + Math.cos(sensorAngle) * sensorSize;
      let sensorCenterY = this.position.y + Math.sin(sensorAngle) * sensorSize;
      let sum = 0;
      for (let offsetX = -sensorSize; offsetX <= sensorSize; offsetX++){
        for (let offsetY = 1; offsetY <= vision; offsetY++){
            let sampleY = Math.round(sensorCenterY) + offsetY;
            let sampleX = Math.round(sensorCenterX) + offsetX;

            if (sampleX >= 0 && sampleX < pixelsWidth && sampleY >=0 && sampleY < pixelsHeight){
              sum =+ (trailMap[sampleY][sampleX][0] + trailMap[sampleY][sampleX][1] + trailMap[sampleY][sampleX][2]) / 3; 
            };
        };
      }; 
      return sum
    }
  }

  const lerp = (a: number, b: number, t: number) => a + t * (b - a);

  let agents: Agent[] = [] ;

  // SOUND STUFF
  // _______________

  let sound: p5.SoundFile;
  //let fft: p5.FFT;

  //let elapsedSongTime = 0;
  //let isFinished = false;

  p.preload = () => {
    sound = p.loadSound('/music/Pomegranates-020-NicolasJaar-Muse.wav');
  };

  // Create image specifying number of pixels in each dimension
  let img = p.createImage(pixelsWidth, pixelsHeight);

  p.setup = () => {

    p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(frameRate); // Typical animation fps. If I want the animation to speed up, increase ball speed

    // Sound stuff
    //fft = new p5.FFT(0.9, 512); // 512 is the number of bins. Increase for better resolution
    // Create play button
    const playButton = p.createButton('Play');
    playButton.position(0, 100);
    playButton.mousePressed(() => {
      if (!isPlaying) {
        sound.play();
        isPlaying = true;
      }
    });

    // Create pause button
    const pauseButton = p.createButton('Pause');
    pauseButton.position(0, 150);
    pauseButton.mousePressed(() => {
      sound.pause();
      isPlaying = false;
    });

    const resetButton = p.createButton('Reset');
    resetButton.position(0, 200);
    resetButton.mousePressed(() => {
      sound.pause();
      //hasReset = true;
    });

    // Create a number of agents that will travel around
    const initialPosition = new Position(Math.round(pixelsWidth/2), Math.round(pixelsHeight/2));
    for (let i = 0; i < nAgents; i++){
        const angle = Math.random() * p.TWO_PI;
        agents.push(new Agent(initialPosition, angle));
    };

    for (let agent of agents){
        trailMap[agent.position.y][agent.position.x] = white;
    };

  };

  p.draw = () => {

    p.background(0, 16); 

    // Move agents
    for (let agent of agents){
      let direction = new Direction(Math.cos(agent.angle), Math.sin(agent.angle));
      let newX = agent.position.x + direction.x * speed * dt;
      let newY = agent.position.y + direction.y * speed * dt;
      if (newX < 0 || newX >= pixelsWidth || newY < 0 || newY >= pixelsHeight){
        newX = Math.min(pixelsWidth - 1, Math.max(0, newX));
        newY = Math.min(pixelsHeight - 1, Math.max(0, newY));
        agent.angle = Math.random() * p.TWO_PI;
      };
      agent.position = new Position(Math.round(newX), Math.round(newY));
      trailMap[Math.min(agent.position.y, pixelsHeight - 1)][Math.min(agent.position.x, pixelsWidth - 1)] = white;
    };

    // Process trail map for evaporation
    let evaporatedTrailMap = trailMap;
    for (let i = 0; i < pixelsHeight; i++) {
      for (let j = 0; j < pixelsWidth; j++) {
        evaporatedTrailMap[i][j] = [Math.max(0, trailMap[i][j][0] - evaporationSpeed * dt),
            Math.max(0, trailMap[i][j][1] - evaporationSpeed * dt),
            Math.max(0, trailMap[i][j][2] - evaporationSpeed * dt)];
      }
    }

    // Process trail map for blurring
    let diffusedEvaporatedTrailMap = trailMap;
    // Loop over all pixel
    for (let i = 0; i < pixelsHeight; i++) {
      for (let j = 0; j < pixelsWidth; j++) {
        // Loop over grid around the pixel for doing average
        let blurredVal1 = 0;
        let blurredVal2 = 0;
        let blurredVal3 = 0;
        for (let offsetX = - 1; offsetX <= 1; offsetX++){
          for (let offsetY = - 1; offsetY <= 1; offsetY++){
            let sampleY = i + offsetY;
            let sampleX = j + offsetX;
            if (sampleX >= 0 && sampleX < pixelsWidth && sampleY >=0 && sampleY < pixelsHeight){
              blurredVal1 =+ evaporatedTrailMap[sampleY][sampleX][0];
              blurredVal2 =+ evaporatedTrailMap[sampleY][sampleX][1];
              blurredVal3 =+ evaporatedTrailMap[sampleY][sampleX][2];
            }
          }
        }

        let diffusedVal1 = lerp(trailMap[i][j][0], blurredVal1/2, evaporationSpeed * dt);
        let diffusedVal2 = lerp(trailMap[i][j][1], blurredVal2/2, evaporationSpeed * dt);
        let diffusedVal3 = lerp(trailMap[i][j][2], blurredVal3/2, evaporationSpeed * dt);

        diffusedEvaporatedTrailMap[i][j] = [Math.max(0, diffusedVal1 - evaporationSpeed * dt),
            Math.max(0, diffusedVal2 - evaporationSpeed * dt),
            Math.max(0, diffusedVal3 - evaporationSpeed * dt)];
      }
    }

    img.loadPixels();

    p.push();
    p.fill('white');
    p.text(`${agents[0].angle}`, 0, 250);
    p.text(`x: ${agents[0].position.x}`, 0, 300);
    p.text(`y: ${agents[0].position.y}`, 0, 350);
    p.pop();

    for (let agent of agents){
      // Steer direction based on the trails
      let sensorAngleOffset = 30;
      let weightLeft = agent.sense(diffusedEvaporatedTrailMap, vision, sensorAngleOffset);
      let weightRight = agent.sense(diffusedEvaporatedTrailMap, vision,  - sensorAngleOffset);
      let weightStraight = agent.sense(diffusedEvaporatedTrailMap, vision, 0);

      if (weightStraight > weightLeft && weightStraight > weightRight){
        agent.angle += 0;
      } else if (weightLeft > weightStraight && weightLeft > weightRight){
        agent.angle += turnSpeed / 360 * p.TWO_PI;
      } else if (weightRight > weightLeft && weightRight > weightStraight){
        agent.angle -= turnSpeed / 360 * p.TWO_PI;
      }
    }

    // Iterate over the grid and set pixels for each cell
    for (let i = 0; i < pixelsHeight; i++) {
      for (let j = 0; j < pixelsWidth; j++) {
        const color = diffusedEvaporatedTrailMap[i][j];  
        img.set(j, i, p.color(color));
      };
    };

    img.updatePixels();

    p.image(img, p.windowWidth/2 - pixelsWidth/2, p.windowHeight/2 - pixelsHeight/2);

  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
