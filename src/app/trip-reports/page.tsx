import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function TripReportsPage() {
    const session = await getServerSession();
    
    // if no session, redirect to sign in page
    if (!session || !session.user) {
        redirect("/api/auth/signin")
    }

    return (
        <div>
            Welcome to the trip reports page! <br />
            You will only see this if you're trusted. <br />
            Please be worthy of that trust.
        </div>
    )
}