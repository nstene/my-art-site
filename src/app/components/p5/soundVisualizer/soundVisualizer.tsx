'use client';
import { useEffect } from 'react';
import p5 from 'p5';

export const MySketch = () => (p: p5, parentRef: HTMLDivElement) => {
    const width = p.windowWidth;
    const height = p.windowHeight;

    let sound: p5.SoundFile;
    let fft: p5.FFT;

    p.preload = () => {
      sound = p.loadSound('/music/Nymphs-007-NicolasJaar-Fight.wav');
    };

    p.setup = () => {
      // Initiate the FFT object
      //fft = new p.FFT()
      p.createCanvas(width, height);
      const playButton = p.createButton('Play Music');
      playButton.position(width/2, height/2);
      playButton.mousePressed(() => {
        sound.play();
    });
    };

    p.draw = () => {    
      
      p.fill('white');
      p.text('Hello, p5.js!', p.width/2, p.height/2);

      // Run the analysis, while the audio is playing
      //fft.analyze();

      // Get different values for different frequency ranges
      // -----------------------------------------------------
      // p5.sound comes with predefined keywords, 
      // but giving getEnergy() 2 numbers instead of a keyword 
      // you could use your custom range if needed
      //var bass    = fft.getEnergy( "bass" );
      //var treble  = fft.getEnergy( "treble" );
      //var mid     = fft.getEnergy( "mid" );     
      //var custom  = fft.getEnergy( 100, 200 );
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

