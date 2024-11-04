import p5 from 'p5';

export const MySketch = () => (p: p5) => {
  p.setup = () => {
    p.createCanvas(400, 400);
    p.background(125);
  };

  p.draw = () => {
    p.fill(100, 100, 100);
    p.ellipse(p.width / 2, p.height / 2, 100, 100);
  };
};