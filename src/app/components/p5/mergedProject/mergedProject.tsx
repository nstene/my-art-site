import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5, parentRef: HTMLDivElement) => {
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
    let diameter = 2*radius;
    p.circle(x_pos, y_pos, diameter);
  };

  const starGazing = (star_positions: StarPosition[], twinkling: number) => {
    for (let i = 0; i < star_positions.length; i++) {
      if (p.random() < twinkling){
        continue;
      };
      const x = star_positions[i].x;
      const y = star_positions[i].y;
      let size = p.random(1, 2);
      let alpha = p.random(100, 255); // Random alpha for fading effect
      let brightness = p.random(100, 255);
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
  var r = rMax;
  let dr: number;

  let ballSize = rMax;  // Initial ball size
  let startTime = 0;   // To track when the ball shrinking starts

  p.preload = () => {
    sound = p.loadSound('/music/Pomegranates-020-NicolasJaar-Muse.wav');
  };

  // Ease-out function: it returns a value between 0 and 1 that slows down over time
  function easeOut(t: number) {
    return 1 - Math.pow(1 - t, 3); // Cubic ease-out for smooth slowing down
  }

  p.setup = () => {

    const frameRate = 60
    let soundLength = sound.duration();
    const rMin = 0;
    let frameTot = soundLength*frameRate;
    dr = rMax/frameTot;

    p.createCanvas(width, height);
    p.frameRate(frameRate); // Typical animation fps. If I want the animation to speed up, increase ball speed
    star_positions = generateRandomStars(n_stars, p.width/2, p.height/2);
    
    // Sound stuff
    fft = new p5.FFT(0.9, 512); // 512 is the number of bins. Increase for better resolution
    // Create play button
    const playButton = p.createButton('Play Music');
    playButton.position(0, 100);
    playButton.mousePressed(() => {
      sound.play();
      isPlaying = true;
    });
    
    // Create pause button
    const pauseButton = p.createButton('Pause Music');
    pauseButton.position(0, 150);
    pauseButton.mousePressed(() => {
      sound.pause();
      isPlaying = false;
    });
};

  p.draw = () => {    
    p.background(0, 16); // clear background at each iteration otherwise the circles will be drawn on top of eachother. Also add some transparency for fading effects.
    
    let ballSizeOld = ballSize;
    if (isPlaying){
        // Get the elapsed time since the music started
        let elapsedTime = (p.millis() - startTime) / 1000;  // in seconds
        let duration = sound.duration(); // Length of the music in seconds

        // Calculate the percentage of the song that has elapsed
        let progress = p.constrain(elapsedTime / duration, 0, 1);

        // Use the easing function to calculate the ball's size
        let easedProgress = easeOut(progress);  // This will make it shrink faster at first, then slow down
        ballSize = p.map(easedProgress, 0, 1, rMax, 0); 
    };
    // Credits
    p.push();
    p.noStroke();
    p.fill('white');
    const text = "Jaar, Nicolas. 'Muse' Pomegranates. https://www.jaar.site/";
    p.text(text, 0, height);
    p.text(p.round(ballSizeOld - ballSize), 0, height/2);
    p.text(ballSize, 0, 250);
    p.pop();

    // SOUND STUFF
    //if mapMid {
      // let prevMid = mapMid     
    //} else 
    fft.analyze();
    var customBass  = fft.getEnergy( 20, 300 );
    var customMid     = fft.getEnergy( 300, 500 );     
    
    var mapBass     = p.map( customBass, 0, 255, 0, 100 );
    var mapMid      = p.map( customMid, 0, 255, 0, 100 );

    //let smoothingFactor = 0.1; // A smaller number = smoother response
    //let smoothedMid = p.lerp(prevMid, mapMid, smoothingFactor);
    //prevMid = smoothedMid;
    t += 0.00002*mapMid;
    
    //p.text(`bass:${p.round(mapBass)}`, 0, 300+25);
    //p.text(`mid:${p.round(mapMid)}`, 0, 300+50);

    // populate stars
    p.translate(width/2, height/2);
    p.rotate(p.radians(p.frameCount/30));
    starGazing(star_positions, twinkling);

    p.translate(-width/2, -height/2);
    ({ x_pos, y_pos } = updatePositionNoise(x_pos, y_pos, t));
    if (isPlaying) {
        r -= dr
    };
    makeCircle(x_pos, y_pos, ballSize);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
