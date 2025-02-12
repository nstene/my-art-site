import p5 from 'p5';

function reverse(s: String) {
    let arr = s.split('');
    arr = arr.reverse();
    return arr.join('');
}

function compareEdges(a: String, b: String) {
    return a == reverse(b);
}

export class Tile {
    img: p5.Image;
    edges: Array<String>;
    up: number[];
    right: number[];
    down: number[];
    left: number[];

    constructor(img: p5.Image, edges: Array<String>) {
        this.img = img;
        this.edges = edges;

        // List valid neighbours
        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];
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

    analyze(tiles: Tile[]) {
        // Connection with other tiles
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            // UP
            // if tile above has down edge that matches my tiles' above edge, it's a valid connection
            if (compareEdges(tile.edges[2], this.edges[0])) {
                this.up.push(i);
            }
            // RIGHT
            if (compareEdges(tile.edges[3], this.edges[1])) {
                this.right.push(i);
            }
            // DOWN
            if (compareEdges(tile.edges[0], this.edges[2])) {
                this.down.push(i);
            }
            // LEFT
            if (compareEdges(tile.edges[1], this.edges[3])) {
                this.left.push(i);
            }
        }
    }
}