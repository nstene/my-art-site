import Image from "next/image";
// import <Link> component to provide prefetching and client-side navigation between routes
import Link from 'next/link'
import MovingBanner from "./components/MovingBanner/MovingBanner";
import Logo from "./components/navigation/navbar/Logo"

export default function Home() {
  return (
    <Logo />
  );
}
