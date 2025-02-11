import p5 from 'p5';

export class Tile {
    img: p5.Image;
    edges: Array<number>;

    constructor(img: p5.Image, edges: Array<number>) {
        this.img = img;
        this.edges = edges;
    }

    rotate(num: number, p: p5) {
        const w = this.img.width;
        const h = this.img.height;
        const newGraphics = p.createGraphics(w, h);
        newGraphics.imageMode(p.CENTER);
        newGraphics.translate(w/2, h/2);
        newGraphics.rotate(p.HALF_PI * num);
        newGraphics.image(this.img, 0, 0);
        const newImg = newGraphics.get();

        const newEdges = [];
        const len = this.edges.length;
        for (let i = 0; i < len; i++) {
            newEdges[i] = this.edges[(i - num + len) % len]
        }

        return new Tile(newImg, newEdges)
    }
}