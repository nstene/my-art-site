"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import AuthButton from "../AuthButton/AuthButton";

const DesktopNavbar = () => {
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
      <div className="hidden md:flex absolute w-full h-30 bg-transparent backdrop-blur-sm z-50 top-0">
        {/* Left side - Navigation Links */}
        <ul className="md:flex hidden gap-x-6 text-white">
          <li
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative" // This is to position the dropdown correctly
          >
            <Link href="">
              <button className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                2D Artworks
              </button>
            </Link>

            {isDropdownOpen && (
              <ul
                className="absolute left-0 mt-2 w-48 bg-[rgba(0,0,0,0.5)] backdrop-blur-md text-white shadow-lg rounded-lg"
              >
                <li>
                  <Link href="/classic-routes/TwoDPages/mergedProject">
                    <button className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                      Stargazing
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/classic-routes/TwoDPages/soundVisualizer">
                    <button className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                      Sound Visualizer
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/classic-routes/TwoDPages/slime">
                    <button className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                      Slime
                    </button>
                  </Link>
                </li>
              </ul>
            )}

          </li>
        </ul>

        {/* Right side: Authentication Button */}
        <div className="ml-auto ${isMenuOpen ? 'hidden' : 'block'}">
          <AuthButton />
        </div>
      </div>
    </>
  );
};

export default DesktopNavbar;