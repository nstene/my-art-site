"use client";
import React, { useState, useRef } from "react";
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
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    // Clear any existing timeout when mouse enters
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Set a timeout to close the dropdown after x milliseconds
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 250); // Time for the menu to stay open, in milliseconds
  };

  return (
    <>
      <div className="w-full h-30 bg-emerald-800 sticky top-0">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <ul className="hidden md:flex gap-x-6 text-white">
              <li>
                <Link href="/classic-routes/presentation">
                  <p>Presentation</p>
                </Link>
              </li>
              <li>
                <Link href="/classic-routes/Journal">
                  <p>Journal</p>
                </Link>
              </li>
              <li>
                <Link href="/classic-routes/ThreeDPage">
                  <p>3D artwork</p>
                </Link>
              </li>
              <li
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave} 
                className="relative" // This is to position the dropdown correctly
              >
                <Link href="/classic-routes/TwoDPage">
                  <p>2D artwork</p>
                </Link>

              {isDropdownOpen && (
                <ul className="absolute left-0 mt-2 w-48 bg-white text-black shadow-lg">
                  <li>
                    <Link href="/classic-routes/TwoDPage1">
                      <p className="p-2 hover:bg-gray-200">2D Art 1</p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/classic-routes/TwoDPage2">
                      <p className="p-2 hover:bg-gray-200">2D Art 2</p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/classic-routes/TwoDPage3">
                      <p className="p-2 hover:bg-gray-200">2D Art 3</p>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
              <li>
                <Link href="/classic-routes/trip-reports">
                  <p>Trip reports</p>
                </Link>
              </li>
              <li>
                <Link href="/classic-routes/signup">
                  <p>Access request</p>
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