import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5) => {
  const width = p.windowWidth;
  const height = p.windowHeight;
  let isPlaying = false;
  let hasReset = false;
  const c = 30;
  const rows = Math.round(height / c);
  const cols = Math.round(width / c);
  let gridState = new Array(rows);
  // Implement grid for internal activation logic
  for (let i = 0; i < rows; i++) {
    gridState[i] = new Array(cols).fill(0); // Initialize each row with zeros
  };
  let originalUsedGridState = new Array(rows);
  for (let i = 0; i < rows; i++) {
    originalUsedGridState[i] = new Array(cols).fill(0); // Initialize each row with zeros
  };
  let usedGridState = originalUsedGridState;

  let originalGridState = new Array(rows);
  for (let i = 0; i < rows; i++) {
    originalGridState[i] = new Array(cols).fill(0); // Initialize each row with zeros
  };
  originalGridState[Math.round(rows / 2) - 1][Math.round(cols / 2) + 1] = 1;
  originalGridState[Math.round(rows / 2) - 1][Math.round(cols / 2) - 1] = 1;
  originalGridState[Math.round(rows / 2) + 1][Math.round(cols / 2) + 1] = 1;
  originalGridState[Math.round(rows / 2) + 1][Math.round(cols / 2) - 1] = 1;

  const energy = 1;
  const genProb = 1;
  const frameRate = 24;

  const getIndexFromCellIndex = (cellIndex: number, i: number, j: number): [number, number] | undefined => {
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0], [1, 0],
      [-1, 1], [0, 1], [1, 1]
    ];
    const [dx, dy] = directions[cellIndex];
    if (i + dx >= 0 && i + dx < rows && j + dy >= 0 && j + dy < cols) {
      return [i + dx, j + dy];  // Return valid coordinates
    }
    return undefined;  // If out of bounds
  };

  function getRandomElements<T>(array: T[], n: number): T[] {
    const result: T[] = [];
    const indices = new Set<number>();

    while (indices.size < n) {
      const randomIndex = Math.floor(Math.random() * array.length);
      indices.add(randomIndex); // Ensures unique indices
    }

    indices.forEach(index => result.push(array[index]));
    return result;
  }

  const computeNeighbours = (gridState: Array<number[]>, i: number, j: number) => {
    return gridState[i + 1][j - 1] +
      gridState[i][j - 1] +
      gridState[i - 1][j - 1] +
      gridState[i - 1][j] +
      gridState[i - 1][j + 1] +
      gridState[i][j + 1] +
      gridState[i + 1][j + 1] +
      gridState[i + 1][j]
  };

  // TODO implement other way to slime
  // iterate over the motherCells, which are the cells created the latest having the power to generate new cells

  const computeNewGridState = (gridState: Array<number[]>, usedGridState: Array<number[]>) => {
    let newGridState = gridState.map(row => [...row]);
    let newUsedGridState = usedGridState.map(row => [...row]);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (usedGridState[i][j] === 1 || gridState[i][j] === 0) {
          continue;
        };

        // if this cell is on, check which cells to turn on next
        let generation = false;
        const possibleNeighbours = [newGridState[i + 1]?.[j - 1], newGridState[i]?.[j - 1], newGridState[i - 1]?.[j - 1], 
                                    newGridState[i - 1]?.[j],                           newGridState[i - 1]?.[j + 1], 
                                    newGridState[i]?.[j + 1], newGridState[i + 1]?.[j + 1], newGridState[i + 1]?.[j]].filter(cell => cell !== undefined);
        const emptyCells = possibleNeighbours.map((element, index) => element === 0 ? index : -1).filter(index => index !== -1);
        if (!emptyCells.length) {
          continue;
        };

        const cellsToTurnOn = getRandomElements(emptyCells, energy);

        // energy is the number of cells that could grow from a single source (number of directions, from 1 to n_neighbours)
        // Update the grid for the cells to turn on
        for (let cellIndex of cellsToTurnOn) {
          const rand = Math.random();
          if (rand <= genProb) {
            // Update newGridState at the corresponding position (based on cellIndex)
            const result = getIndexFromCellIndex(cellIndex, i, j);
            if (result) {
              const [dx, dy] = result; 
              // If that cell wasn't already turned on
              if (newGridState[dx][dy] === 0){
                newGridState[dx][dy] = 1; // Mark cell as turned on
                newUsedGridState[i][j] = 1;
                generation = true;
              };
            }
          }
        }
        /*
        if (generation === true) {
          newUsedGridState[i][j] = 1;
        };
        */
      };
    };
    return { newGridState, newUsedGridState };
  };

  // SOUND STUFF
  // _______________

  let sound: p5.SoundFile;
  //let fft: p5.FFT;

  //let elapsedSongTime = 0;
  //let isFinished = false;

  p.preload = () => {
    sound = p.loadSound('/music/Pomegranates-020-NicolasJaar-Muse.wav');
  };

  p.setup = () => {

    p.createCanvas(p.windowWidth, window.innerHeight);
    p.frameRate(frameRate); // Typical animation fps. If I want the animation to speed up, increase ball speed

    gridState = originalGridState;

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
      hasReset = true;
    });
  };

  p.draw = () => {
    let newGridState = gridState;
    let newUsedGridState = usedGridState;
    p.background(0, 16); // clear background at each iteration otherwise the circles will be drawn on top of eachother. Also add some transparency for fading effects.

    // Visualize grid
    p.stroke('white');
    p.strokeWeight(0.1);
    for (let i = 0; i < rows; i++) {
      p.line(0, i * c, c * cols, i * c);
    };

    for (let j = 0; j < cols; j++) {
      p.line(j * c, 0, j * c, c * rows);
    };

    if (hasReset){
      gridState = originalGridState.map((r: number[]) => [...r]);
      usedGridState = originalUsedGridState.map((r: number[]) => [...r]);
      hasReset = false;
      return
    };

    if (isPlaying) {
      // Compute new grid state
      ({ newGridState, newUsedGridState } = computeNewGridState(gridState, usedGridState));
    };

    p.rectMode(p.CENTER);
    p.fill('white');

    // Iterate over the grid to check which case to turn on
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (newGridState[i][j] === 1) {
          p.rect(j * c, i * c, c, c);
        };
      };
    };

    gridState = newGridState.map((r: number[]) => [...r]);
    usedGridState = newUsedGridState.map((r: number[]) => [...r]);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
