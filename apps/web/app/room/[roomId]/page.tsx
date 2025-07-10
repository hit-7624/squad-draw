'use client';

import rough from "roughjs";
import { use, useEffect, useRef, useState } from "react";

import { useUser } from "../../../hooks/useUser";
import axios from "axios";

export default function RoomPage({params}:{params:Promise<{roomId: string}>}) {
    const {roomId} = use(params);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const roughCanvasRef = useRef<any>(null);
    const [allShapes, setAllShapes] = useState<any[]>([]);
    const user = useUser();
    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
    const [drawingMode, setDrawingMode] = useState<'freehand' | 'ellipse'>('freehand');



    // Redraw all shapes
    const redrawCanvas = async () => {
        if (!canvasRef.current || !roughCanvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw all shapes
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
            // Initialize RoughJS canvas
            roughCanvasRef.current = rough.canvas(canvasRef.current);
            const rc = roughCanvasRef.current;
            
            // Draw some example shapes
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
            const fetchShapes = async () => {
                try {
                    const url = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";
                    const response = await axios.get(`${url}/api/rooms/${roomId}/shapes`, {withCredentials: true});
                    const shapes = response.data.shapes || []; // Extract shapes array from response
                    setAllShapes(shapes);
                } catch (err) {
                    console.error("Error fetching shapes", err);
                    setAllShapes([]);
                }
            }       
            fetchShapes();
        }
    }, [roomId]);

    // Redraw when shapes change
    useEffect(() => {
        redrawCanvas();
    }, [allShapes]);

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        setIsDrawing(true);
        
        if (drawingMode === 'freehand') {
            setCurrentPath([[x, y]]);
        } else {
            // For ellipse mode, store start point
            setCurrentPath([[x, y]]);
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current || !roughCanvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (drawingMode === 'freehand') {
            // Add point to current path (with distance threshold to reduce points)
            const lastPoint = currentPath[currentPath.length - 1];
            const minDistance = 3; // Only add points that are at least 3px apart
            
            if (!lastPoint || Math.sqrt(Math.pow(x - lastPoint[0], 2) + Math.pow(y - lastPoint[1], 2)) > minDistance) {
                const newPath = [...currentPath, [x, y] as [number, number]];
                setCurrentPath(newPath);
                
                // Redraw everything including current path
                redrawCanvas();
            
                // Draw current path as preview
                if (newPath.length > 1) {
                    const rc = roughCanvasRef.current;
                    rc.linearPath(newPath, {
                        stroke: "red",
                        strokeWidth: 3,
                        roughness: 0,              // Match final drawing
                        bowing: 0,
                        seed: 1,
                        opacity: 1,
                        disableMultiStroke: true     // Match final drawing
                    });
                }
            }
        } else {
            // Ellipse mode - show preview
            const startPoint = currentPath[0];
            if (startPoint) {
                const width = Math.abs(x - startPoint[0]);
                const height = Math.abs(y - startPoint[1]);
                const centerX = (startPoint[0] + x) / 2;
                const centerY = (startPoint[1] + y) / 2;
                
                // Redraw everything
                redrawCanvas();
                
                // Draw preview ellipse
                if (width > 5 && height > 5) {
                    const rc = roughCanvasRef.current;
                    rc.ellipse(centerX, centerY, width, height, {
                        stroke: 'orange',
                        strokeWidth: 3,
                        fill: 'rgba(255, 165, 0, 0.3)',
                        fillStyle: 'solid',          // Match final drawing
                        roughness: 0,              // Match final drawing
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
            // Finalize freehand drawing
            if (currentPath.length > 1) {
                const rc = roughCanvasRef.current;
                const shape = rc.linearPath(currentPath, {
                    stroke: "red",
                    strokeWidth: 3,
                    roughness: 0,        // Reduced from 0
                    bowing: 0,
                    seed: 1,
                    opacity: 1,
                    disableMultiStroke: true  // Reduces data size
                });
                setAllShapes(prev => [...prev, shape]);
                try {
                    const url = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";
                    await axios.post(`${url}/api/rooms/${roomId}/shapes`, {
                        type: "LINE",
                        dataFromRoughJs: shape
                    }, {withCredentials: true});
                } catch (err) { 
                    console.error("Error saving shape", err);
                }   
            }
        } else {
            // Finalize ellipse
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
                        fillStyle: 'solid',     // Instead of 'hachure'
                        roughness: 0,         // Lower roughness = less data
                        seed: 1
                    });
                    try {
                        const url = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";
                        await axios.post(`${url}/api/rooms/${roomId}/shapes`, {
                            type: "ELLIPSE",
                            dataFromRoughJs: shape
                        }, {withCredentials: true});
                    } catch (err) {
                        console.error("Error saving shape", err);
                    }
                    setAllShapes(prev => [...prev, shape]);
                    
                    
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
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>
            
            {/* Drawing Mode Selector */}
            <div className="mb-4 flex gap-2">
                <button 
                    onClick={() => setDrawingMode('freehand')}
                    className={`px-4 py-2 rounded transition-colors ${
                        drawingMode === 'freehand' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    ✏️ Freehand
                </button>
                <button 
                    onClick={() => setDrawingMode('ellipse')}
                    className={`px-4 py-2 rounded transition-colors ${
                        drawingMode === 'ellipse' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    ⭕ Ellipse
                </button>
            </div>
            
            {/* Control Buttons */}
            <div className="mb-4 space-x-2 flex flex-wrap gap-2">
                <button 
                    onClick={clearCanvas}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    🗑️ Clear Canvas
                </button>
                <button 
                    onClick={addDemoShapes}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    ➕ Add Demo Shapes
                </button>
            </div>
            
            <div className="border-2 border-gray-300 rounded-lg shadow-lg">
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
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">How to Draw:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <strong>✏️ Freehand Mode:</strong> 
                            <br />Click and drag to draw smooth, sketchy lines
                        </div>
                        <div>
                            <strong>⭕ Ellipse Mode:</strong>
                            <br />Click and drag to create ellipses
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        Current mode: <strong>{drawingMode === 'freehand' ? '✏️ Freehand Drawing' : '⭕ Ellipse Drawing'}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
