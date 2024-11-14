import { signIn, signOut, useSession } from "next-auth/react";

const AuthButton = () => {
    const { data: session } = useSession();

    if (session) {
        return (
            <>
                {session?.user?.name}
                <button className="p-2 rounded-full bg-transparent hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-300 ease-in-out" onClick={() => signOut()}>Sign out</button>
            </>
        );
    }
    return (
        <>
            <button className="p-2 rounded-full bg-transparent hover:bg-[radial-gradient(circle,rgba(64,64,64,1),rgba(64,64,64,0))] transition duration-300 ease-in-out" onClick={() => signIn()}>Sign in</button>
        </>
    );
}

export default AuthButton;