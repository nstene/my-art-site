import p5 from 'p5';
import { GridCell } from './GridCell';
import { Tile } from './Tile';

// Make the grid a one-dimensional array, using i as line indexing and j for column indexing. 
// Find cell on (i, j) with grid[i + j * nDims]
export class WaveFunctionCollapse {
    tiles: Tile[] = [];;
    grid: GridCell[];
    dims: Array<number>; // Dimensions of the grid on the canvas

    constructor(
        tiles: Tile[] = [],
        dims: Array<number>
    ) {
        this.tiles = tiles;
        this.dims = dims;
        this.grid = [];

        // Initialize the grid with all options available in each cell
        for (let i = 0; i < dims[0] * dims[1]; i++) {
            this.grid[i] = new GridCell(tiles.length)
        }

        this.generateAgencyRules();
    }

    // Generate agency rules
    generateAgencyRules() {
        for (let tile of this.tiles) {
            tile.analyze(this.tiles)
        }
    }

    update(p: p5) {

        ///////////////////////////////////////////////////
        // PICK CELL WITH LOWEST ENTROPY AND COLLAPSE IT //
        ///////////////////////////////////////////////////


        // Make copy of grid
        let gridCopy = this.grid.slice();
        gridCopy = gridCopy.filter((a => !a.collapsed)); // check all that are not yet collapsed
        // If all cells are collapsed, return
        if (gridCopy.length == 0) {
            return
        }
        // Sort the grid by options length (entropy)
        gridCopy.sort((a, b) => {
            return a.options.length - b.options.length
        });

        // Get minimum length and pick a random tile image from those that have the same entropy
        const minLength = gridCopy[0].options.length;
        let filteredGrid = gridCopy.filter(cell => cell.options.length === minLength);
        const cell = p.random(filteredGrid)
        cell.collapsed = true;
        const pick = p.random(cell.options);
        cell.options = [pick];

        //console.table(gridCopy);


        ////////////////////////////////////////////////////////
        // UPDATE ALL CELL OPTIONS AFTER THAT CELL COLLAPSING //
        ////////////////////////////////////////////////////////
        const nextGrid = [];
        for (let j = 0; j < this.dims[1]; j++) {
            for (let i = 0; i < this.dims[0]; i++) {
                let index = i + j * this.dims[0];
                let cell = this.grid[index];
                if (cell.collapsed) { // If cell has collapsed, give it to the next grid
                    nextGrid[index] = this.grid[index];
                } else { // ELSE LOOK AT TILES AROUND AND DECREASE OPTIONS
                    let options = new Array(this.tiles.length).fill(0).map((_, i) => i);
                    let validOptions = [];
                    // LOOK UP
                    if (j > 0) {
                        validOptions = [];
                        let up = this.grid[i + (j - 1) * this.dims[0]];
                        for (let option of up.options) {
                            if (this.tiles[option] && this.tiles[option].down) {
                                const valid = this.tiles[option].down // 2 is the valid options for the cell in focus from the above cell's perspective
                                validOptions = validOptions.concat(valid);
                            }
                        }
                        this.checkValid(options, validOptions);
                    }

                    // LOOK RIGHT
                    if (i < this.dims[0] - 1) {
                        validOptions = [];
                        let right = this.grid[(i + 1) + j * this.dims[0]];
                        for (let option of right.options) {
                            if (this.tiles[option] && this.tiles[option].left) {
                                const valid = this.tiles[option].left // 3 is the valid options for the cell in focus from the right cell's perspective
                                validOptions = validOptions.concat(valid);
                            }
                        }
                        this.checkValid(options, validOptions);
                    }

                    // LOOK DOWN
                    if (j < this.dims[0] - 1) {
                        validOptions = [];
                        let down = this.grid[i + (j + 1) * this.dims[0]];
                        for (let option of down.options) {
                            if (this.tiles[option] && this.tiles[option].up) {
                                const valid = this.tiles[option].up // 0 is the valid options for the cell in focus from the below cell's perspective
                                validOptions = validOptions.concat(valid);
                            }
                        }
                        this.checkValid(options, validOptions);
                    }

                    // LOOK LEFT
                    if (i > 0) {
                        validOptions = [];
                        let left = this.grid[(i - 1) + j * this.dims[0]];
                        for (let option of left.options) {
                            if (this.tiles[option] && this.tiles[option].right) {
                                const valid = this.tiles[option].right // 1 is the valid options for the cell in focus from the LEFT cell's perspective
                                validOptions = validOptions.concat(valid);
                            }
                        }
                        this.checkValid(options, validOptions);
                    }

                    if (options[0] === undefined) {
                        console.log('problem')
                    }

                    nextGrid[index] = new GridCell(options);
                }
            }
        }

        this.grid = nextGrid;
    }

    checkValid(arr: Array<number>, valid: Array<number>) {
        // RETURNS THE OPTIONS FROM ARR THAT ARE INCLUDED IN VALID
        // for each element of the options, if valid does not include the 
        for (let i = arr.length - 1; i >= 0; i--) {
            let element = arr[i];
            if (!valid.includes(element)) {
                arr.splice(i, 1);
            }
        }

        if (!arr) {
            console.log('problem here')
        }
    }

    draw(p: p5) {
        const w = p.width / this.dims[0];
        const h = p.height / this.dims[1];

        // Go through the array and draw cell when it is collapsed, otherwise make it black
        for (let j = 0; j < this.dims[1]; j++) {
            for (let i = 0; i < this.dims[0]; i++) {
                let cell = this.grid[i + j * this.dims[0]];
                if (cell.collapsed) { // If collapsed there's only one option, get the image
                    let index = cell.options[0];
                    if (index === undefined) {
                        console.log('problem')
                    }
                    p.image(this.tiles[index].img, i * w, j * h, w, h)
                } else {
                    p.fill(0);
                    p.stroke(255);
                    p.rect(i * w, j * h, w, h);
                }
            }
        }
    }
}