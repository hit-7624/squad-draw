"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { ShapeType } from "@/schemas/index";
import { useRoomStore } from "@/store/room.store";
import { useDashboardStore } from "@/store/dashboard.store";
import ShapeSelector from "@/components/ShapeSelector";
import TypeControlPanel, { DrawingOptions } from "@/components/ControlPanel";
import { GroupChatbot } from "@/components/GroupChatbot";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Modal } from "@/components/ui/modal";
import { MessageCircle, Palette, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/Toggle";


// This function now draws all committed shapes onto the static canvas.
function drawShapesFromArray(
  shapes: any[],
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  if (!canvasRef.current) return;
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) return;
  const rc = rough.canvas(canvasRef.current);
  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  shapes.forEach((shape) => {
    const d = shape.dataFromRoughJs;
    switch (d.type) {
      case "RECTANGLE":
        rc.rectangle(d.x, d.y, d.width, d.height, d.options);
        break;
      case "ELLIPSE":
        rc.ellipse(d.cx, d.cy, d.rx, d.ry, d.options);
        break;
      case "LINE":
        rc.line(d.x1, d.y1, d.x2, d.y2, d.options);
        break;
      case "DIAMOND":
        rc.polygon(d.points, d.options);
        break;
      case "ARROW":
        rc.line(d.x1, d.y1, d.x2, d.y2, d.options);
        rc.line(d.x2, d.y2, d.arrowHead1[0], d.arrowHead1[1], d.options);
        rc.line(d.x2, d.y2, d.arrowHead2[0], d.arrowHead2[1], d.options);
        break;
      case "FREEDRAW":
        rc.linearPath(d.path, d.options);
        break;
      case "TEXT":
        ctx.font = "16px sans-serif";
        ctx.fillStyle = d.options.stroke;
        ctx.fillText(d.text, d.x, d.y);
        break;
    }
  });
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      toast.info("For a better experience, we recommend using a desktop.", {
        position: "bottom-center",
        duration: 10000,
      });
    }
  }, []);
  const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);

  const roughCanvasRef = useRef<RoughCanvas | null>(null);
  const previousConnectionStatus = useRef<boolean | null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeType | 'HAND'>("HAND");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>({
    stroke: "#000000",
    strokeWidth: 2,
    fill: "rgba(255, 255, 255, 0.1)",
    fillStyle: "solid",
    roughness: 2,
    strokeLineDash: [],
    fillOpacity: 0.25,
  });
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme === "dark") {
      setDrawingOptions((opts) => ({ ...opts, stroke: "#ffffff" }));
    } else if (resolvedTheme === "light") {
      setDrawingOptions((opts) => ({ ...opts, stroke: "#000000" }));
    }
  }, [resolvedTheme]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "clearShapes" | null;
    title: string;
    message: string;
    confirmText: string;
    variant: "default" | "danger";
  }>({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    confirmText: "",
    variant: "default",
  });

  const {
    shapes,
    isConnected,
    onlineMembers,
    clearShapes,
    initializeSocket,
    disconnectSocket,
    saveAndBroadcastShape,
    joinRoomInSocket,
    sendCursorPosition,
    cursors,
  } = useRoomStore();

  const { getOverviewRoom, canManageRoom } = useDashboardStore();

  const handleClearShapes = () => {
    setModalState({
      isOpen: true,
      type: "clearShapes",
      title: "Clear All Shapes",
      message:
        "Are you sure you want to clear all shapes? This action cannot be undone and all shapes will be permanently removed from the canvas.",
      confirmText: "Clear All",
      variant: "danger",
    });
  };

  const handleSaveCanvas = () => {
    if (staticCanvasRef.current) {
      const canvas = staticCanvasRef.current;
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `squad-draw-${roomId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Canvas saved as PNG!");
    } else {
      toast.error("Could not save canvas.");
    }
  };

  const handleConfirm = async () => {
    if (modalState.type === "clearShapes") {
      try {
        await clearShapes();
        toast.success("All shapes cleared successfully!");
      } catch (error) {
        toast.error("Failed to clear shapes");
        console.error("Error clearing shapes:", error);
      }
    }
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (!sessionLoading) {
      setLoading(false);
    }
  }, [sessionLoading]);

  useEffect(() => {
    if (session && session.user && !loading && roomId) {
      joinRoomInSocket(roomId);
      // toast.success("CONNECTING TO SERVER AND LOADING SHAPES")
      initializeSocket();

      return () => {
        disconnectSocket();
      };
    }
  }, [session, roomId, loading, joinRoomInSocket, initializeSocket, disconnectSocket]);

  // Handle canvas and container resizing
  useEffect(() => {
    const container = containerRef.current;
    const staticCanvas = staticCanvasRef.current;
    const dynamicCanvas = dynamicCanvasRef.current;

    if (!container || !staticCanvas || !dynamicCanvas) return;

    const handleResize = () => {
      // Set a stable height for the container
      container.style.height = `${window.innerHeight}px`;
      container.style.width = `${window.innerWidth}px`;

      // Update canvas dimensions to match the container
      staticCanvas.width = container.offsetWidth;
      staticCanvas.height = container.offsetHeight;
      dynamicCanvas.width = container.offsetWidth;
      dynamicCanvas.height = container.offsetHeight;
      
      // Redraw shapes on the static canvas after resizing
      drawShapesFromArray(shapes, staticCanvasRef);
    };

    handleResize(); // Set initial size

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [shapes]); // Rerun when shapes change to redraw correctly


  useEffect(() => {
    const staticCanvas = staticCanvasRef.current;
    const dynamicCanvas = dynamicCanvasRef.current;
    if (!staticCanvas || !dynamicCanvas) return;

    const staticCtx = staticCanvas.getContext("2d");
    const dynamicCtx = dynamicCanvas.getContext("2d");
    if (!staticCtx || !dynamicCtx) return;

    const rc = rough.canvas(dynamicCanvas);

    // #### MOBILE/TOUCH SUPPORT: Shared drawing logic ####
    const startDrawing = (x: number, y: number) => {
      if (currentShape === 'HAND') {
        return;
      } else if (currentShape === "FREEDRAW") {
        setIsDrawing(true);
        setCurrentPath([[x, y]]);
      } else {
        setStartPoint([x, y]);
      }
    };

    const drawing = (x: number, y: number) => {
      if (currentShape === 'HAND') {
        return;
      }
      if (currentShape === "FREEDRAW" && isDrawing) {
        const lastPoint = currentPath[currentPath.length - 1];
        const minDistance = 3;

        if (
          !lastPoint ||
          Math.sqrt(
            Math.pow(x - lastPoint[0], 2) + Math.pow(y - lastPoint[1], 2),
          ) > minDistance
        ) {
          const newPath = [...currentPath, [x, y] as [number, number]];
          setCurrentPath(newPath);

          dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
          if (newPath.length > 1) {
            rc.linearPath(newPath, {
              ...drawingOptions,
              strokeWidth: 3,
              roughness: 0,
              disableMultiStroke: true,
              seed: 1,
            });
          }
        }
      } else if (startPoint) {
        dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);

        const centerX = (startPoint[0] + x) / 2;
        const centerY = (startPoint[1] + y) / 2;
        const width = Math.abs(x - startPoint[0]);
        const height = Math.abs(y - startPoint[1]);

        switch (currentShape) {
          case "ELLIPSE": rc.ellipse(centerX, centerY, width, height, { ...drawingOptions, seed: 1 }); break;
          case "RECTANGLE": rc.rectangle(startPoint[0], startPoint[1], x - startPoint[0], y - startPoint[1], { ...drawingOptions, seed: 1 }); break;
          case "LINE": rc.line(startPoint[0], startPoint[1], x, y, { ...drawingOptions, seed: 1 }); break;
          case "DIAMOND": {
            const points: [number, number][] = [[centerX, startPoint[1]], [x, centerY], [centerX, y], [startPoint[0], centerY]];
            rc.polygon(points, { ...drawingOptions, seed: 1 });
            break;
          }
          case "ARROW": {
            rc.line(startPoint[0], startPoint[1], x, y, { ...drawingOptions, seed: 1 });
            const angle = Math.atan2(y - startPoint[1], x - startPoint[0]);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;
            const arrowX1 = x - arrowLength * Math.cos(angle - arrowAngle);
            const arrowY1 = y - arrowLength * Math.sin(angle - arrowAngle);
            const arrowX2 = x - arrowLength * Math.cos(angle + arrowAngle);
            const arrowY2 = y - arrowLength * Math.sin(angle + arrowAngle);
            rc.line(x, y, arrowX1, arrowY1, { ...drawingOptions, seed: 1 });
            rc.line(x, y, arrowX2, arrowY2, { ...drawingOptions, seed: 1 });
            break;
          }
        }
      }
    };

    const endDrawing = (x: number, y: number) => {
      if (currentShape === 'HAND') {
        return;
      }
      if (currentShape === "FREEDRAW" && isDrawing) {
        if (currentPath.length > 1 && session?.user?.id) {
          const newShape = {
            type: "FREEDRAW" as ShapeType,
            dataFromRoughJs: {
              type: "FREEDRAW",
              path: currentPath,
              options: { ...drawingOptions, strokeWidth: 3, roughness: 0, disableMultiStroke: true, seed: 1 },
            },
            roomId: roomId,
            creatorId: session.user.id,
          };
          saveAndBroadcastShape(newShape, session.user.id);
        }
        setIsDrawing(false);
        setCurrentPath([]);
        dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
      } else if (startPoint) {
        const centerX = (startPoint[0] + x) / 2;
        const centerY = (startPoint[1] + y) / 2;
        const width = Math.abs(x - startPoint[0]);
        const height = Math.abs(y - startPoint[1]);
        if (session?.user?.id) {
          let newShape: any;
          switch (currentShape) {
            case "ELLIPSE": newShape = { type: "ELLIPSE" as ShapeType, dataFromRoughJs: { type: "ELLIPSE", cx: centerX, cy: centerY, rx: width, ry: height, options: { ...drawingOptions, seed: 1 } }, roomId, creatorId: session.user.id }; break;
            case "RECTANGLE": newShape = { type: "RECTANGLE" as ShapeType, dataFromRoughJs: { type: "RECTANGLE", x: startPoint[0], y: startPoint[1], width: x - startPoint[0], height: y - startPoint[1], options: { ...drawingOptions, seed: 1 } }, roomId, creatorId: session.user.id }; break;
            case "LINE": newShape = { type: "LINE" as ShapeType, dataFromRoughJs: { type: "LINE", x1: startPoint[0], y1: startPoint[1], x2: x, y2: y, options: { ...drawingOptions, seed: 1 } }, roomId, creatorId: session.user.id }; break;
            case "DIAMOND": {
              const points = [[centerX, startPoint[1]], [x, centerY], [centerX, y], [startPoint[0], centerY]];
              newShape = { type: "DIAMOND" as ShapeType, dataFromRoughJs: { type: "DIAMOND", points, options: { ...drawingOptions, seed: 1 } }, roomId, creatorId: session.user.id };
              break;
            }
            case "ARROW": {
              const angle = Math.atan2(y - startPoint[1], x - startPoint[0]);
              const arrowLength = 15;
              const arrowAngle = Math.PI / 6;
              const arrowX1 = x - arrowLength * Math.cos(angle - arrowAngle);
              const arrowY1 = y - arrowLength * Math.sin(angle - arrowAngle);
              const arrowX2 = x - arrowLength * Math.cos(angle + arrowAngle);
              const arrowY2 = y - arrowLength * Math.sin(angle + arrowAngle);
              newShape = { type: "ARROW" as ShapeType, dataFromRoughJs: { type: "ARROW", x1: startPoint[0], y1: startPoint[1], x2: x, y2: y, arrowHead1: [arrowX1, arrowY1], arrowHead2: [arrowX2, arrowY2], options: { ...drawingOptions, seed: 1 } }, roomId, creatorId: session.user.id };
              break;
            }
          }
          if (newShape) {
            saveAndBroadcastShape(newShape, session.user.id);
          }
        }
        setStartPoint(null);
        dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
      }
    };

    // Mouse Event Handlers
    const handleMouseDown = (e: MouseEvent) => startDrawing(e.offsetX, e.offsetY);
    const handleMouseMove = (e: MouseEvent) => {
      drawing(e.offsetX, e.offsetY);
      sendCursorPosition(e.offsetX, e.offsetY);
    };
    const handleMouseUp = (e: MouseEvent) => endDrawing(e.offsetX, e.offsetY);

    // #### MOBILE/TOUCH SUPPORT: Touch Event Handlers ####
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = dynamicCanvas.getBoundingClientRect();
      startDrawing(touch?.clientX || 0 - rect.left, touch?.clientY || 0 - rect.top);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = dynamicCanvas.getBoundingClientRect();
      drawing(touch?.clientX || 0 - rect.left, touch?.clientY || 0 - rect.top);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = dynamicCanvas.getBoundingClientRect();
      endDrawing(touch?.clientX || 0 - rect.left, touch?.clientY || 0 - rect.top);
    };

    // Add all event listeners
    dynamicCanvas.addEventListener("mousedown", handleMouseDown);
    dynamicCanvas.addEventListener("mousemove", handleMouseMove);
    dynamicCanvas.addEventListener("mouseup", handleMouseUp);
    dynamicCanvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    dynamicCanvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    dynamicCanvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      dynamicCanvas.removeEventListener("mousedown", handleMouseDown);
      dynamicCanvas.removeEventListener("mousemove", handleMouseMove);
      dynamicCanvas.removeEventListener("mouseup", handleMouseUp);
      dynamicCanvas.removeEventListener("touchstart", handleTouchStart);
      dynamicCanvas.removeEventListener("touchmove", handleTouchMove);
      dynamicCanvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    shapes, roomId, currentShape, isDrawing, currentPath, startPoint, session?.user?.id,
    drawingOptions, saveAndBroadcastShape, sendCursorPosition
  ]);


  const [previousShapesLength, setPreviousShapesLength] = useState<
    number | null
  >(null);

  useEffect(() => {
    drawShapesFromArray(shapes, staticCanvasRef);

    if (
      previousShapesLength !== null &&
      previousShapesLength > 0 &&
      shapes.length === 0
    ) {
      toast.info("All shapes have been cleared");
    }

    setPreviousShapesLength(shapes.length);
  }, [shapes, previousShapesLength]);


  // Monitor connection status and show toast notifications
  useEffect(() => {
    if (previousConnectionStatus.current !== null) {
      if (!isConnected && previousConnectionStatus.current) {
        toast.error(
          "Connection lost! Shapes will not be shared until reconnected.",
        );
      } else if (isConnected && !previousConnectionStatus.current) {
        toast.success("Connected to server! You can now share shapes.");
      }
    }

    previousConnectionStatus.current = isConnected;
  }, [isConnected]);

  const canManageCurrentRoom = useMemo(() => {
    const room = getOverviewRoom();
    if (!room || !session?.user) {
      return false;
    }
    return canManageRoom(room, session.user);
  }, [getOverviewRoom, canManageRoom, session?.user]);

  if (loading || sessionLoading || !isConnected) {
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
          <h2 className="text-3xl font-sans mb-4">
            Please sign in to access the room
          </h2>
          <button
            onClick={() => router.push("/signin")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex flex-row items-center gap-2">
        <ThemeToggle />
        <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 border-none"
            onClick={() => router.push('/dashboard')}
        >
            <Home className="h-5 w-5" />
        </Button>
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-sm font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            Online: {onlineMembers.length} members
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Role: {canManageCurrentRoom ? "Admin/Owner" : "Member"}
          </div>
        </div>
      </div>
      <ShapeSelector
        currentShape={currentShape}
        onShapeChange={setCurrentShape}
        onClearShapes={handleClearShapes}
        onSaveCanvas={handleSaveCanvas}
        isHandMode={currentShape === 'HAND'}
        onHandModeToggle={() => setCurrentShape('HAND')}
      />
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
          size="icon"
          className="rounded-lg h-9 w-9 sm:h-10 sm:w-10 shadow-lg"
          variant="outline"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </div>
      <Toggle isOpen={isChatOpen} setIsOpen={setIsChatOpen} />    

      <TypeControlPanel
        options={drawingOptions}
        onChange={setDrawingOptions}
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
      />

      <GroupChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <canvas
        id="static-canvas"
        ref={staticCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      />
      <canvas
        id="dynamic-canvas"
        ref={dynamicCanvasRef}
        className={currentShape === 'HAND' ? "cursor-grab" : "cursor-crosshair"}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />
      {Object.entries(cursors).map(([userId, cursor]) => {
        if (userId === session?.user?.id) return null;
        return (
          <div
            key={userId}
            className="absolute pointer-events-none"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              transform: "translate(-50%, -50%)",
              transition: "left 0.1s linear, top 0.1s linear",
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cursor.color }}
            ></div>
            <div className="text-xs bg-black text-white px-1 rounded-md mt-1">
              {cursor.userName}
            </div>
          </div>
        );
      })}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        variant={modalState.variant}
        onConfirm={handleConfirm}
      />
    </div>
  );
}