import { Calculus } from './Calculus'


export class Color {
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

export class Palette {
    colors: Color[];

    constructor(colors: Array<number[]>) {
        this.colors = [];
        for (const color of colors) {
            this.colors.push(new Color(color[0], color[1], color[2]))
        }
    }

    createGradient(steps: number) {
        const gradient = [];
        const numColors = this.colors.length - 1;

        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1); // Normalize t to 0-1
            const segment = Math.min(Math.floor(t * numColors), numColors - 1);
            const color1 = this.colors[segment];
            const color2 = this.colors[segment + 1] || this.colors[segment]; // Fallback to the same color

            const interpolatedColor = interpolateColor(color1, color2, t * numColors - segment);
            gradient.push(interpolatedColor);
        }

        return gradient;
    }
}

function interpolateColor(color1: Color, color2: Color, t: number) {
    return [
        Math.round(Calculus.lerp(color1.r, color2.r, t)),
        Math.round(Calculus.lerp(color1.g, color2.g, t)),
        Math.round(Calculus.lerp(color1.b, color2.b, t))
    ];
}
