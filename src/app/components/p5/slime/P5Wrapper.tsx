// components/P5Wrapper.tsx
"use client";
import { useEffect, useRef } from 'react';
import { MySketch } from './slime';

const P5Wrapper = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { 
    // Function to initialize p5.js and the sketch
    const initP5 = async () => {
      try {
        // Dynamically import p5 and p5.sound addon
        const p5Module = await import('p5');
        const p5SoundModule = await import('p5/lib/addons/p5.sound');        
        
        // Ensure p5 and p5.sound are loaded
        if (!p5Module.default || !p5SoundModule) {
          throw new Error('p5 or p5.sound failed to load');
        }

        // Create a new p5 instance and pass the sketch and the canvas reference
        if (canvasRef.current) {
          const p5Instance = new p5Module.default((p: any) => {
            MySketch()(p, canvasRef.current!); // Non-null assertion operator
          }, canvasRef.current);

          // Return cleanup function
          return () => {
            p5Instance.remove();
          };
        }
      } catch (error) {
        console.error('Error loading p5:', error);
      }
    };

    // Call the initialization function
    const cleanupPromise = initP5();

    // Handle cleanup when the component unmounts
    cleanupPromise.then((cleanup) => {
      if (cleanup) {
        return () => cleanup();
      }
    });

    // Cleanup on component unmount
    return () => {
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, []); // Dependency array ensures effect runs only on mount

  return <div ref={canvasRef} style={{ width: '100%', height: '100vh' }} />; // Full screen canvas
};

export default P5Wrapper;
