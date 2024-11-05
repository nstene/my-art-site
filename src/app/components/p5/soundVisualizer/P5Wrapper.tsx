// components/P5Wrapper.tsx
"use client";
import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import p5Types from 'p5';
import { MySketch } from './soundVisualizer';

type P5jsContainerRef = HTMLDivElement;
type P5jsSketch = (p: p5Types, parentRef: P5jsContainerRef) => void;
type P5jsContainer = ({ sketch }: { sketch: P5jsSketch }) => React.JSX.Element;

export const P5jsContainer: P5jsContainer = ({ sketch }) => {
  const parentRef = useRef<P5jsContainerRef>(null);

  return <div ref={parentRef}></div>;
};

const P5Wrapper = ({ sketch }: { sketch: P5jsSketch }) => {
  
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const parentRef = useRef<P5jsContainerRef>(null);

  useEffect(() => {
    setIsMounted(true); // Ensure component is mounted
  }, []);

  useEffect(() => {
    // If not mounted, do nothing
    if (!isMounted || !parentRef.current) return;
 
    // Function to initialize p5.js and the sketch
    const initP5 = async () => {
      try {
        // Dynamically import p5 and p5.sound addon
        const p5Module = await import('p5');
        await import('p5/lib/addons/p5.sound');
        
        const p5Instance = new p5Module.default((p: p5Types) => {
          if (parentRef.current) {
            sketch(p, parentRef.current); // Pass p5 instance and parent ref to the sketch
          }
        });

        // Return a cleanup function
        return () => {
          p5Instance.remove(); // Cleanup p5 instance when the component unmounts
        };
      } catch (error) {
        console.error('Error loading p5:', error);
      }
    };

    // Call the initialization function
    const cleanupPromise = initP5();

    // Use the async cleanup once the promise resolves
    cleanupPromise.then((cleanup) => {
      // If cleanup exists, call it
      if (cleanup) {
        return () => cleanup();
      }
    });

    // Cleanup on component unmount
    return () => {
      if (cleanupPromise) {
        cleanupPromise.then((cleanup) => {
          if (cleanup) cleanup();
        });
      }
    };
  }, [isMounted, sketch]); // Dependency array ensures effect runs when mounted and sketch changes


  return <P5jsContainer sketch={sketch} />;
};

export default P5Wrapper;
