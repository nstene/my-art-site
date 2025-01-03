"use client";
import React, { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const MobileNavbar = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleMouseClick = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="absolute top-0 right-0 md:hidden flex items-center z-50">
            <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-white bg-transparent ml-auto">
                {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>

            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 md:hidden bg-transparent text-white px-4 py-2">
                    <ul className="space-y-4">
                        <li onClick={handleMouseClick} className="relative">
                            <Link href="">
                                <p className="p-2 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))]">2D Animations</p>
                            </Link>

                            {isDropdownOpen && (
                                <ul className="relative left-0 mt-2 w-48 bg-transparent text-white shadow-lg">
                                    <li>
                                        <Link href="/classic-routes/TwoDPages/mergedProject">
                                            <button className="p-4 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                                                Stargazing
                                            </button>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/classic-routes/TwoDPages/slime">
                                            <button className="p-4 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                                                Slime
                                            </button>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/classic-routes/TwoDPages/dreams">
                                            <button className="p-4 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                                                Dreams
                                            </button>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/classic-routes/TwoDPages/dla">
                                            <button className="p-4 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                                                DLA
                                            </button>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/classic-routes/TwoDPages/flowFields">
                                            <button className="p-4 rounded-full hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-1000 ease-in-out">
                                                Flow Field
                                            </button>
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MobileNavbar;