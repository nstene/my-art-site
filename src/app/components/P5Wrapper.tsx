// components/P5Wrapper.tsx
"use client";
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { MySketch } from './sketch';

export default function P5Wrapper() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const p5Instance = new p5(MySketch(), canvasRef.current);

      return () => {
        p5Instance.remove();
      };
    }
  }, []);

  return <div ref={canvasRef}></div>;
}