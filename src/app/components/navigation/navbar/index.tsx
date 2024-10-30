"use client";
import React from "react";
import Link from "next/link";
//import AuthButton from "./AuthButton";

import { signIn, signOut, useSession } from "next-auth/react";

function AuthButton1() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        {session?.user?.name} <br />
        <button className="h-12 rounded-lg bg-white font-bold px-5" onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button className="h-12 rounded-lg bg-white font-bold px-5" onClick={() => signIn()}>Sign in</button>
    </>
  );
}

//export default AuthButton;

const Navbar = () => {
  return (
    <>
      <div className="w-full h-30 bg-emerald-800 sticky top-0">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <ul className="hidden md:flex gap-x-6 text-white">
              <li>
                <Link href="/Journal">
                  <p>Journal</p>
                </Link>
              </li>
              <li>
                <Link href="/presentation">
                  <p>Presentation</p>
                </Link>
              </li>
              <li>
                <Link href="/ThreeDPage">
                  <p>3D artwork</p>
                </Link>
              </li>
              <li>
                <Link href="/TwoDPage">
                  <p>2D artwork</p>
                </Link>
              </li>
              <li>
                <Link href="/trip-reports">
                  <p>Trip reports</p>
                </Link>
              </li>
            </ul>
            <AuthButton1 />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;