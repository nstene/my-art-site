import Image from "next/image";
// import <Link> component to provide prefetching and client-side navigation between routes
import Link from 'next/link'
import MovingBanner from "./components/MovingBanner/MovingBanner";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <p> Hi there! This is custom code. <br />
        Everything that follows is pre-built. 
        </p>
      </main>      
    </div>
  );
}
