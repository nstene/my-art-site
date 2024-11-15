import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5) => {
  const width = p.windowWidth;
  const height = p.windowHeight;
  const pixelsWidth = Math.round(width / 2);
  const pixelsHeight = Math.round(height / 2);
  let isPlaying = false;
  const speed = 20;
  const dt = 0.2;
  let nAgentsInput: p5.Element;
  let randomnessInput: p5.Element;
  let visionInput: p5.Element;
  let button: p5.Element;
  let nAgents: number;
  let maxRandomAngle: number;
  let vision: number;
  const evaporationSpeed = 0.05;
  const turnSpeed = 2;
  const frameRate = 24;
  let hasReset = false;

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

    sense(trailMap: Array<[]>, vision: number, sensorAngleOffset: number) {
      let sensorSize = Math.round(vision / 2)
      let sensorAngle = this.angle + sensorAngleOffset;
      let sensorCenterX = this.position.x + Math.cos(sensorAngle) * sensorSize;
      let sensorCenterY = this.position.y + Math.sin(sensorAngle) * sensorSize;
      let sum = 0;
      for (let offsetX = -sensorSize; offsetX <= sensorSize; offsetX++) {
        for (let offsetY = 1; offsetY <= vision; offsetY++) {
          let sampleY = Math.round(sensorCenterY) + offsetY;
          let sampleX = Math.round(sensorCenterX) + offsetX;

          if (sampleX >= 0 && sampleX < pixelsWidth && sampleY >= 0 && sampleY < pixelsHeight) {
            sum = + (trailMap[sampleY][sampleX][0] + trailMap[sampleY][sampleX][1] + trailMap[sampleY][sampleX][2]) / 3;
          };
        };
      };
      return sum
    }
  }

  const lerp = (a: number, b: number, t: number) => a + t * (b - a);

  let agents: Agent[] = [];

  // SOUND STUFF
  // _______________

  let sound: p5.SoundFile;
  //let fft: p5.FFT;

  //let elapsedSongTime = 0;
  //let isFinished = false;

  p.preload = () => {
    sound = p.loadSound('/music/Nymphs-004-NicolasJaarfeatLorraine-No_One_Is_Looking_at_U.wav');
  };

  // Create image specifying number of pixels in each dimension
  let img = p.createImage(pixelsWidth, pixelsHeight);

  let playPauseButton: p5.Element;
  function togglePlayPause() {
    if (isPlaying) {
      sound.pause();
      playPauseButton.html('Play'); // Update button text to "Play"
      isPlaying = false;
    } else {
      sound.play();
      playPauseButton.html('Pause'); // Update button text to "Pause"
      isPlaying = true;
    }
  }

  function start() {
    nAgents = Number(nAgentsInput.value());
    maxRandomAngle = Number(randomnessInput.value());
    vision = Number(visionInput.value());

    // Clear the existing agents array
    agents = [];

    // Create new agents based on the input value
    for (let i = 0; i < nAgents; i++) {
      const initialPosition = new Position(
        Math.max(0, Math.round(Math.random() * pixelsWidth - 1)),
        Math.max(0, Math.round(Math.random() * pixelsHeight - 1))
      );
      const angle = Math.random() * p.TWO_PI;
      agents.push(new Agent(initialPosition, angle));
      trailMap[initialPosition.y][initialPosition.x] = white;
    }

    // Start playing the sound if it's not already playing
    if (!isPlaying) {
      togglePlayPause();
    }

    hasReset = false;
  }

  let isInputClicked = false;
  let isVisionInputClicked = false;
  let isRandomnessInputClicked = false;

  p.setup = () => {

    p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(frameRate); // Typical animation fps. If I want the animation to speed up, increase ball speed

    // INPUTS
    nAgentsInput = p.createInput();
    nAgentsInput.value('Number of agents');
    nAgentsInput.position(0, 400);
    nAgentsInput.style('color', 'white'); // Change text color to white
    nAgentsInput.style('background-color', 'black'); // Change background color to black
    nAgentsInput.style('border', '1px solid white');
    nAgentsInput.mousePressed(() => {
      if (!isInputClicked) {
        nAgentsInput.value(''); // Clear the input field on first click
        isInputClicked = false; // Set flag to prevent further clearing
      }
    });
    nAgentsInput.elt.onblur = () => {
      const inputValue = String(nAgentsInput.value()); // Cast the value to a string
      if (inputValue.trim() === '') {
        nAgentsInput.value('Number of agents'); // Reset to default if empty
        isInputClicked = false; // Reset the flag so user can clear it again
      }
    };

    visionInput = p.createInput();
    visionInput.value('Agent vision field');
    visionInput.position(0, 450);
    visionInput.style('color', 'white'); // Change text color to white
    visionInput.style('background-color', 'black'); // Change background color to black
    visionInput.style('border', '1px solid white');
    visionInput.mousePressed(() => {
      if (!isVisionInputClicked) {
        visionInput.value(''); // Clear the input field on first click
        isVisionInputClicked = false; // Set flag to prevent further clearing
      }
    });
    visionInput.elt.onblur = () => {
      const inputValue = String(nAgentsInput.value()); // Cast the value to a string
      if (inputValue.trim() === '') {
        visionInput.value('Agent vision field'); // Reset to default if empty
        isVisionInputClicked = false; // Reset the flag so user can clear it again
      }
    };

    randomnessInput = p.createInput();
    randomnessInput.value('Maximum movement randomness in degrees');
    randomnessInput.position(0, 500);
    randomnessInput.style('color', 'white'); // Change text color to white
    randomnessInput.style('background-color', 'black'); // Change background color to black
    randomnessInput.style('border', '1px solid white');
    randomnessInput.mousePressed(() => {
      if (!isRandomnessInputClicked) {
        randomnessInput.value(''); // Clear the input field on first click
        isRandomnessInputClicked = false; // Set flag to prevent further clearing
      }
    });
    randomnessInput.elt.onblur = () => {
      const inputValue = String(nAgentsInput.value()); // Cast the value to a string
      if (inputValue.trim() === '') {
        randomnessInput.value('Maximum movement randomness in degrees'); // Reset to default if empty
        isRandomnessInputClicked = false; // Reset the flag so user can clear it again
      }
    };

    // Create a button to submit the input
    button = p.createButton('Submit');
    button.position(0, 550);
    button.mousePressed(start);

    // Sound stuff
    //fft = new p5.FFT(0.9, 512); // 512 is the number of bins. Increase for better resolution
    // Create play button
    // Create play button
    playPauseButton = p.createButton('Play');
    playPauseButton.position(0, 100);
    playPauseButton.mousePressed(togglePlayPause);

    const resetButton = p.createButton('Reset');
    resetButton.position(0, 200);
    resetButton.mousePressed(() => {
      togglePlayPause();
      hasReset = true;
      trailMap = new Array(pixelsHeight).fill(0).map(() => new Array(pixelsWidth).fill(black));
      diffusedTrailMap = new Array(pixelsHeight).fill(0).map(() => new Array(pixelsWidth).fill(black));
      //start();
      p.clear();
      p.background(0); // Ensure the background is solid black after reset
    });

    // Create a number of agents that will travel around, randomly distributed across the map
    for (let i = 0; i < nAgents; i++) {
      const initialPosition = new Position(Math.max(0, Math.round(Math.random() * pixelsWidth - 1)), Math.max(0, Math.round(Math.random() * pixelsHeight) - 1));
      const angle = Math.random() * p.TWO_PI;
      agents.push(new Agent(initialPosition, angle));
      trailMap[initialPosition.y][initialPosition.x] = white;
    };
  };

  p.draw = () => {

    p.background(0, 16);
    
    // Credits
    p.push();
    p.noStroke();
    p.fill('white');
    const text = "Jaar, Nicolas. 'No One Is Looking at U' Nymphs. https://www.jaar.site/";
    p.text(text, 0, height);
    p.pop();

    if (p.keyIsPressed && p.key === ' ') {
      togglePlayPause();
    }

    p.image(img, p.windowWidth / 2 - pixelsWidth / 2, p.windowHeight / 2 - pixelsHeight / 2);

    // Move agents if playing
    if (!isPlaying) {
      return;
    }

    for (let agent of agents) {
      let direction = new Direction(Math.cos(agent.angle), Math.sin(agent.angle));

      let newX = agent.position.x + direction.x * speed * dt;
      let newY = agent.position.y + direction.y * speed * dt;

      // Handle case when agents meet a wall
      if (newX < 0 || newX >= pixelsWidth || newY < 0 || newY >= pixelsHeight) {
        newX = Math.min(pixelsWidth - 1, Math.max(0, newX));
        newY = Math.min(pixelsHeight - 1, Math.max(0, newY));
        agent.angle += p.PI + Math.sign(Math.random() - 0.5) * Math.random() * p.PI / 2; // goes back but with some randomness
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
        for (let offsetX = - 1; offsetX <= 1; offsetX++) {
          for (let offsetY = - 1; offsetY <= 1; offsetY++) {
            let sampleY = i + offsetY;
            let sampleX = j + offsetX;
            if (sampleX >= 0 && sampleX < pixelsWidth && sampleY >= 0 && sampleY < pixelsHeight) {
              blurredVal1 = + evaporatedTrailMap[sampleY][sampleX][0];
              blurredVal2 = + evaporatedTrailMap[sampleY][sampleX][1];
              blurredVal3 = + evaporatedTrailMap[sampleY][sampleX][2];
            }
          }
        }

        let diffusedVal1 = lerp(trailMap[i][j][0], blurredVal1 / 2, evaporationSpeed * dt);
        let diffusedVal2 = lerp(trailMap[i][j][1], blurredVal2 / 2, evaporationSpeed * dt);
        let diffusedVal3 = lerp(trailMap[i][j][2], blurredVal3 / 2, evaporationSpeed * dt);

        diffusedEvaporatedTrailMap[i][j] = [Math.max(0, diffusedVal1 - evaporationSpeed * dt),
        Math.max(0, diffusedVal2 - evaporationSpeed * dt),
        Math.max(0, diffusedVal3 - evaporationSpeed * dt)];
      }
    }

    img.loadPixels();

    for (let agent of agents) {
      // Steer direction based on the trails
      let sensorAngleOffset = 30;
      let weightLeft = agent.sense(diffusedEvaporatedTrailMap, vision, sensorAngleOffset);
      let weightRight = agent.sense(diffusedEvaporatedTrailMap, vision, - sensorAngleOffset);
      let weightStraight = agent.sense(diffusedEvaporatedTrailMap, vision, 0);

      // Add a tiny bit of randomness to direction (max 10 degrees)
      let noise = Math.random() * maxRandomAngle / 360 * p.TWO_PI
      if (weightStraight > weightLeft && weightStraight > weightRight) {
        agent.angle += noise;
      } else if (weightLeft > weightStraight && weightLeft > weightRight) {
        agent.angle += turnSpeed / 360 * p.TWO_PI + noise;
      } else if (weightRight > weightLeft && weightRight > weightStraight) {
        agent.angle -= turnSpeed / 360 * p.TWO_PI + noise;
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

  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
