import { Bungee_Shade } from 'next/font/google' 
import "../../globals.css";
// Server-side session fetcher
import { getServerSession } from "next-auth";
import SessionProvider from "../../components/SessionProvider";
import MovingBanner from "../../components/MovingBanner/MovingBanner";

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
          {children}
          <MovingBanner />
        </SessionProvider>
      </div>
    </>
  );
}
