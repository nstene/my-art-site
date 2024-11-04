import dynamic from 'next/dynamic';

const P5Wrapper = dynamic(() => import('../../components/P5Wrapper'));

export default function Home() {
  return (
    <div>
      {/* <h1>My p5.js Sketch</h1> */}
      <P5Wrapper />
    </div>
  );
}