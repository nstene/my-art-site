import { Space_Mono } from "next/font/google";
import "./globals.css";
// Server-side session fetcher
import { getServerSession } from "next-auth";
import SessionProvider from "./components/SessionProvider";

const spaceMono = Space_Mono({
  weight: "400",
  subsets: ['latin'],
  variable: "--font-space-mono"
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession();

  return (
    <html lang="en">
      <body
        className={`${spaceMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
