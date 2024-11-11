import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5, parentRef: HTMLDivElement) => {
  const width = p.windowWidth;
  const height = p.windowHeight;
  let isPlaying = false;
  const c = 5;
  const rows = Math.round(height/c);
  const cols = Math.round(width/c);
  const gridState = new Array(rows);

  const computeNewGridState = (gridState: Array<number>) => {
        let newGridState =  gridState;
    return { newGridState }; 
  };

  // SOUND STUFF
  // _______________

  let sound: p5.SoundFile;
  let fft: p5.FFT;

  var elapsedSongTime = 0;
  const frameRate = 60
  let isFinished = false;

  p.preload = () => {
    sound = p.loadSound('/music/Pomegranates-020-NicolasJaar-Muse.wav');
  };

  p.setup = () => {
    
    const canvas = p.createCanvas(p.windowWidth, window.innerHeight);
    p.frameRate(frameRate); // Typical animation fps. If I want the animation to speed up, increase ball speed

    // Implement grid for internal activation logic
    for (let i = 0; i < rows; i++) {
        gridState[i] = new Array(cols).fill(0); // Initialize each row with zeros
    };   

    gridState[Math.round(rows/2) - 1][Math.round(cols/2) + 1] = 1;
    gridState[Math.round(rows/2) - 1][Math.round(cols/2) - 1] = 1;
    gridState[Math.round(rows/2) + 1][Math.round(cols/2) + 1] = 1;
    gridState[Math.round(rows/2) + 1][Math.round(cols/2) - 1] = 1;
    
    // Sound stuff
    fft = new p5.FFT(0.9, 512); // 512 is the number of bins. Increase for better resolution
    // Create play button
    const playButton = p.createButton('Play');
    playButton.position(0, 100);
    playButton.mousePressed(() => {
      if (!isPlaying){
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
};

  p.draw = () => {    
    p.background(0, 16); // clear background at each iteration otherwise the circles will be drawn on top of eachother. Also add some transparency for fading effects.
    
    // Visualize grid
    p.stroke('white');
    p.strokeWeight(0.1);
    for (let i = 0; i < rows; i++){
        p.line(0, i*c, c*cols, i*c);
    };

    for (let j = 0; j < cols; j++){
        p.line(j*c, 0, j*c, c*rows);
    };

    // Compute new grid state
    computeNewGridState(gridState)

    p.rectMode(p.CENTER);
    p.fill('white');

    // Iterate over the grid to check which case to turn on
    for (let i = 0; i < rows; i++){
        for (let j = 0; j < cols; j++){
            if (gridState[i][j] === 1){
                p.rect(j*c, i*c, c, c);
            };
        };
    };



  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
