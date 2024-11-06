import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5, parentRef: HTMLDivElement) => {
  const width = p.windowWidth;
  const height = p.windowHeight;
  
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

  const makeCircle = (x_pos: number, y_pos: number) => {
    p.fill(0);
    p.stroke(255);
    p.strokeWeight(2);
    p.circle(x_pos, y_pos, 200);
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

  p.preload = () => {
    sound = p.loadSound('/music/Pomegranates-020-NicolasJaar-Muse.wav');
  };

  p.setup = () => {
    p.createCanvas(width, height);
    p.frameRate(60); // Typical animation fps. If I want the animation to speed up, increase ball speed
    star_positions = generateRandomStars(n_stars, p.width/2, p.height/2);
    
    // Sound stuff
    fft = new p5.FFT(0.9, 512); // 512 is the number of bins. Increase for better resolution
    // Create play button
    const playButton = p.createButton('Play Music');
    playButton.position(0, 100);
    playButton.mousePressed(() => {
      sound.play();
    });
    
    // Create pause button
    const pauseButton = p.createButton('Pause Music');
    pauseButton.position(0, 150);
    pauseButton.mousePressed(() => {
      sound.pause();
    });
};

  p.draw = () => {    
    p.background(0, 16); // clear background at each iteration otherwise the circles will be drawn on top of eachother. Also add some transparency for fading effects.
    
    // Credits
    p.push();
    p.noStroke();
    p.fill('white');
    const text = "Jaar, Nicolas. 'Muse' Pomegranates. https://www.jaar.site/";
    p.text(text, 0, height);
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
    //({ x_pos, y_pos, x_speed, y_speed } = updatePositionMRU(x_pos, y_pos, x_speed, y_speed));
    ({ x_pos, y_pos } = updatePositionNoise(x_pos, y_pos, t));
    // Draw the circle, but the y position is changing each draw() iteration with framecount
    //makeCloud(x_pos, y_pos)
    makeCircle(x_pos, y_pos);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
