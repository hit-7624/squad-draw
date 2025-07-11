'use client';

import rough from "roughjs";
import { use, useEffect, useRef, useState } from "react";

export default function RoomPage({params}:{params:Promise<{roomId: string}>}) {
    const {roomId} = use(params);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const roughCanvasRef = useRef<any>(null);
    const [allShapes, setAllShapes] = useState<any[]>([]);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
    const [drawingMode, setDrawingMode] = useState<'freehand' | 'ellipse'>('freehand');

    const redrawCanvas = async () => {
        if (!canvasRef.current || !roughCanvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const rc = roughCanvasRef.current;
        for (const shape of allShapes) {
            if (shape.dataFromRoughJs) {
                rc.draw(shape.dataFromRoughJs);
            } else {
                rc.draw(shape);
            }
        }
    };

    useEffect(() => {
        if (canvasRef.current) {
            roughCanvasRef.current = rough.canvas(canvasRef.current);
            
            const fetchShapes = async () => {
                try {
                    const response = await fetch(`/api/rooms/${roomId}/shapes`, {
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const shapes = data.shapes || [];
                        setAllShapes(shapes);
                    } else {
                        console.error("Failed to fetch shapes");
                        setAllShapes([]);
                    }
                } catch (err) {
                    console.error("Error fetching shapes", err);
                    setAllShapes([]);
                }
            };       
            fetchShapes();
        }
    }, [roomId]);

    useEffect(() => {
        redrawCanvas();
    }, [allShapes]);

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        setIsDrawing(true);
        setCurrentPath([[x, y]]);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current || !roughCanvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (drawingMode === 'freehand') {
            const lastPoint = currentPath[currentPath.length - 1];
            const minDistance = 3;
            
            if (!lastPoint || Math.sqrt(Math.pow(x - lastPoint[0], 2) + Math.pow(y - lastPoint[1], 2)) > minDistance) {
                const newPath = [...currentPath, [x, y] as [number, number]];
                setCurrentPath(newPath);
                
                redrawCanvas();
            
                if (newPath.length > 1) {
                    const rc = roughCanvasRef.current;
                    rc.linearPath(newPath, {
                        stroke: "red",
                        strokeWidth: 3,
                        roughness: 0,
                        bowing: 0,
                        seed: 1,
                        opacity: 1,
                        disableMultiStroke: true
                    });
                }
            }
        } else {
            const startPoint = currentPath[0];
            if (startPoint) {
                const width = Math.abs(x - startPoint[0]);
                const height = Math.abs(y - startPoint[1]);
                const centerX = (startPoint[0] + x) / 2;
                const centerY = (startPoint[1] + y) / 2;
                
                redrawCanvas();
                
                if (width > 5 && height > 5) {
                    const rc = roughCanvasRef.current;
                    rc.ellipse(centerX, centerY, width, height, {
                        stroke: 'orange',
                        strokeWidth: 3,
                        fill: 'rgba(255, 165, 0, 0.3)',
                        fillStyle: 'solid',
                        roughness: 0,
                        bowing: 1,
                        seed: 1
                    });
                }
            }
        }
    };

    const handleMouseUp = async (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !roughCanvasRef.current) return;
        
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (drawingMode === 'freehand') {
            if (currentPath.length > 1) {
                const rc = roughCanvasRef.current;
                const shape = rc.linearPath(currentPath, {
                    stroke: "red",
                    strokeWidth: 3,
                    roughness: 0,
                    bowing: 0,
                    seed: 1,
                    opacity: 1,
                    disableMultiStroke: true
                });
                setAllShapes(prev => [...prev, shape]);
                
                try {
                    await fetch(`/api/rooms/${roomId}/shapes`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            type: "LINE",
                            dataFromRoughJs: shape
                        })
                    });
                } catch (err) { 
                    console.error("Error saving shape", err);
                }   
            }
        } else {
            const startPoint = currentPath[0];
            if (startPoint) {
                const width = Math.abs(x - startPoint[0]);
                const height = Math.abs(y - startPoint[1]);
                const centerX = (startPoint[0] + x) / 2;
                const centerY = (startPoint[1] + y) / 2;
                
                if (width > 5 && height > 5) {
                    const rc = roughCanvasRef.current;
                    const shape = rc.ellipse(centerX, centerY, width, height, {
                        stroke: 'orange',
                        strokeWidth: 2,
                        fill: 'rgba(255, 165, 0, 0.3)',
                        fillStyle: 'solid',
                        roughness: 0,
                        seed: 1
                    });
                    
                    setAllShapes(prev => [...prev, shape]);
                    
                    try {
                        await fetch(`/api/rooms/${roomId}/shapes`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                type: "ELLIPSE",
                                dataFromRoughJs: shape
                            })
                        });
                    } catch (err) {
                        console.error("Error saving shape", err);
                    }
                }
            }
        }
        
        setIsDrawing(false);
        setCurrentPath([]);
    };

    const clearCanvas = () => {
        setAllShapes([]);
    };

    const addDemoShapes = () => {
        if (!roughCanvasRef.current) return;
        
        const rc = roughCanvasRef.current;
        const demoShapes = [
            rc.rectangle(50, 50, 200, 100, {
                stroke: 'blue',
                strokeWidth: 2,
                fill: 'rgba(0, 100, 255, 0.1)',
                fillStyle: 'hachure'
            }),
            rc.circle(200, 200, 80, {
                stroke: 'red',
                strokeWidth: 2,
                fill: 'rgba(255, 0, 0, 0.1)',
                fillStyle: 'solid'
            }),
            rc.line(50, 300, 350, 300, {
                stroke: 'green',
                strokeWidth: 3
            }),
        ];
        
        setAllShapes(prev => [...prev, ...demoShapes]);
    };

    return (
        <div className="flex flex-col items-center p-4 min-h-screen bg-bg-2 text-font-1">
            <h1 className="text-3xl font-handlee mb-4 text-font-1">Room: {roomId}</h1>
            
            <div className="mb-4 flex gap-2">
                <button 
                    onClick={() => setDrawingMode('freehand')}
                    className={`px-4 py-2 rounded transition-colors ${
                        drawingMode === 'freehand' 
                            ? 'bg-custom text-white' 
                            : 'bg-bg-1 text-font-1 border border-border-1 hover:bg-bg-2'
                    }`}
                >
                    ✏️ Freehand
                </button>
                <button 
                    onClick={() => setDrawingMode('ellipse')}
                    className={`px-4 py-2 rounded transition-colors ${
                        drawingMode === 'ellipse' 
                            ? 'bg-custom text-white' 
                            : 'bg-bg-1 text-font-1 border border-border-1 hover:bg-bg-2'
                    }`}
                >
                    ⭕ Ellipse
                </button>
            </div>
            
            <div className="mb-4 space-x-2 flex flex-wrap gap-2">
                <button 
                    onClick={clearCanvas}
                    className="px-4 py-2 bg-delete text-white rounded hover:bg-delete-hover transition-colors"
                >
                    🗑️ Clear Canvas
                </button>
                <button 
                    onClick={addDemoShapes}
                    className="px-4 py-2 bg-custom text-white rounded hover:bg-custom-hover transition-colors"
                >
                    ➕ Add Demo Shapes
                </button>
            </div>
            
            <div className="border-2 border-border-1 rounded-lg shadow-lg">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="bg-white rounded-lg cursor-crosshair"
                    style={{ 
                        width: '800px', 
                        height: '600px',
                        maxWidth: '100%'
                    }}
                />
            </div>
            
            <div className="mt-4 text-center max-w-2xl">
                <div className="bg-bg-1 border border-border-1 p-4 rounded-lg">
                    <h3 className="font-bold mb-2 text-font-1">How to Draw:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-font-2">
                        <div>
                            <strong className="text-font-1">✏️ Freehand Mode:</strong> 
                            <br />Click and drag to draw smooth, sketchy lines
                        </div>
                        <div>
                            <strong className="text-font-1">⭕ Ellipse Mode:</strong>
                            <br />Click and drag to create ellipses
                        </div>
                    </div>
                    <p className="text-xs text-font-2 mt-2">
                        Current mode: <strong className="text-font-1">{drawingMode === 'freehand' ? '✏️ Freehand Drawing' : '⭕ Ellipse Drawing'}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
