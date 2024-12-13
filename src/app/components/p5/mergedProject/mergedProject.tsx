import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5) => {
  const width = p.windowWidth;
  const height = p.windowHeight;
  let isPlaying = false;
  let fullscreenButton: p5.Element;
  let loadingMessage: p5.Element;
  let t = 0;
  const twinkling = 0.8;
  const n_stars = 400;
  let stars: Star[];
  const minRadius = 1;
  const maxRadius = 2;

  // Stargazing stuff
  //___________________

  let y_pos = width * Math.random();
  let x_pos = height * Math.random();

  class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  };

  class Star {
    position: Position;
    radius: number;
    color: p5.Color;

    constructor(radius: number, position: Position, color: p5.Color) {
      this.position = position;
      this.radius = radius;
      this.color = color;
    }

    draw() {
      const alpha = p.random(100, 230); // Random alpha for fading effect
      this.color.setAlpha(alpha);
      p.push();
      p.noStroke();
      p.translate(width / 2, height / 2);
      p.rotate(p.radians(p.frameCount / 30));
      p.fill(this.color); // Apply brightness and alpha for twinkling
      p.circle(this.position.x, this.position.y, 2 * this.radius)
      p.pop();
    }
  }

  const generateRandomStars = (n: number, half_width: number, half_height: number): Star[] => {
    const stars: Star[] = [];

    const max_dim = Math.max(half_width, half_height);

    for (let i = 0; i < n; i++) {
      const brightness = p.random(100, 255);
      let starColor = p.color(255, 255, 255);
      const colorDecision = p.random();


      if (colorDecision <= 0.15) {
        starColor = p.color(brightness, p.random(brightness), p.random(brightness));
      } else if (colorDecision > 0.15 && colorDecision <= 0.3) {
        starColor = p.color(p.random(brightness), p.random(brightness), brightness);
      };
      const x = p.random(-max_dim, max_dim);
      const y = p.random(-max_dim, max_dim);
      const position = new Position(x, y);
      const radius = p.random(minRadius, maxRadius);
      stars.push(new Star(radius, position, starColor))
    }

    return stars;
  };

  const updatePositionNoise = (x_pos: number, y_pos: number, t: number) => {
    x_pos = width * p.noise(t + 15);
    y_pos = height * p.noise(t + 5);
    return { x_pos, y_pos };
  };

  const makeBlackCircle = (x_pos: number, y_pos: number, radius: number) => {
    p.push();
    p.fill(0);
    p.stroke(255);
    p.strokeWeight(2);
    const diameter = 2 * radius;
    p.circle(x_pos, y_pos, diameter);
    p.pop();
  };

  const drawStars = (stars: Star[], twinkling: number) => {
    for (const star of stars) {
      if (p.random() < twinkling) {
        continue;
      };
      star.draw();
    };
  };

  // SOUND STUFF
  // _______________

  let sound: p5.SoundFile;
  let fft: p5.FFT;

  const rMax = Math.max(width / 3, height / 3);
  const rMin = 1;
  let elapsedSongTime = 0;
  const frameRate = 60
  let isFinished = false;

  let ballSize = rMax;  // Initial ball size
  let speedFactor = 1;

  p.preload = () => {
    loadingMessage = p.createP('Loading... Please wait.');
    loadingMessage.position(p.windowWidth / 2 - 100, p.windowHeight / 2);
    sound = p.loadSound('/music/Pomegranates-020-NicolasJaar-Muse.mp3', onLoadComplete);
  };

  function onLoadComplete() {
    loadingMessage.remove(); // Remove the loading message from the screen
  }

  function toggleFullScreen() {
    const isFullScreen = p.fullscreen(); // Check if currently in full-screen mode
    p.fullscreen(!isFullScreen); // Toggle full-screen mode
  }

  // Ease-out function: it returns a value between 0 and 1 that slows down over time
  function easeOut(t: number, exponent: number) {
    return 1 - Math.pow(1 - t, exponent); // Cubic ease-out for smooth slowing down
  }

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

  p.setup = () => {

    const canvas = p.createCanvas(p.windowWidth, window.innerHeight);
    canvas.style('z-index', '0');
    canvas.style('position', 'absolute');
    p.frameRate(frameRate); // Typical animation fps. If I want the animation to speed up, increase ball speed
    stars = generateRandomStars(n_stars, p.width / 2, p.height / 2);

    // Create button for full screen mode
    fullscreenButton = p.createButton('Full Screen');
    fullscreenButton.position(0, 150);
    fullscreenButton.mousePressed(toggleFullScreen);

    // Sound stuff
    fft = new p5.FFT(0.9, 512); // 512 is the number of bins. Increase for better resolution
    // Create play button
    playPauseButton = p.createButton('Play');
    playPauseButton.position(0, 100);
    playPauseButton.mousePressed(togglePlayPause);
  };

  p.draw = () => {
    p.background(0, 16); // clear background at each iteration otherwise the circles will be drawn on top of eachother. Also add some transparency for fading effects.

    if (isPlaying) {
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
      if (sound.currentTime() >= sound.duration() - 1) {
        isFinished = true;
      }
    };

    // Credits
    p.push();
    p.noStroke();
    p.fill('white');
    const text = "Jaar, Nicolas. 'Muse' Pomegranates. https://www.jaar.site/";
    p.text(text, 0, p.windowHeight - 5);
    p.pop();

    // SOUND STUFF
    fft.analyze();
    const customMid = fft.getEnergy(300, 500);
    const mapMid = p.map(customMid, 0, 255, 0, 100);

    t += 0.00002 * mapMid * speedFactor;

    // populate stars
    drawStars(stars, twinkling);

    p.translate(-width / 2, -height / 2);
    ({ x_pos, y_pos } = updatePositionNoise(x_pos, y_pos, t));

    if (isFinished && p.random() > twinkling) {
      //p.fill(100, 100);
      makeBlackCircle(x_pos, y_pos, ballSize);
    } else if (!isFinished) {
      makeBlackCircle(x_pos, y_pos, ballSize);
    };

    console.log(stars[0].color.toString());

  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
