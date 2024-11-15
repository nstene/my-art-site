import { Bungee_Shade } from 'next/font/google' 
import "../globals.css";
import DesktopNavbar from "../components/navigation/DesktopNavbar";
import MobileNavbar from "../components/navigation/MobileNavbar";
// Server-side session fetcher
import { getServerSession } from "next-auth";
import SessionProvider from "../components/SessionProvider";

const bungeeShade = Bungee_Shade({
  weight: "400",
  subsets: ['latin'],
  variable: "--font-bungee-shade"
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession();

  return (
    <>
      <div className={`${bungeeShade.variable} antialiased`}>
        <SessionProvider session={session}>
          {/* Wrapping the navbar and children in a container */}
          <div className="relative">
            <DesktopNavbar />
            <MobileNavbar />
            {/* Children will be placed here and can be rendered behind the navbar */}
            {children}
          </div>
        </SessionProvider>
      </div>
    </>
  );
}
