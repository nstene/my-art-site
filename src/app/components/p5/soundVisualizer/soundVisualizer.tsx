'use client';
import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

export const MySketch = () => (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;

    let sound: p5.SoundFile;
    let fft: p5.FFT;

    p.preload = () => {
      sound = p.loadSound('/music/Nymphs-007-NicolasJaar-Fight.wav');
    };

    p.setup = () => {
      // Initiate the FFT object
      fft = new p5.FFT();
      p.createCanvas(width, height);

      // Create play button
      const playButton = p.createButton('Play Music');
      playButton.position(0, 100);
      playButton.mousePressed(() => {
        sound.play();
      });
      
      // Create pause button
      const pauseButton = p.createButton('Pause Music');
      pauseButton.position(0, 150);
      pauseButton.mousePressed(() => {
        sound.pause();
      });
    };

    p.draw = () => {    

      // Credits
      p.push();
      p.noStroke();
      p.fill('white');
      const text = "Jaar, Nicolas. 'Fight' Nymphs. https://www.jaar.site/";
      p.text(text, 0, height);
      p.pop();

      p.background(0, 5);
      p.noFill();

      // Run the analysis, while the audio is playing
      // The FFT algorithm decomposes the audio signal into different frequency components
      fft.analyze();

      // Get different values for different frequency ranges
      // -----------------------------------------------------
      // p5.sound comes with predefined keywords, 
      // but giving getEnergy() 2 numbers instead of a keyword 
      // you could use your custom range if needed

      // getEnergy measures the energy (or intensity) within a specified frequency range
      // It is the Root Mean Square energy for a specified frequency range
      // The RMS values are normalized to 0-255 range for easy use in visual mappings
      const bass    = fft.getEnergy( "bass" );
      const treble  = fft.getEnergy( "treble" );
      const mid     = fft.getEnergy( "mid" );     
      // let custom  = fft.getEnergy( 100, 200 );

      const mapBass     = p.map( bass, 0, 255, -100, 100 );
      const mapMid      = p.map( mid, 0, 255, -150, 150 );
      const mapTreble   = p.map( treble, 0, 255, -200, 200 );

      const red = p.map(p.sin(p.frameCount * 0.001), -1, 1, 100, 255);
      const green = p.map(p.sin(p.frameCount * 0.002 + p.PI / 3), -1, 1, 100, 255);
      const blue = p.map(p.sin(p.frameCount * 0.003 + (2 * p.PI) / 3), -1, 1, 100, 255);
      

      // Define in how many pieces you want to divide the circle
      const pieces = 32;

      // Circle's radius
      const radius = 400;

      // Move the origin to the center of the canvas
      p.translate( width/2, height/2 );

      // The centered circle
      p.stroke( red, green, blue );
      p.ellipse( 0, 0, radius );

      // For each piece draw a line
      for( let i = 0; i < pieces; i++ ) {
        
        p.rotate( p.TWO_PI / pieces );
    
        // Draw the bass lines
        p.line( mapBass, radius/2, 0, radius );
        
        // Draw the mid lines
        p.line( mapMid, radius/2, 0, radius );    

        // Draw the treble lines
        p.line( mapTreble, radius/2, 0, radius );       
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

