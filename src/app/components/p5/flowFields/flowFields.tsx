import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
//import { FlowField } from '@/app/utils/FlowField';
import { Particle } from '@/app/utils/Particle';
import { FlowField } from '@/app/utils/FlowField';

const scale = 20;
let rows: number;
let cols: number;
const inc = 0.1;
let center: number[];
const deltaZ = 0.005;
let particles: Particle[] = [];
const nParticles = 1000;
let flowField: FlowField;
const showField = false;

export const MySketch = () => (p: p5) => {

    p.setup = async () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        cols = Math.floor(p.width / scale);
        rows = Math.floor(p.height / scale);
        p.frameRate(64);
        center = [0, 0];

        for (let i = 0; i < nParticles; i++) {
            particles.push(new Particle(0.1, p.createVector(p.random(p.width), p.random(p.height))));
        }

        flowField = new FlowField(rows, cols, deltaZ, scale, showField, p);
    };

    p.draw = () => {
        p.background(0, 10);

        if ( p.frameCount%10 === 0 ) console.log(p.frameRate());

        const flowFieldData = flowField.generate(p);

        for (const particle of particles) {
            particle.follow(flowFieldData, scale, cols);
            particle.update();
            particle.edges(p);
            particle.show(p, true);
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

