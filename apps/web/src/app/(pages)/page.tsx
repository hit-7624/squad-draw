"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.svg" alt="Squad Draw" className="w-40 h-auto" />
        </div>
        <p className="text-muted-foreground text-lg">Collaborative drawing made simple</p>
      </div>

      {session?.user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-foreground">Welcome back, {session.user.name}!</p>
          <Button className="bg-custom text-white hover:bg-custom-hover px-8 py-3 text-lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button className="bg-custom text-white hover:bg-custom-hover px-8 py-3 text-lg">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 px-8 py-3 text-lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}