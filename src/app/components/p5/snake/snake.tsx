import p5 from 'p5';
import { Snake, SnakeSegment } from '../../../utils/Snake';
import { MobileAdaptator } from '@/app/utils/MobileAdaptator';
import { WaveFunctionCollapse } from '@/app/utils/WaveFunctionCollapse';

export const MySketch = () => (p: p5) => {

    let fullscreenButton: p5.Element;
    let runButton: p5.Element;
    let playPauseButton: p5.Element;
    let isPaused = true;
    let snake: Snake;
    const snakeLength = 50;
    let angle: number;
    const numSlices = 12;
    let waveFunction: WaveFunctionCollapse;
    const tileImagePaths = ['/tiles/demo/blank.png', '/tiles/demo/up.png', '/tiles/demo/down.png', '/tiles/demo/left.png', '/tiles/demo/right.png'];
    let tileImages: p5.Image[] = [];

    function toggleFullScreen() {
        const isFullScreen = p.fullscreen(); // Check if currently in full-screen mode
        p.fullscreen(!isFullScreen); // Toggle full-screen mode
    }

    p.preload = () => {
        for ( let i = 0; i<tileImagePaths.length; i++ ) {
            tileImages[i] = p.loadImage(tileImagePaths[i])
        }
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

        p.randomSeed(5);

        // Initialize wavefunctioncollapse
        const dims = [30, 30];
        waveFunction = new WaveFunctionCollapse(tileImages, dims);
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