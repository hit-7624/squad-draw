"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import rough from "roughjs";

export default function RoomPage() {
    const { roomId } = useParams();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!sessionLoading) {
            setLoading(false);
        }
    }, [sessionLoading]);


    useEffect(()=>{
        const canvas = canvasRef.current;
        if(!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        if(!ctx) return;

        const rc = rough.canvas(canvas);

        const shape = rc.circle(100, 100, 100, {roughness: 1});
    

    })

    if (loading || sessionLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center text-foreground">
                    <h2 className="text-3xl font-sans mb-4">Loading Room...</h2>
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center text-foreground">
                    <h2 className="text-3xl font-sans mb-4">Please sign in to access the room</h2>
                    <button 
                        onClick={() => router.push('/signin')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return <div>
        {/* Access user data directly from session */}
        <h1>Welcome, {session.user.name}!</h1>
        <canvas id="canvas" ref={canvasRef}></canvas>
        <p>Room ID: {roomId}</p>
    </div>;
}