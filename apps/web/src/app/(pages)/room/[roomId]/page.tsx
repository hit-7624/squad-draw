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
import ShapeSelector from "@/components/ShapeSelector";
import TypeControlPanel from '@/components/ControlPanel';
import type { DrawingOptions } from '@/components/ControlPanel';

function drawShapesFromArray(shapes: SimpleShape[], canvasRef: React.RefObject<HTMLCanvasElement | null>){
    if(!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if(!ctx) return;
    const rc = rough.canvas(canvasRef.current);
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    shapes.forEach(shape => {
        rc.draw(shape.dataFromRoughJs as Drawable);
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
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
    const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
    const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>({
        stroke: "#e5e5e5",
        strokeWidth: 2,
        fill: "rgba(255, 255, 255, 0.1)",
        fillStyle: "solid",
        roughness: 0,
        strokeLineDash: [],
        fillOpacity: 0.25
    });
    
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
        
        const handleMouseDown = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            
            if (currentShape === "FREEDRAW") {
                setIsDrawing(true);
                setCurrentPath([[x, y]]);
            } else {    
                setStartPoint([x, y]);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            
            if (currentShape === "FREEDRAW" && isDrawing) {
                // Handle free draw
                const lastPoint = currentPath[currentPath.length - 1];
                const minDistance = 3;
                
                if (!lastPoint || Math.sqrt(Math.pow(x - lastPoint[0], 2) + Math.pow(y - lastPoint[1], 2)) > minDistance) {
                    const newPath = [...currentPath, [x, y] as [number, number]];
                    setCurrentPath(newPath);
                    
                    // Redraw canvas with existing shapes
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawShapesFromArray(shapes, canvasRef);
                    
                    // Draw current free draw path
                    if (newPath.length > 1) {
                        roughCanvasRef.current?.linearPath(newPath, {
                            ...drawingOptions,
                            strokeWidth: 3,
                            roughness: 0,
                            disableMultiStroke: true,
                            seed: 1
                        });
                    }
                }
            } else if (startPoint) {
                // Handle other shapes
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawShapesFromArray(shapes, canvasRef);
                
                const centerX = (startPoint[0] + x) / 2;
                const centerY = (startPoint[1] + y) / 2;
                const width = Math.abs(x - startPoint[0]);
                const height = Math.abs(y - startPoint[1]);
                
                switch(currentShape) {
                    case "ELLIPSE":
                        roughCanvasRef.current?.ellipse(centerX, centerY, width, height, { ...drawingOptions, seed: 1 });
                        break;
                    case "RECTANGLE":
                        roughCanvasRef.current?.rectangle(startPoint[0], startPoint[1], width, height, { ...drawingOptions, seed: 1 });
                        break;
                    case "LINE":
                        roughCanvasRef.current?.line(startPoint[0], startPoint[1], x, y, { ...drawingOptions, seed: 1 });
                        break;
                    case "DIAMOND":
                        const points = [
                            [centerX, startPoint[1]] as [number, number],
                            [x, centerY] as [number, number],
                            [centerX, y] as [number, number],
                            [startPoint[0], centerY] as [number, number]
                        ];
                        roughCanvasRef.current?.polygon(points, { ...drawingOptions, seed: 1 });
                        break;
                    case "ARROW":
                        roughCanvasRef.current?.line(startPoint[0], startPoint[1], x, y, { ...drawingOptions, seed: 1 });
                        const angle = Math.atan2(y - startPoint[1], x - startPoint[0]);
                        const arrowLength = 15;
                        const arrowAngle = Math.PI / 6;
                        const arrowX1 = x - arrowLength * Math.cos(angle - arrowAngle);
                        const arrowY1 = y - arrowLength * Math.sin(angle - arrowAngle);
                        const arrowX2 = x - arrowLength * Math.cos(angle + arrowAngle);
                        const arrowY2 = y - arrowLength * Math.sin(angle + arrowAngle);
                        roughCanvasRef.current?.line(x, y, arrowX1, arrowY1, { ...drawingOptions, seed: 1 });
                        roughCanvasRef.current?.line(x, y, arrowX2, arrowY2, { ...drawingOptions, seed: 1 });
                        break;
                }
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            const x = e.offsetX;
            const y = e.offsetY;
            
            if (currentShape === "FREEDRAW" && isDrawing) {
                // Handle free draw completion
                if (currentPath.length > 1) {
                    const shape = roughCanvasRef.current?.linearPath(currentPath, {
                        ...drawingOptions,
                        strokeWidth: 3,
                        roughness: 0,
                        disableMultiStroke: true,
                        seed: 1
                    }) as Drawable;
                    
                    if(shape && session?.user?.id){
                        const newShape = {
                            type: "LINE" as ShapeType, // Use LINE type for free draw
                            dataFromRoughJs: shape,
                            roomId: roomId,
                            creatorId: session.user.id
                        };
                        addShape(newShape, session.user.id);
                    }
                }
                
                setIsDrawing(false);
                setCurrentPath([]);
            } else if (startPoint) {
                // Handle other shapes
                const centerX = (startPoint[0] + x) / 2;
                const centerY = (startPoint[1] + y) / 2;
                const width = Math.abs(x - startPoint[0]);
                const height = Math.abs(y - startPoint[1]);
                
                let shape: Drawable | undefined;
                
                switch(currentShape) {
                    case "ELLIPSE":
                        shape = roughCanvasRef.current?.ellipse(centerX, centerY, width, height, { ...drawingOptions, seed: 1 }) as Drawable;
                        break;
                    case "RECTANGLE":
                        shape = roughCanvasRef.current?.rectangle(startPoint[0], startPoint[1], width, height, { ...drawingOptions, seed: 1 }) as Drawable;
                        break;
                    case "LINE":
                        shape = roughCanvasRef.current?.line(startPoint[0], startPoint[1], x, y, { ...drawingOptions, seed: 1 }) as Drawable;
                        break;
                    case "DIAMOND":
                        const points = [
                            [centerX, startPoint[1]] as [number, number],
                            [x, centerY] as [number, number],
                            [centerX, y] as [number, number],
                            [startPoint[0], centerY] as [number, number]
                        ];
                        shape = roughCanvasRef.current?.polygon(points, { ...drawingOptions, seed: 1 }) as Drawable;
                        break;
                    case "ARROW":
                        shape = roughCanvasRef.current?.line(startPoint[0], startPoint[1], x, y, { ...drawingOptions, seed: 1 }) as Drawable;
                        const angle = Math.atan2(y - startPoint[1], x - startPoint[0]);
                        const arrowLength = 15;
                        const arrowAngle = Math.PI / 6;
                        const arrowX1 = x - arrowLength * Math.cos(angle - arrowAngle);
                        const arrowY1 = y - arrowLength * Math.sin(angle - arrowAngle);
                        const arrowX2 = x - arrowLength * Math.cos(angle + arrowAngle);
                        const arrowY2 = y - arrowLength * Math.sin(angle + arrowAngle);
                        const arrowHead1 = roughCanvasRef.current?.line(x, y, arrowX1, arrowY1, { ...drawingOptions, seed: 1 }) as Drawable;
                        const arrowHead2 = roughCanvasRef.current?.line(x, y, arrowX2, arrowY2, { ...drawingOptions, seed: 1 }) as Drawable;
                        if(shape && arrowHead1 && arrowHead2 && session?.user?.id){
                            const mainArrowShape = {
                                type: currentShape,
                                dataFromRoughJs: shape,
                                roomId: roomId,
                                creatorId: session.user.id
                            };
                            const arrowHead1Shape = {
                                type: "LINE" as ShapeType,
                                dataFromRoughJs: arrowHead1,
                                roomId: roomId,
                                creatorId: session.user.id
                            };
                            const arrowHead2Shape = {
                                type: "LINE" as ShapeType,
                                dataFromRoughJs: arrowHead2,
                                roomId: roomId,
                                creatorId: session.user.id
                            };
                            addShape(mainArrowShape, session.user.id);
                            addShape(arrowHead1Shape, session.user.id);
                            addShape(arrowHead2Shape, session.user.id);
                        }
                        break;
                }
                
                if(shape && session?.user?.id && currentShape !== "ARROW"){
                    const newShape = {
                        type: currentShape,
                        dataFromRoughJs: shape,
                        roomId: roomId,
                        creatorId: session.user.id
                    };
                    addShape(newShape, session.user.id);
                }
                
                setStartPoint(null);
            }
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
        };
    },[shapes, roomId, currentShape, isDrawing, currentPath, startPoint, session?.user?.id, drawingOptions]);

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
            <ShapeSelector 
                currentShape={currentShape}
                onShapeChange={setCurrentShape}
            />
            <TypeControlPanel options={drawingOptions} onChange={setDrawingOptions} />
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