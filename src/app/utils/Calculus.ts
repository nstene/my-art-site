// Ease-out function: it returns a value between 0 and 1 that slows down over time
export class Calculus {

    static easeOut(t: number, exponent: number): number {
        return 1 - Math.pow(1 - t, exponent); // Cubic ease-out for smooth slowing down
    }

    static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }
}