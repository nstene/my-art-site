"use client";
import React, { useState, useRef } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import AuthButton from "../AuthButton/AuthButton";

const MobileNavbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleMouseClick = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="md:hidden flex items-center">
      <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-white bg-transparent">
        {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {isMenuOpen && (
        <div className="md:hidden bg-transparent text-white px-4 py-2">
          <ul className="space-y-4">
            <li onClick={handleMouseClick} className="relative">
              <Link href="">
                <p className="hover:text-gray-400">2D Artworks</p>
              </Link>

              {isDropdownOpen && (
                <ul className="absolute left-0 mt-2 w-48 bg-transparent text-white shadow-lg">
                  <li>
                    <Link href="/classic-routes/TwoDPages/mergedProject">
                      <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                        Stargazing
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
            {/* Add Auth Button in Mobile Menu */}
            <li>
              <AuthButton />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MobileNavbar;