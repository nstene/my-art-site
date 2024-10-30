// useSession used any time we're in a client component to get the current session from that session provider
import { signIn, signOut, useSession } from "next-auth/react";

function AuthButton() {
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

export default AuthButton;