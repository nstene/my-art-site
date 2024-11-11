import dynamic from 'next/dynamic';

const P5Wrapper = dynamic(() => import('../../../components/p5/slime/P5Wrapper'));

export default function Home() {
  return (
    <div>
      <P5Wrapper />
    </div>
  );
}