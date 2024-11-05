'use client';
import { MySketch } from '@/app/components/p5/soundVisualizer/soundVisualizer';
import dynamic from 'next/dynamic';

// Import the P5Wrapper dynamically, ensuring it's rendered only on the client-side
const P5Wrapper = dynamic(() => import('../../../components/p5/soundVisualizer/P5Wrapper'));

export default function Home() {
  return (
    <div>
      <h1>My p5.js Sketch</h1>
      <P5Wrapper sketch={MySketch}/>
    </div>
  );
}