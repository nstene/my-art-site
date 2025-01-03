import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import { Particle } from '@/app/utils/Particle';
import { FlowField } from '@/app/utils/FlowField';
import { MobileAdaptator } from '@/app/utils/MobileAdaptator';

let scale = 20;
let rows: number;
let cols: number;
const deltaZ = 0.005;
const particles: Particle[] = [];
const nParticles = 1000;
let flowField: FlowField;
let hideParticles = false;
let hideFlowField = false;
const withCircle = true;

export const MySketch = () => (p: p5) => {

    let fullscreenButton: p5.Element;
    let hideParticlesButton: p5.Element;
    let hideFlowFieldButton: p5.Element;

    function toggleFullScreen() {
        const isFullScreen = p.fullscreen(); // Check if currently in full-screen mode
        p.fullscreen(!isFullScreen); // Toggle full-screen mode
    }

    p.setup = async () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.frameRate(64);

        // Create button for full screen mode
        let fullScreenButtonPosition = 100;
        let hideFlowFieldButtonPosition = 150;
        let hideParticlesButtonPosition = 200;
        let fontSize = '18px';
        if ( MobileAdaptator.isMobileDevice() ) scale = 10; 
        cols = Math.round(p.width / scale) + 3;
        rows = Math.round(p.height / scale) + 3;
        if (MobileAdaptator.isMobileDevice()) {
            fullScreenButtonPosition = 50;
            hideFlowFieldButtonPosition = 100;
            hideParticlesButtonPosition = 150;
            fontSize = '12px';
        }
        fullscreenButton = p.createButton('Full Screen');
        fullscreenButton.position(0, fullScreenButtonPosition);
        fullscreenButton.mousePressed(toggleFullScreen);
        fullscreenButton.style('font-size', fontSize);

        // Create button to hide free particles
        hideParticlesButton = p.createButton('Hide free particles');
        hideParticlesButton.position(0, hideParticlesButtonPosition);
        hideParticlesButton.mousePressed(toggleHideFreeParticles);
        hideParticlesButton.style('font-size', fontSize)
        // Create button to hide free particles
        hideFlowFieldButton = p.createButton('Hide flow field');
        hideFlowFieldButton.position(0, hideFlowFieldButtonPosition);
        hideFlowFieldButton.mousePressed(toggleHideFlowField);
        hideFlowFieldButton.style('font-size', fontSize)

        for (let i = 0; i < nParticles; i++) {
            particles.push(new Particle(0.1, p.createVector(p.random(p.width), p.random(p.height))));
        }

        flowField = new FlowField(rows, cols, deltaZ, scale, p, withCircle);
    };

    p.draw = () => {
        p.background(0, 10);

        //if ( p.frameCount%10 === 0 ) console.log(p.frameRate());

        const flowFieldData = flowField.generate(p, !hideFlowField, MobileAdaptator.isMobileDevice());

        for (const particle of particles) {
            particle.follow(flowFieldData, scale, cols);
            particle.update();
            particle.edges(p);
            if (!hideParticles) {
                particle.show(p, true);
            }
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);

        // Recalculate rows and cols for flow field
        flowField.rows = Math.round(p.height / scale) + 3;
        flowField.cols = Math.round(p.width / scale) + 3;

        // Optionally regenerate the flow field with updated dimensions
        flowField.generate(p);
    };

    function toggleHideFreeParticles() {
        if (hideParticles) {
            hideParticlesButton.html('Hide free particles');
            hideParticles = false;
        } else {
            hideParticlesButton.html('Show free particles');
            hideParticles = true;
        }
    }

    function toggleHideFlowField() {
        if (hideFlowField) {
            hideFlowFieldButton.html('Hide flow field');
            hideFlowField = false;
        } else {
            hideFlowFieldButton.html('Show flow field');
            hideFlowField = true;
        }
    }
};

