import p5 from 'p5';

export const MySketch = () => (p: p5) => {
  const width = p.windowWidth;
  const height = p.windowHeight;
  let y_pos = width*Math.random();
  let x_pos = height*Math.random();
  let y_speed = Math.sign(0.5 - Math.random()) * 5;
  let x_speed = Math.sign(0.5 - Math.random()) * 5;

  interface StarPosition {
    x: number;
    y: number;
  };

  let t = 0;

  const twinkling = 0.8;
  const n_stars = 400;

  const generateRandomStars = (n: number, width: number, height: number): StarPosition[] => {
    const star_positions: StarPosition[] = [];
    
    for (let i = 0; i < n; i++) {
      const x = Math.random() * width; // Generate random x coordinate
      const y = Math.random() * height; // Generate random y coordinate
      star_positions.push({ x, y }); // Add the new position to the array
    }
  
    return star_positions;
  };

  const updatePositionMRU = (x_pos: number, y_pos: number, x_speed: number, y_speed:number) => {
    if (x_pos >= p.width || x_pos <= 0) {
      x_speed *= -1; // Reverse direction if hitting boundaries
    }
    x_pos += x_speed; // Update position based on speed

    if (y_pos >= p.height || y_pos <= 0) {
      y_speed *= -1; // Reverse direction if hitting boundaries
    }
    y_pos += y_speed; // Update position based on speed
    return { x_pos, y_pos, x_speed, y_speed }; // Return updated position and speed
  };

  const updatePositionNoise = (x_pos: number, y_pos: number, t: number) => {
    x_pos = width * p.noise(t + 15); 
    y_pos = height * p.noise(t + 5); 
    return { x_pos, y_pos }; 
  };

  const makeCloud = (x_pos: number, y_pos: number) => {
    for (let i = 255; i >= 0; i -= 1) {
      p.fill(255 - i); // White at the center (i = 255) to black at the edge (i = 0)
      p.noStroke();
      p.circle(x_pos, y_pos, i);
      t += 0.01
    };
  };

  const makeCircle = (x_pos: number, y_pos: number) => {
    p.fill(0);
    p.stroke(255);
    p.strokeWeight(2);
    p.circle(x_pos, y_pos, 200);
    t += 0.001;
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

  p.setup = () => {
    p.createCanvas(width, height);
    p.frameRate(24); // Typical animation fps. If I want the animation to speed up, increase ball speed
    star_positions = generateRandomStars(n_stars, p.width, p.height);
  };

  p.draw = () => {    
    p.background(0, 16); // clear background at each iteration otherwise the circles will be drawn on top of eachother. Also add some transparency for fading effects.
    // populate stars
    starGazing(star_positions, twinkling);
    //({ x_pos, y_pos, x_speed, y_speed } = updatePositionMRU(x_pos, y_pos, x_speed, y_speed));
    ({ x_pos, y_pos } = updatePositionNoise(x_pos, y_pos, t));

    // Draw the circle, but the y position is changing each draw() iteration with framecount
    //makeCloud(x_pos, y_pos)
    makeCircle(x_pos, y_pos);
  };
};