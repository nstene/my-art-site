import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5) => {
  const width = p.windowWidth;
  const height = p.windowHeight;
  let isPlaying = false;
  
  // Stargazing stuff
  //___________________

  let y_pos = width*Math.random();
  let x_pos = height*Math.random();

  interface StarPosition {
    x: number;
    y: number;
  };

  let t = 0;

  const twinkling = 0.8;
  const n_stars = 400;

  const generateRandomStars = (n: number, half_width: number, half_height: number): StarPosition[] => {
    const star_positions: StarPosition[] = [];

    const max_dim = Math.max(half_width, half_height);
    
    for (let i = 0; i < n; i++) {
      const x = p.random(-max_dim, max_dim); // Generate random x coordinate
      const y = p.random(-max_dim, max_dim); // Generate random y coordinate
      star_positions.push({ x, y }); // Add the new position to the array
    }
  
    return star_positions;
  };

  const updatePositionNoise = (x_pos: number, y_pos: number, t: number) => {
    x_pos = width * p.noise(t + 15); 
    y_pos = height * p.noise(t + 5); 
    return { x_pos, y_pos }; 
  };

  const makeCircle = (x_pos: number, y_pos: number, radius: number) => {
    p.fill(0);
    p.stroke(255);
    p.strokeWeight(2);
    const diameter = 2*radius;
    p.circle(x_pos, y_pos, diameter);
  };

  const starGazing = (star_positions: StarPosition[], twinkling: number) => {
    for (let i = 0; i < star_positions.length; i++) {
      if (p.random() < twinkling){
        continue;
      };
      const x = star_positions[i].x;
      const y = star_positions[i].y;
      const size = p.random(1, 2);
      const alpha = p.random(100, 255); // Random alpha for fading effect
      const brightness = p.random(100, 255);
      p.fill(brightness, alpha); // Apply brightness and alpha for twinkling
      p.circle(x, y, size)
    };
  };

  let star_positions: StarPosition[] = [];

  // SOUND STUFF
  // _______________

  let sound: p5.SoundFile;
  let fft: p5.FFT;

  const rMax = Math.max(width/2, height/2);
  const rMin = 1;
  let elapsedSongTime = 0;
  const frameRate = 60
  let isFinished = false;

  let ballSize = rMax;  // Initial ball size
  let speedFactor = 1;

  p.preload = () => {
    sound = p.loadSound('/music/Pomegranates-020-NicolasJaar-Muse.wav');
  };

  // Ease-out function: it returns a value between 0 and 1 that slows down over time
  function easeOut(t: number, exponent: number) {
    return 1 - Math.pow(1 - t, exponent); // Cubic ease-out for smooth slowing down
  }

  p.setup = () => {

    //const soundLength = sound.duration();
    //const frameTot = soundLength*frameRate;
        
    const canvas = p.createCanvas(p.windowWidth, window.innerHeight);
    canvas.style('z-index', '0');
    canvas.style('position', 'absolute');
    p.frameRate(frameRate); // Typical animation fps. If I want the animation to speed up, increase ball speed
    star_positions = generateRandomStars(n_stars, p.width/2, p.height/2);
    
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
    
    if (isPlaying){
        // Get the elapsed time since the music started
        elapsedSongTime = sound.currentTime();  // in seconds
        const duration = sound.duration(); // Length of the music in seconds

        // Calculate the percentage of the song that has elapsed
        const progress = p.constrain(elapsedSongTime / duration, 0, 1);

        // Use the easing function to calculate the ball's size
        const easedProgressRadius = easeOut(progress, 3);  // This will make it shrink faster at first, then slow down
        const easedProgressSpeed = easeOut(progress, 1.1);
        ballSize = p.map(easedProgressRadius, 0, 1, rMax, rMin); 

        speedFactor = p.map(easedProgressSpeed, 0, 1, 1, 0); 
        if (sound.currentTime() >= sound.duration() - 1){
          isFinished = true;
        }
    };
    // Credits
    p.push();
    p.noStroke();
    p.fill('white');
    const text = "Jaar, Nicolas. 'Muse' Pomegranates. https://www.jaar.site/";
    p.text(text, 0, p.windowHeight - 50);
    //p.text(`Elapsed song time: ${p.round(elapsedSongTime)}`, 0, height/2);
    p.text(window.innerHeight, 0, 250);
    p.text(p.windowHeight, 0, 300);
    p.pop();

    // SOUND STUFF
    fft.analyze();
    const customMid     = fft.getEnergy( 300, 500 );     
    const mapMid      = p.map( customMid, 0, 255, 0, 100 );

    t += 0.00002*mapMid*speedFactor;

    // populate stars
    p.translate(width/2, height/2);
    p.rotate(p.radians(p.frameCount/30));
    starGazing(star_positions, twinkling);

    p.translate(-width/2, -height/2);
    ({ x_pos, y_pos } = updatePositionNoise(x_pos, y_pos, t));

    if (isFinished && p.random() > twinkling){
      p.fill(100, 100);
      makeCircle(x_pos, y_pos, ballSize);
    } else if (!isFinished){
      makeCircle(x_pos, y_pos, ballSize);
    };
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
