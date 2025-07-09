import Link from "next/link"
import { Button } from "../components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-1">
      <Button className="bg-bg-1 border-border-1 text-font-1 hover:bg-bg-2 hover:border-border-2">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    </div>
  );
}