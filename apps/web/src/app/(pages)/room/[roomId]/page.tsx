"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { ShapeType, SimpleShape } from "@repo/schemas";
import { useRoomStore } from "@/store/room.store";

function drawShapesFromArray(shapes: SimpleShape[], canvasRef: React.RefObject<HTMLCanvasElement | null>){
    if(!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if(!ctx) return;
    const rc = rough.canvas(canvasRef.current);
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    shapes.forEach(shape => {
        if(shape.type === "ELLIPSE"){
            rc.draw(shape.dataFromRoughJs as Drawable);
        }
    });
}


export default function RoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const roughCanvasRef = useRef<RoughCanvas | null>(null);
    const [currentShape, setCurrentShape] = useState<ShapeType>("ELLIPSE");
    
    const {
        shapes,
        isConnected,
        onlineMembers,
        openOverview,
        closeOverview,
        addShape,
        clearShapes,
        canManageCurrentRoom,
        fetchCurrentRoomData,
        fetchShapes,
        initializeSocket,
        disconnectSocket
    } = useRoomStore();
    useEffect(() => {
        if (!sessionLoading) {
            setLoading(false);
        }
    }, [sessionLoading]);

    useEffect(() => {
        if (session && session.user && !loading && roomId) {
            openOverview(roomId);
            initializeSocket();
            fetchCurrentRoomData(roomId);
            
            // Refresh room data every 30 seconds to keep role info updated
            const interval = setInterval(() => {
                fetchCurrentRoomData(roomId);
            }, 30000);
            
            return () => {
                clearInterval(interval);
                closeOverview();
                disconnectSocket();
            };
        }
    }, [session, roomId, sessionLoading, loading, openOverview, closeOverview, initializeSocket, disconnectSocket, fetchCurrentRoomData]);

    useEffect(()=>{
        const canvas = canvasRef.current;
        if(!canvas) return;

        const ctx = canvas.getContext("2d");
        if(!ctx) return;

        roughCanvasRef.current = rough.canvas(canvas);
        let isDrawing = false;
        let startX = 0;
        let startY = 0;
        
        const handleMouseDown = (e: MouseEvent) => {
            startX = e.offsetX;
            startY = e.offsetY;
            isDrawing = true;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            if(isDrawing){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawShapesFromArray(shapes, canvasRef);
                roughCanvasRef.current?.ellipse((startX+x)/2, (startY+y)/2, Math.abs(x-startX), Math.abs(y-startY), {stroke: "red", strokeWidth: 2, seed:1, roughness: 1.5});
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            if(isDrawing){
                const shape = roughCanvasRef.current?.ellipse((startX+x)/2, (startY+y)/2, Math.abs(x-startX), Math.abs(y-startY), {stroke: "red", strokeWidth: 2, seed:1, roughness: 1}) as Drawable;
                if(shape && session?.user?.id){
                    const newShape = {
                        type: "ELLIPSE" as ShapeType,
                        dataFromRoughJs: shape,
                        roomId: roomId,
                        creatorId: session.user.id
                    };
                    addShape(newShape, session.user.id);
                }
            }
            isDrawing = false;
            startX = 0;
            startY = 0;
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
        };
    },[shapes, roomId]);

    const [previousShapesLength, setPreviousShapesLength] = useState(0);

    useEffect(() => {
        if (shapes.length > 0) {
            drawShapesFromArray(shapes, canvasRef);
        } else {
            // Clear canvas when shapes array is empty
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        }

        // Show notification when shapes are cleared by other users
        if (previousShapesLength > 0 && shapes.length === 0) {
            toast.info('All shapes have been cleared');
        }
        
        setPreviousShapesLength(shapes.length);
    }, [shapes, previousShapesLength]);

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

    return (
        <div className="relative">
            <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                    Online: {onlineMembers.length} members
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                    Role: {canManageCurrentRoom(session?.user) ? 'Admin/Owner' : 'Member'}
                </div>
                {canManageCurrentRoom(session?.user) && (
                    <button
                        onClick={async () => {
                            if (confirm('Are you sure you want to clear all shapes? This action cannot be undone.')) {
                                try {
                                    await clearShapes();
                                    toast.success('All shapes cleared successfully!');
                                } catch (error) {
                                    toast.error('Failed to clear shapes');
                                    console.error('Error clearing shapes:', error);
                                }
                            }
                        }}
                        className="w-full text-xs bg-destructive text-destructive-foreground px-3 py-2 rounded hover:bg-destructive/90 transition-colors"
                    >
                        Clear All Shapes
                    </button>
                )}
            </div>
            <canvas 
                id="canvas" 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                className="cursor-crosshair"
            />
        </div>
    );
}