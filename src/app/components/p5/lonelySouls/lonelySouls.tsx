import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import { MobileAdaptator } from '@/app/utils/MobileAdaptator';
import { Soul } from '@/app/utils/Soul';
import { Souls } from '@/app/utils/Souls';

export const MySketch = () => (p: p5) => {

    let fullscreenButton: p5.Element;
    const nSouls = 2;
    const soulList: Soul[] = [];
    let souls: Souls;
    const rotationIncrement = 0.1;

    function toggleFullScreen() {
        const isFullScreen = p.fullscreen();
        p.fullscreen(!isFullScreen);
    }

    p.setup = async () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.frameRate(64);

        // Create button for full screen mode
        let fullScreenButtonPosition = 100;
        let fontSize = '18px';
        if (MobileAdaptator.isMobileDevice()) {
            fullScreenButtonPosition = 50;
            fontSize = '12px';
        }
        fullscreenButton = p.createButton('Full Screen');
        fullscreenButton.position(0, fullScreenButtonPosition);
        fullscreenButton.mousePressed(toggleFullScreen);
        fullscreenButton.style('font-size', fontSize);

        // Initiate some Souls
        const soulRadius = 20;
        const soulAcceleration = p.createVector(0, 0);
        const soulPositions = [p.createVector(p.width / 2 - 200, p.height / 2 - 200), p.createVector(p.width / 2 + 200, p.height / 2 + 200)];
        const soulVelocities = [p.createVector(0.5, 0), p.createVector(0, -0.5)];
        const soulIds = ['Nathan', 'Justine'];
        for (let i = 0; i < nSouls; i++) {
            soulList.push(new Soul(soulRadius, soulPositions[i], soulVelocities[i], soulAcceleration, soulIds[i]))
        }
        souls = new Souls(soulList);
    };

    p.draw = () => {
        p.background(0);
        souls.checkInteractions();
        souls.processInteractions(p);
        souls.animate(p);
        souls.showInteractions(p);

    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

