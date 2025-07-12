'use client';

import { useState, useRef, useEffect, use } from "react";
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Diamond,
  Minus,
  Edit3,
  ArrowUpRight,
  Home,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ShapeType } from "@repo/schemas";
import rough from "roughjs";
import { useRoomStore } from "@/store/room.store";
import { authClient } from "@/lib/auth-client";

// Define tool type
type Tool = {
  id: string;
  icon: any;
  label: string;
  shape?: ShapeType;
}

interface ShapeStyle {
  stroke: string;
  fill: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
}

interface DrawnShape {
  type: ShapeType;
  start: { x: number; y: number };
  end: { x: number; y: number };
  index: number;
  dataFromRoughJs?: any;
  style?: ShapeStyle;
}

const defaultStyle: ShapeStyle = {
  stroke: '#ffffff',
  fill: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 1,
};

const colorOptions = {
  stroke: ['#ffffff', '#ff9b9b', '#4ade80', '#60a5fa', '#b45309', '#e5e7eb'],
  fill: ['transparent', '#3b1618', '#052e16', '#1e3a8a', '#451a03', 'checkered'],
};

const tools: Tool[] = [
  { id: "pointer", icon: MousePointer2, label: "Select" },
  { id: "hand", icon: Hand, label: "Hand" },
  { id: "rectangle", icon: Square, label: "Rectangle", shape: "RECTANGLE" },
  { id: "diamond", icon: Diamond, label: "Diamond", shape: "DIAMOND" },
  { id: "ellipse", icon: Circle, label: "Ellipse", shape: "ELLIPSE" },
  { id: "line", icon: Minus, label: "Line", shape: "LINE" },
  { id: "arrow", icon: ArrowUpRight, label: "Arrow", shape: "ARROW" },
  { id: "freedraw", icon: Edit3, label: "Free Draw", shape: "FREEDRAW" },
];

function StylePanel({ style, onChange }: { style: ShapeStyle; onChange: (style: ShapeStyle) => void }) {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-bg-1 border border-border-1 rounded-xl p-4 shadow-lg backdrop-blur-md space-y-4 w-[200px]">
      <div>
        <h3 className="text-font-1 text-sm font-medium mb-2">Stroke</h3>
        <div className="grid grid-cols-6 gap-1">
          {colorOptions.stroke.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border border-border-1 ${style.stroke === color ? 'ring-2 ring-custom' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onChange({ ...style, stroke: color })}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-font-1 text-sm font-medium mb-2">Background</h3>
        <div className="grid grid-cols-6 gap-1">
          {colorOptions.fill.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border border-border-1 ${style.fill === color ? 'ring-2 ring-custom' : ''}`}
              style={{ 
                backgroundColor: color === 'checkered' ? 'transparent' : color,
                backgroundImage: color === 'checkered' ? 'linear-gradient(45deg, #666 25%, transparent 25%), linear-gradient(-45deg, #666 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #666 75%), linear-gradient(-45deg, transparent 75%, #666 75%)' : undefined,
                backgroundSize: color === 'checkered' ? '8px 8px' : undefined,
                backgroundPosition: color === 'checkered' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined
              }}
              onClick={() => onChange({ ...style, fill: color })}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-font-1 text-sm font-medium mb-2">Stroke width</h3>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map((width) => (
            <button
              key={width}
              className={`p-2 rounded bg-bg-2 flex items-center justify-center ${style.strokeWidth === width ? 'ring-2 ring-custom' : ''}`}
              onClick={() => onChange({ ...style, strokeWidth: width })}
            >
              <div 
                className="bg-font-1 rounded-full" 
                style={{ height: `${width}px`, width: '20px' }}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-font-1 text-sm font-medium mb-2">Stroke style</h3>
        <div className="grid grid-cols-3 gap-1">
          {(['solid', 'dashed', 'dotted'] as const).map((style_) => (
            <button
              key={style_}
              className={`p-2 rounded bg-bg-2 flex items-center justify-center ${style.strokeStyle === style_ ? 'ring-2 ring-custom' : ''}`}
              onClick={() => onChange({ ...style, strokeStyle: style_ })}
            >
              <div 
                className="w-5 h-0 border-t-2" 
                style={{ 
                  borderStyle: style_,
                  borderColor: 'var(--color-font-1)'
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-font-1 text-sm font-medium mb-2">Sloppiness</h3>
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((roughness) => (
            <button
              key={roughness}
              className={`p-2 rounded bg-bg-2 flex items-center justify-center ${style.roughness === roughness ? 'ring-2 ring-custom' : ''}`}
              onClick={() => onChange({ ...style, roughness: roughness })}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" className="text-font-1">
                <path
                  d={roughness === 0 ? 'M5 10 L15 10' : 
                     roughness === 1 ? 'M5 9 Q7 11 10 9 T15 9' :
                     'M5 8 Q7 12 10 8 T15 12'}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-font-1 text-sm font-medium mb-2">Opacity</h3>
        <input
          type="range"
          min="0"
          max="100"
          value={style.opacity * 100}
          onChange={(e) => onChange({ ...style, opacity: Number(e.target.value) / 100 })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-font-2 mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

export default function RoomPage({params}:{params:Promise<{roomId: string}>}) {
  const {roomId} = use(params);
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [selectedTool, setSelectedTool] = useState("pointer");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roughCanvas, setRoughCanvas] = useState<any>(null);
  const [currShape, setCurrShape] = useState<ShapeType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  const [currentStyle, setCurrentStyle] = useState<ShapeStyle>(defaultStyle);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const { 
    shapes, 
    addShape, 
    clearShapes, 
    socket, 
    user,
    initializeSocket,
    disconnectSocket,
    isConnected,
    loading,
    error,
    setUser
  } = useRoomStore();

  // Initialize user from session
  useEffect(() => {
    if (session?.user && !user) {
      const sessionUser = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image || undefined,
        createdAt: session.user.createdAt?.toISOString(),
        updatedAt: session.user.updatedAt?.toISOString()
      };
      console.log('Setting user from session:', sessionUser);
      setUser(sessionUser);
    }
  }, [session, user, setUser]);

  // Debug effect to log state
  useEffect(() => {
    console.log('Room state update:', {
      socket: !!socket,
      isConnected,
      user: user?.id,
      shapesCount: shapes.length,
      loading,
      error,
      roughCanvas: !!roughCanvas
    });
  }, [socket, isConnected, user, shapes, loading, error, roughCanvas]);

  // Update current shape when tool changes
  useEffect(() => {
    const tool = tools.find(t => t.id === selectedTool);
    setCurrShape(tool?.shape || null);
    console.log('Tool changed to:', selectedTool, 'shape:', tool?.shape);
  }, [selectedTool]);

  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Initializing WebSocket connection');
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const cleanup = () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };

    const setupRoomConnection = () => {
      if (!mounted) return;

      console.log('Socket status:', { socket: !!socket, isConnected, mounted });

      if (socket && isConnected) {
        console.log('Joining room:', roomId);
        socket.emit('join-room', { roomId });
      } else if (mounted) {
        // Only initialize socket if we don't have one
        if (!socket) {
          console.log('Initializing socket...');
          initializeSocket();
        }
        
        // Retry connection check
        retryTimeout = setTimeout(() => {
          if (mounted) {
            setupRoomConnection();
          }
        }, 1000);
        console.log('Socket not ready, retrying...');
      }
    };

    setupRoomConnection();

    // Cleanup on unmount or roomId change
    return cleanup;
  }, [roomId, socket, isConnected, initializeSocket]);

  // Separate effect to handle leaving room on unmount
  useEffect(() => {
    console.log('Leaving room on unmount');
    return () => {
      if (socket && isConnected) {
        socket.emit('leave-room', { roomId });
        disconnectSocket();
      }
    };
  }, []);

  const redrawCanvas = () => {
    if (!canvasRef.current || !roughCanvas) {
      console.log('Canvas or RoughCanvas not available for redraw');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all shapes
    try {
      console.log('Redrawing', shapes.length, 'shapes');
      for (const shape of shapes) {
        if (shape.dataFromRoughJs) {
          roughCanvas.draw(shape.dataFromRoughJs);
        }
      }
    } catch (error) {
      console.error('Error drawing shapes:', error);
    }
  };

  // Handle canvas setup and resize
  useEffect(() => {
    console.log('Setting up canvas');
    let cleanupResize: (() => void) | null = null;
    
    const initCanvas = () => {
      const canvas = canvasRef.current;
      console.log('Canvas:', canvas);
      
      if (!canvas) {
        console.log('Canvas not available yet, will retry in 100ms...');
        setTimeout(initCanvas, 100);
        return;
      }
      
      console.log('Canvas found');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.log('Canvas context not available');
        return;
      }

      console.log('Canvas context obtained');

      const resizeCanvas = () => {
        console.log('Resizing canvas');
        const { width, height } = canvas.getBoundingClientRect();
        const scale = window.devicePixelRatio;
        
        console.log('Canvas dimensions:', { width, height, scale });
        
        // Set actual canvas size in memory (scaled up for crisp display)
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        // Scale the drawing context back down so coordinates match
        ctx.scale(scale, scale);
        
        // Set CSS size to actual display size
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Initialize RoughCanvas
        try {
          const rc = rough.canvas(canvas);
          setRoughCanvas(rc);
          console.log('RoughCanvas initialized successfully:', !!rc);
        } catch (error) {
          console.error('Error initializing RoughCanvas:', error);
        }
        
        // Redraw after resize
        setTimeout(() => {
          console.log('Triggering redraw after resize');
          redrawCanvas();
        }, 10);
      };

      // Initial setup
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Store cleanup function
      cleanupResize = () => {
        console.log('Cleaning up canvas event listeners');
        window.removeEventListener('resize', resizeCanvas);
      };
    };

    // Start initialization
    initCanvas();

    // Return cleanup function
    return () => {
      if (cleanupResize) {
        cleanupResize();
      }
    };
  }, []); // Remove dependencies to avoid re-running

  // Separate effect to redraw when shapes change
  useEffect(() => {
    if (roughCanvas && shapes.length >= 0) {
      redrawCanvas();
    }
  }, [shapes, roughCanvas]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse down - tool:', selectedTool, 'currShape:', currShape, 'socket:', !!socket, 'user:', !!user);
    
    if (!currShape || selectedTool === "pointer" || selectedTool === "hand") {
      console.log('Skipping mouse down - no shape or wrong tool');
      return;
    }
    
    console.log('Starting drawing');
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDrawStart({ x, y });
    
    if (currShape === "FREEDRAW") {
      setPoints([{ x, y }]);
    }
  };

  const getShapeOptions = (style: ShapeStyle) => {
    // Convert hex color to rgba for proper opacity handling
    const hexToRgba = (hex: string, opacity: number) => {
      // Handle white specially since it's commonly used
      if (hex === '#ffffff') {
        return `rgba(255, 255, 255, ${opacity})`;
      }
      
      // Remove the hash if present
      hex = hex.replace('#', '');
      
      // Parse the hex values
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Return rgba string
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return {
      stroke: hexToRgba(style.stroke, style.opacity),
      strokeWidth: style.strokeWidth,
      fill: style.fill === 'transparent' 
        ? 'transparent' 
        : style.fill === 'checkered' 
          ? `rgba(102, 102, 102, ${style.opacity * 0.3})` 
          : hexToRgba(style.fill, style.opacity * 0.3),
      fillStyle: style.fill === 'checkered' ? 'hachure' : 'solid',
      roughness: style.roughness,
      strokeLineDash: style.strokeStyle === 'dashed' ? [8, 4] : style.strokeStyle === 'dotted' ? [2, 4] : undefined,
      seed: 1
    };
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currShape || !roughCanvas) {
      if (!roughCanvas) {
        console.log('RoughCanvas not initialized in handleMouseMove function');
      }
      return;
    }

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Clear canvas and redraw existing shapes first
    redrawCanvas();

    try {
      if (currShape === "FREEDRAW") {
        const newPoints = [...points, { x, y }];
        setPoints(newPoints);
        
        if (newPoints.length > 1) {
          // Draw the preview path without saving it
          const previewPath = roughCanvas.linearPath(
            newPoints.map(p => [p.x, p.y]), 
            getShapeOptions({ ...currentStyle, roughness: 0 })
          );
          roughCanvas.draw(previewPath);
        }
      } else {
        // Draw preview shape for other tools
        const options = getShapeOptions(currentStyle);

        switch(currShape) {
          case "RECTANGLE": {
            const previewShape = roughCanvas.rectangle(
              drawStart.x, 
              drawStart.y, 
              x - drawStart.x, 
              y - drawStart.y, 
              options
            );
            roughCanvas.draw(previewShape);
            break;
          }
          case "DIAMOND": {
            const centerX = (drawStart.x + x) / 2;
            const centerY = (drawStart.y + y) / 2;
            const previewShape = roughCanvas.polygon([
              [centerX, drawStart.y],
              [x, centerY],
              [centerX, y],
              [drawStart.x, centerY]
            ], options);
            roughCanvas.draw(previewShape);
            break;
          }
          case "ELLIPSE": {
            const width = Math.abs(x - drawStart.x);
            const height = Math.abs(y - drawStart.y);
            const centerX = (drawStart.x + x) / 2;
            const centerY = (drawStart.y + y) / 2;
            const previewShape = roughCanvas.ellipse(centerX, centerY, width, height, options);
            roughCanvas.draw(previewShape);
            break;
          }
          case "LINE": {
            const previewShape = roughCanvas.line(drawStart.x, drawStart.y, x, y, options);
            roughCanvas.draw(previewShape);
            break;
          }
          case "ARROW": {
            const angle = Math.atan2(y - drawStart.y, x - drawStart.x);
            const arrowLength = 20;
            const arrowAngle = Math.PI / 6;
            
            // Draw main line
            const mainLine = roughCanvas.line(drawStart.x, drawStart.y, x, y, options);
            roughCanvas.draw(mainLine);
            
            // Draw arrowhead
            const arrowhead1 = roughCanvas.line(
              x,
              y,
              x - arrowLength * Math.cos(angle + arrowAngle),
              y - arrowLength * Math.sin(angle + arrowAngle),
              options
            );
            const arrowhead2 = roughCanvas.line(
              x,
              y,
              x - arrowLength * Math.cos(angle - arrowAngle),
              y - arrowLength * Math.sin(angle - arrowAngle),
              options
            );
            roughCanvas.draw(arrowhead1);
            roughCanvas.draw(arrowhead2);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
    }
  };

  const handleMouseUp = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse up - isDrawing:', isDrawing, 'currShape:', currShape, 'socket:', !!socket, 'user:', !!user, 'roughCanvas:', !!roughCanvas);
    
    if (!isDrawing || !currShape || !roughCanvas || !socket || !user) {
      console.log('Skipping mouse up - missing requirements');
      return;
    }

    console.log('Processing shape creation');
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const options = getShapeOptions(currentStyle);

    try {
      // For freedraw, only create shape if we have enough points
      if (currShape === "FREEDRAW") {
        console.log('Creating freedraw shape with', points.length, 'points');
        if (points.length > 1) {
          const shape = roughCanvas.linearPath(
            points.map(p => [p.x, p.y]), 
            {
              ...options,
              roughness: 0
            }
          );
          
          const firstPoint = points[0];
          const lastPoint = points[points.length - 1];
          
          if (firstPoint && lastPoint) {
            const newShape = {
              type: "FREEDRAW" as ShapeType,
              dataFromRoughJs: shape,
              style: currentStyle,
              creatorId: user.id,
              roomId
            };
            
            console.log('Adding freedraw shape:', newShape);
            addShape(newShape);
          }
        }
      } else {
        // For other shapes, only create if minimum size is met
        const minSize = 5; // Minimum size in pixels
        const width = Math.abs(x - drawStart.x);
        const height = Math.abs(y - drawStart.y);
        
        console.log('Shape dimensions:', { width, height, minSize });
        
        if (width >= minSize || height >= minSize) {
          let finalShape;
          
          switch(currShape) {
            case "RECTANGLE":
              finalShape = roughCanvas.rectangle(
                drawStart.x, 
                drawStart.y, 
                x - drawStart.x, 
                y - drawStart.y, 
                options
              );
              break;
            case "DIAMOND": {
              const centerX = (drawStart.x + x) / 2;
              const centerY = (drawStart.y + y) / 2;
              finalShape = roughCanvas.polygon([
                [centerX, drawStart.y],
                [x, centerY],
                [centerX, y],
                [drawStart.x, centerY]
              ], options);
              break;
            }
            case "ELLIPSE": {
              const ellipseWidth = Math.abs(x - drawStart.x);
              const ellipseHeight = Math.abs(y - drawStart.y);
              const centerX = (drawStart.x + x) / 2;
              const centerY = (drawStart.y + y) / 2;
              finalShape = roughCanvas.ellipse(centerX, centerY, ellipseWidth, ellipseHeight, options);
              break;
            }
            case "LINE":
              finalShape = roughCanvas.line(drawStart.x, drawStart.y, x, y, options);
              break;
            case "ARROW": {
              const angle = Math.atan2(y - drawStart.y, x - drawStart.x);
              const arrowLength = 20;
              const arrowAngle = Math.PI / 6;
              
              // Create arrow as a group of shapes
              const mainLine = roughCanvas.line(drawStart.x, drawStart.y, x, y, options);
              const arrowhead1 = roughCanvas.line(
                x,
                y,
                x - arrowLength * Math.cos(angle + arrowAngle),
                y - arrowLength * Math.sin(angle + arrowAngle),
                options
              );
              const arrowhead2 = roughCanvas.line(
                x,
                y,
                x - arrowLength * Math.cos(angle - arrowAngle),
                y - arrowLength * Math.sin(angle - arrowAngle),
                options
              );
              
              finalShape = {
                ...mainLine,
                sets: [...mainLine.sets, ...arrowhead1.sets, ...arrowhead2.sets]
              };
              break;
            }
          }
          
          if (finalShape) {
            const newShape = {
              type: currShape,
              dataFromRoughJs: finalShape,
              style: currentStyle,
              creatorId: user.id,
              roomId
            };
            
            console.log('Adding shape:', newShape);
            addShape(newShape);
          }
        } else {
          console.log('Shape too small, not creating');
        }
      }
    } catch (error) {
      console.error('Error creating shape:', error);
    } finally {
      // Always clean up state
      console.log('Cleaning up drawing state');
      setIsDrawing(false);
      setPoints([]);
      
      // Clear any preview and redraw clean canvas
      redrawCanvas();
    }
  };

  const clearCanvas = async () => {
    clearShapes();
    redrawCanvas();
  };

  if (sessionLoading || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-darkbg">
        <div className="text-font-1">Loading canvas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-darkbg">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-darkbg">
        <div className="text-red-500">Please sign in to access this room</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full bg-darkbg ${
          selectedTool === "pointer" ? "cursor-default" :
          selectedTool === "hand" ? "cursor-grab" :
          "cursor-crosshair"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-xl backdrop-blur-md shadow-lg border"
          style={{
            backgroundColor: "var(--color-bg-1)",
            borderColor: "var(--color-border-1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="p-1.5 h-8 w-8 rounded-lg hover:bg-opacity-80"
            style={{ color: "var(--color-font-2)" }}
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <div className="flex items-center gap-0.5">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className="p-1.5 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-opacity-80"
                style={{
                  backgroundColor: selectedTool === tool.id ? "var(--color-custom)" : "transparent",
                  color: selectedTool === tool.id ? "var(--color-lightbg)" : "var(--color-font-2)",
                }}
                onClick={() => setSelectedTool(tool.id)}
                title={tool.label}
                type="button"
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <div className="flex items-center gap-1">
            <Button
              className="px-2 py-1 text-xs font-semibold rounded-lg h-6 min-w-[2rem] transition-all duration-200"
              variant="ghost"
              style={{
                backgroundColor: "var(--color-custom)",
                color: "var(--color-lightbg)",
              }}
            >
              Share
            </Button>
            <Button
              onClick={() => setClearModalOpen(true)}
              className="px-2 py-1 text-xs font-semibold rounded-lg h-6 min-w-[2rem] transition-all duration-200 flex items-center gap-1"
              variant="ghost"
              style={{
                backgroundColor: "var(--color-delete)",
                color: "var(--color-lightbg)",
              }}
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {selectedTool !== "pointer" && selectedTool !== "hand" && (
        <StylePanel style={currentStyle} onChange={setCurrentStyle} />
      )}

      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear Canvas"
        message="Are you sure you want to clear the canvas? This action cannot be undone and all shapes will be permanently deleted."
        confirmText="Clear Canvas"
        variant="danger"
        onConfirm={() => {
          clearCanvas();
          setClearModalOpen(false);
        }}
      />
    </div>
  );
}
