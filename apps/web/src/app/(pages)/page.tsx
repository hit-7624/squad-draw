"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-1">
        <div className="text-font-1 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-1">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-font-1 mb-4 font-handlee">Squad Draw</h1>
        <p className="text-font-2 text-lg">Collaborative drawing made simple</p>
      </div>

      {session?.user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-font-1">Welcome back, {session.user.name}!</p>
          <Button className="bg-custom text-white hover:bg-custom-hover px-8 py-3 text-lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button className="bg-custom text-white hover:bg-custom-hover px-8 py-3 text-lg">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button className="bg-bg-2 border-border-1 text-font-1 hover:bg-bg-3 hover:border-border-2 px-8 py-3 text-lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}