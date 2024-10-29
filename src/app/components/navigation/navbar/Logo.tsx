"use client"; // enable usage of useState hook
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

const Logo = () => {
  //update the size of the logo when the size of the screen changes
  const [windowWidth, setWindowWidth] = useState(0);

  const updateWidth = () => {
    const newWidth = window.innerWidth;
    setWindowWidth(newWidth);
  };

  // updateWidth function is placed inside the useEffect hook because it references the 'window' object, which is only available on the client side.
  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth); // Cleanup on unmount
  }, []);

  return (
    <>
      {/* Centering Container */}
      <div className="logo-container">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={Math.floor(windowWidth * 0.35)} // Set width to 75% of window width
            height={Math.floor(windowWidth * 0.35)}
            className="logo"
            // apply rotation animation
            style={{
              filter: 'invert(1)', // Invert the colors
              animation: 'rotate 5s linear infinite',
              position: 'relative'
            }}
          />
        </Link>
      </div>

      {/* Add styles for centering */}
      <style jsx>{`
        .logo-container {
          display: flex;
          justify-content: center; /* Center horizontally */
          align-items: center; /* Center vertically */
          height: 100vh; /* Full viewport height */
          position: relative; /* Allow absolute positioning of inner elements */
        }

        .logo {
          /* Centering the logo on the page */
          transform-origin: center; /* Ensure the logo rotates around its center */
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        
      `}
      </style>
    </>
  );
};

export default Logo;