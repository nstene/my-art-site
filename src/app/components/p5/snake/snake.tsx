import p5 from 'p5';
import { Snake, SnakeSegment } from '../../../utils/Snake';
import { MobileAdaptator } from '@/app/utils/MobileAdaptator';
import { WaveFunctionCollapse } from '@/app/utils/WaveFunctionCollapse';
import { Tile } from '@/app/utils/Tile';
import { flightRouterStateSchema } from 'next/dist/server/app-render/types';

export const MySketch = () => (p: p5) => {

    let fullscreenButton: p5.Element;
    let runButton: p5.Element;
    let playPauseButton: p5.Element;
    let isPaused = true;
    let snake: Snake;
    const snakeLength = 50;
    let angle: number;
    const numSlices = 12;
    let waveFunctionDark: WaveFunctionCollapse;
    let waveFunctionColor: WaveFunctionCollapse;
    let waveFunction: WaveFunctionCollapse;
    let tileImageSetDark: p5.Image[] = [];
    let tileImageSetColor: p5.Image[] = [];
    let tileSetDark: Tile[] = [];
    let tileSetColor: Tile[] = [];
    const dims = [40, 40];
    const foodApparitionRate = 0.01;
    let food: boolean = false;
    let foodLocX: number;
    let foodLocY: number;   

    function toggleFullScreen() {
        const isFullScreen = p.fullscreen(); // Check if currently in full-screen mode
        p.fullscreen(!isFullScreen); // Toggle full-screen mode
    }

    p.preload = () => {
        tileImageSetDark[0] = p.loadImage('/tiles/demo/blank.png');
        tileImageSetDark[1] = p.loadImage('/tiles/demo/up.png');

        
        //tileImageSetColor[9] = p.loadImage('/tiles/shipibo/tile_3.png');
        //tileImageSetColor[10] = p.loadImage('/tiles/shipibo/tile_4.png');
        tileImageSetColor[3] = p.loadImage('/tiles/shipibo/tile_0.png');
        tileImageSetColor[4] = p.loadImage('/tiles/shipibo/tile_1.png');
        tileImageSetColor[2] = p.loadImage('/tiles/shipibo/tile_2.png');
        tileImageSetColor[5] = p.loadImage('/tiles/shipibo/tile_5.png');
        tileImageSetColor[6] = p.loadImage('/tiles/shipibo/tile_6.png');
        tileImageSetColor[7] = p.loadImage('/tiles/shipibo/tile_7.png');
        tileImageSetColor[8] = p.loadImage('/tiles/shipibo/tile_8.png');
        tileImageSetColor[0] = p.loadImage('/tiles/shipibo/tile_9.png');
        tileImageSetColor[1] = p.loadImage('/tiles/shipibo/tile_10.png');
        tileImageSetColor[9] = p.loadImage('/tiles/shipibo/tile_11.png');
    };

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.angleMode(p.DEGREES);
        p.frameRate(64);

        //p.noLoop();

        angle = 360 / numSlices; // Calculate the angle of each slice
        p.noStroke();

        // Create button for full screen mode
        let fullScreenButtonPosition = 100;
        let runButtonPosition = 200;
        let pauseButtonPosition = 150;
        let fontSize = '18px';
        if (MobileAdaptator.isMobileDevice()) {
            fullScreenButtonPosition = 50;
            pauseButtonPosition = 100;
            runButtonPosition = 150;
            fontSize = '12px';
        }
        fullscreenButton = p.createButton('Full Screen');
        fullscreenButton.position(0, fullScreenButtonPosition);
        fullscreenButton.mousePressed(toggleFullScreen);
        fullscreenButton.style('font-size', fontSize);

        // Create reset button
        runButton = p.createButton('Reset');
        runButton.position(0, runButtonPosition);
        runButton.mousePressed(toggleReset);
        runButton.style('font-size', fontSize);

        // Create pause button
        playPauseButton = p.createButton('Play');
        playPauseButton.position(0, pauseButtonPosition);
        playPauseButton.mousePressed(togglePlayPause);
        playPauseButton.style('font-size', fontSize);

        // Initialize Snake
        initialSeeding();

        //p.randomSeed(5);

        // Initialize wavefunctioncollapse with the dark tiles
        tileSetDark[0] = new Tile(tileImageSetDark[0], ['0', '0', '0', '0']);
        tileSetDark[1] = new Tile(tileImageSetDark[1], ['1', '1', '0', '1']);
        tileSetDark[2] = tileSetDark[1].rotate(1, p);
        tileSetDark[3] = tileSetDark[1].rotate(2, p);
        tileSetDark[4] = tileSetDark[1].rotate(3, p);
        
        waveFunctionDark = new WaveFunctionCollapse(tileSetDark, dims);
        
        // Initialize wavefunctioncollapse with color tiles
        //tileSetColor[9] = new Tile(tileImageSetColor[9], ['BBB', 'BBB', 'BBB', 'BBB']);
        //tileSetColor[10] = new Tile(tileImageSetColor[10], ['RRR', 'RRR', 'RRR', 'RRR']);
        tileSetColor[2] = new Tile(tileImageSetColor[2], ['BBG', 'GGG', 'GBB', 'BBB']);
        tileSetColor[3] = new Tile(tileImageSetColor[3], ['RGB', 'BBB', 'BGR', 'RRR']);
        tileSetColor[4] = new Tile(tileImageSetColor[4], ['RRG', 'GGG', 'GRR', 'RRR']);
        tileSetColor[5] = new Tile(tileImageSetColor[5], ['RGG', 'GRG', 'GGR', 'RRR']);
        tileSetColor[6] = new Tile(tileImageSetColor[6], ['RGG', 'GGG', 'GGR', 'RRR']);
        tileSetColor[7] = new Tile(tileImageSetColor[7], ['BGG', 'GGG', 'GGB', 'BBB']);
        tileSetColor[8] = new Tile(tileImageSetColor[8], ['GGG', 'GGG', 'GRR', 'RRG']);
        tileSetColor[0] = new Tile(tileImageSetColor[0], ['GRG', 'GRG', 'GRG', 'GRG']);
        tileSetColor[1] = new Tile(tileImageSetColor[1], ['GGG', 'GGG', 'GBB', 'BBG']);
        tileSetColor[9] = new Tile(tileImageSetColor[9], ['BGG', 'GBG', 'GGB', 'BBB']);

        const initialSetLength = tileSetColor.length;

        for ( let i = 0; i < initialSetLength; i++ ) {
            for ( let j = 1; j < 4; j++) {
                tileSetColor.push(tileSetColor[i].rotate(j, p));
            }
        }

        waveFunctionColor = new WaveFunctionCollapse(tileSetColor, dims);

        // Initialize wave function
        waveFunction = waveFunctionDark;
    }

    p.mousePressed = () => {
        p.redraw();
    }

    p.draw = () => {
        p.background(0, 20);

        /////////////////////
        // DRAW BACKGROUND //
        /////////////////////

        waveFunction.draw(p);
        waveFunction.update(p);

        /*
        // Draw a pattern in each slice
        if (p.frameCount % 10 === 0) {
            for (let i = 0; i < numSlices; i++) {
                p.push();
                p.translate(p.width / 2, p.height / 2); // Move origin to center of the canvas
                p.rotate(i * angle); // Rotate to the current slice
                drawPattern();
                p.scale(1, -1); // Mirror the pattern
                drawPattern();
                p.pop();
            }
        }
        */


        ////////////////
        // DRAW SNAKE //
        ////////////////

        snake.show(p);


        ////////////////
        // MOVE SNAKE //
        ////////////////

        if (!isPaused) {
            snake.update();
            snake.edges(p);
        }

        if (snake.hasEaten) {
            waveFunction = waveFunctionColor;
        }

         // draw grid
         for (var x = 0; x < p.width; x += p.width / dims[0]) {
            for (var y = 0; y < p.height; y += p.height / dims[1]) {
                p.stroke(255);
                p.strokeWeight(1);
                p.line(x, 0, x, p.height);
                p.line(0, y, p.width, y);
            }
        }

        /////////////////////////
        // Randomly spawn food //
        /////////////////////////

        if ( snake.digesting ) {
            return
        }

        if (!food) {
            if (p.random() < foodApparitionRate) {
                // Spawn food at random location
                p.fill('orange');
                foodLocX = p.random(p.width);
                foodLocY = p.random(p.height);
                p.rect(foodLocX, foodLocY, 20, 20);
                food = true;
            }
        } else {
            p.fill('orange');
            p.rect(foodLocX, foodLocY, 20, 20);
        }

        // Check if snake finds the food
        const distance = snake.segments[0].position.dist(p.createVector(foodLocX, foodLocY));
        const squareDim = p.max(p.width, p.height)/p.min(dims);
        if ( distance < squareDim ) {
            snake.hasEaten = true;
            snake.digesting = 1000;
            waveFunction = waveFunctionColor;
            food = false;
        }

    }

    // Function to draw a random pattern
    function drawPattern() {
        p.fill(p.random(255), p.random(255), p.random(255));
        let x = p.random(50, 500); // Random position within the slice
        let y = p.random(-50, 500);
        //p.triangle(x, y, x+100, y+100, x+200, y+200);
        p.circle(x, y, 50)
    }

    function initialSeeding() {
        const snakeSegments = [];
        const snakeThickness = 10;
        const snakeDirection = new p5.Vector(1, 0);
        let offset = 0;
        for (let i = 0; i < snakeLength; i++) {
            offset = i * snakeThickness
            snakeSegments.push(new SnakeSegment(new p5.Vector(p.width / 2 - offset, p.height / 2), new p5.Vector(1, 0)));
        }
        snake = new Snake(snakeSegments, snakeThickness, snakeDirection)
    }

    function toggleReset() {
        // Stop simulation and reset
        playPauseButton.html('Play');
        resetSketch();
        isPaused = true;
    }

    function resetSketch() {
        p.background(0);
        initialSeeding();
    }

    function togglePlayPause() {
        if (isPaused) {
            //sound.pause();
            playPauseButton.html('Pause'); // Update button text to "Play"
            isPaused = false;
        } else {
            //sound.play();
            playPauseButton.html('Play'); // Update button text to "Pause"
            isPaused = true;
        }
    }

    p.keyPressed = () => {
        if (p.keyCode === p.LEFT_ARROW && snake.headDirection !== new p5.Vector(1, 0)) {
            console.log("left key pressed");
            snake.setNextDirection(new p5.Vector(-1, 0));
        } else if (p.keyCode === p.RIGHT_ARROW && snake.headDirection !== new p5.Vector(-1, 0)) {
            console.log("right key pressed");
            snake.setNextDirection(new p5.Vector(1, 0));
        } else if (p.keyCode === p.UP_ARROW && snake.headDirection !== new p5.Vector(0, -1)) {
            console.log("up key pressed");
            snake.setNextDirection(new p5.Vector(0, -1));
        } else if (p.keyCode === p.DOWN_ARROW && snake.headDirection !== new p5.Vector(0, 1)) {
            console.log("down key pressed");
            snake.setNextDirection(new p5.Vector(0, 1));
        } else if (p.key == ' ') {
            togglePlayPause();
        }
    }
};