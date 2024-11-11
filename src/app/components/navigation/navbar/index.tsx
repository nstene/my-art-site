"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";

import { signIn, signOut, useSession } from "next-auth/react";

function AuthButton1() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        {session?.user?.name}
        <button className="p-2 rounded-full bg-transparent hover:bg-[radial-gradient(circle,rgba(128,128,128,1),rgba(128,128,128,0))] transition duration-300 ease-in-out" onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in
      <button className="p-2 rounded-full bg-transparent hover:bg-[radial-gradient(circle,rgba(128,128,128,1),rgba(128,128,128,0))] transition duration-300 ease-in-out" onClick={() => signIn()}>Sign in</button>
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
      <div className="absolute w-full h-30 bg-transparent backdrop-blur-sm z-50 sticky top-0">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <ul className="hidden md:flex gap-x-6 text-white">
              <li>
                <Link href="/classic-routes/presentation">
                  <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                    Presentation
                  </p>
                </Link>
              </li>
              <li>
                <Link href="/classic-routes/Journal">
                  <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                    Journal
                  </p>
                </Link>
              </li>
              <li>
                <Link href="/classic-routes/ThreeDPage">
                  <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                    3D Artworks
                  </p>
                </Link>
              </li>
              <li
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave} 
                className="relative" // This is to position the dropdown correctly
              >
                <Link href="">
                  <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                    2D Artworks
                  </p>
                </Link>

              {isDropdownOpen && (
                <ul className="absolute left-0 mt-2 w-48 bg-transparent text-white shadow-lg">
                  <li>
                    <Link href="/classic-routes/TwoDPages/stargazing">
                      <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                        Stargazing
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/classic-routes/TwoDPages/mergedProject">
                      <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                        Merged Project
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/classic-routes/TwoDPages/soundVisualizer">
                      <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                        Sound Visualizer
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/classic-routes/TwoDPages/slime">
                      <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                        Slime
                      </p>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
              <li>
                <Link href="/classic-routes/trip-reports">
                  <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                    Trip Reports
                  </p>
                </Link>
              </li>
              <li>
                <Link href="/classic-routes/signup">
                  <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                    Access Requests
                  </p>
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