export class GridCell {
    collapsed: boolean;
    options: Array<number>;

    constructor(value: number | Array<number>) {
        this.collapsed = false; // by default

        // If we get given an array, the array is assumed to represent the options
        if (value instanceof Array) {
            this.options = value;
        } else {
            this.options = [];
            for (let i = 0; i < value; i++) {
                this.options[i] = i;
            }
        }
    }
};