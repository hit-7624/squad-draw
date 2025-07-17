"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { ShapeType, SimpleShape } from "@/schemas/index";
import { useRoomStore } from "@/store/room.store";
import ShapeSelector from "@/components/ShapeSelector";
import TypeControlPanel, { DrawingOptions } from "@/components/ControlPanel";
import { GroupChatbot } from "@/components/GroupChatbot";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Modal } from "@/components/ui/modal";
import { MessageCircle, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useRoom } from "@/hooks/useRoom";

function drawShapesFromArray(
  shapes: SimpleShape[],
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  if (!canvasRef.current) return;
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) return;
  const rc = rough.canvas(canvasRef.current);
  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  shapes.forEach((shape) => {
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
  const previousConnectionStatus = useRef<boolean | null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeType>("HAND");
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
    openOverview,
    closeOverview,
    addShape,
    clearShapes,
    canManageCurrentRoom,
    initializeSocket,
    disconnectSocket,
    fetchCurrentRoomData,
    fetchRoomData,
  } = useRoomStore();

  const { getOverviewRoom, canManageRoom } = useRoom();

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
      openOverview(roomId);
      initializeSocket();
      fetchCurrentRoomData(roomId);
      fetchRoomData(roomId);

      const interval = setInterval(() => {
        fetchCurrentRoomData(roomId);
        fetchRoomData(roomId);
      }, 30000);

      return () => {
        clearInterval(interval);
        closeOverview();
        disconnectSocket();
      };
    }
  }, [
    session,
    roomId,
    sessionLoading,
    loading,
    openOverview,
    closeOverview,
    initializeSocket,
    disconnectSocket,
    fetchCurrentRoomData,
    fetchRoomData,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    roughCanvasRef.current = rough.canvas(canvas);

    const handleMouseDown = (e: MouseEvent) => {
      const x = e.offsetX;
      const y = e.offsetY;

      if (currentShape === "HAND") {
        return;
      } else if (currentShape === "FREEDRAW") {
        setIsDrawing(true);
        setCurrentPath([[x, y]]);
      } else {
        setStartPoint([x, y]);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.offsetX;
      const y = e.offsetY;

      if (currentShape === "HAND") {
        return;
      }
      if (currentShape === "FREEDRAW" && isDrawing) {
        // Handle free draw
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
              seed: 1,
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

        switch (currentShape) {
          case "ELLIPSE": {
            roughCanvasRef.current?.ellipse(centerX, centerY, width, height, {
              ...drawingOptions,
              seed: 1,
            });
            break;
          }
          case "RECTANGLE": {
            roughCanvasRef.current?.rectangle(
              startPoint[0],
              startPoint[1],
              x - startPoint[0],
              y - startPoint[1],
              { ...drawingOptions, seed: 1 },
            );
            break;
          }
          case "LINE": {
            roughCanvasRef.current?.line(startPoint[0], startPoint[1], x, y, {
              ...drawingOptions,
              seed: 1,
            });
            break;
          }
          case "DIAMOND": {
            const points = [
              [centerX, startPoint[1]] as [number, number],
              [x, centerY] as [number, number],
              [centerX, y] as [number, number],
              [startPoint[0], centerY] as [number, number],
            ];
            roughCanvasRef.current?.polygon(points, {
              ...drawingOptions,
              seed: 1,
            });
            break;
          }
          case "ARROW": {
            roughCanvasRef.current?.line(startPoint[0], startPoint[1], x, y, {
              ...drawingOptions,
              seed: 1,
            });
            const angle = Math.atan2(y - startPoint[1], x - startPoint[0]);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;
            const arrowX1 = x - arrowLength * Math.cos(angle - arrowAngle);
            const arrowY1 = y - arrowLength * Math.sin(angle - arrowAngle);
            const arrowX2 = x - arrowLength * Math.cos(angle + arrowAngle);
            const arrowY2 = y - arrowLength * Math.sin(angle + arrowAngle);
            roughCanvasRef.current?.line(x, y, arrowX1, arrowY1, {
              ...drawingOptions,
              seed: 1,
            });
            roughCanvasRef.current?.line(x, y, arrowX2, arrowY2, {
              ...drawingOptions,
              seed: 1,
            });
            break;
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const x = e.offsetX;
      const y = e.offsetY;

      if (currentShape === "HAND") {
        return;
      }
      if (currentShape === "FREEDRAW" && isDrawing) {
        // Handle free draw completion
        if (currentPath.length > 1) {
          const shape = roughCanvasRef.current?.linearPath(currentPath, {
            ...drawingOptions,
            strokeWidth: 3,
            roughness: 0,
            disableMultiStroke: true,
            seed: 1,
          }) as Drawable;

          if (shape && session?.user?.id) {
            const newShape = {
              type: "LINE" as ShapeType, // Use LINE type for free draw
              dataFromRoughJs: shape,
              roomId: roomId,
              creatorId: session.user.id,
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

        switch (currentShape) {
          case "ELLIPSE": {
            shape = roughCanvasRef.current?.ellipse(
              centerX,
              centerY,
              width,
              height,
              { ...drawingOptions, seed: 1 },
            ) as Drawable;
            break;
          }
          case "RECTANGLE": {
            shape = roughCanvasRef.current?.rectangle(
              startPoint[0],
              startPoint[1],
              x - startPoint[0],
              y - startPoint[1],
              { ...drawingOptions, seed: 1 },
            ) as Drawable;
            break;
          }
          case "LINE": {
            shape = roughCanvasRef.current?.line(
              startPoint[0],
              startPoint[1],
              x,
              y,
              { ...drawingOptions, seed: 1 },
            ) as Drawable;
            break;
          }
          case "DIAMOND": {
            const points = [
              [centerX, startPoint[1]] as [number, number],
              [x, centerY] as [number, number],
              [centerX, y] as [number, number],
              [startPoint[0], centerY] as [number, number],
            ];
            shape = roughCanvasRef.current?.polygon(points, {
              ...drawingOptions,
              seed: 1,
            }) as Drawable;
            break;
          }
          case "ARROW": {
            shape = roughCanvasRef.current?.line(
              startPoint[0],
              startPoint[1],
              x,
              y,
              { ...drawingOptions, seed: 1 },
            ) as Drawable;
            const angle = Math.atan2(y - startPoint[1], x - startPoint[0]);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;
            const arrowX1 = x - arrowLength * Math.cos(angle - arrowAngle);
            const arrowY1 = y - arrowLength * Math.sin(angle - arrowAngle);
            const arrowX2 = x - arrowLength * Math.cos(angle + arrowAngle);
            const arrowY2 = y - arrowLength * Math.sin(angle + arrowAngle);
            const arrowHead1 = roughCanvasRef.current?.line(
              x,
              y,
              arrowX1,
              arrowY1,
              { ...drawingOptions, seed: 1 },
            ) as Drawable;
            const arrowHead2 = roughCanvasRef.current?.line(
              x,
              y,
              arrowX2,
              arrowY2,
              { ...drawingOptions, seed: 1 },
            ) as Drawable;
            if (shape && arrowHead1 && arrowHead2 && session?.user?.id) {
              const mainArrowShape = {
                type: currentShape,
                dataFromRoughJs: shape,
                roomId: roomId,
                creatorId: session.user.id,
              };
              const arrowHead1Shape = {
                type: "LINE" as ShapeType,
                dataFromRoughJs: arrowHead1,
                roomId: roomId,
                creatorId: session.user.id,
              };
              const arrowHead2Shape = {
                type: "LINE" as ShapeType,
                dataFromRoughJs: arrowHead2,
                roomId: roomId,
                creatorId: session.user.id,
              };
              addShape(mainArrowShape, session.user.id);
              addShape(arrowHead1Shape, session.user.id);
              addShape(arrowHead2Shape, session.user.id);
            }
            break;
          }
        }

        if (shape && session?.user?.id && currentShape !== "ARROW") {
          const newShape = {
            type: currentShape,
            dataFromRoughJs: shape,
            roomId: roomId,
            creatorId: session.user.id,
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
  }, [
    shapes,
    roomId,
    currentShape,
    isDrawing,
    currentPath,
    startPoint,
    session?.user?.id,
    drawingOptions,
    addShape,
  ]);

  const [previousShapesLength, setPreviousShapesLength] = useState<
    number | null
  >(null);

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
    // Only show if we had shapes before and now we don't (actual clearing)
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

  const canManage = useMemo(() => canManageCurrentRoom(session?.user ?? null), [canManageCurrentRoom, session?.user]);
  const canClearShapes = useMemo(() => {
    const room = getOverviewRoom();
    return room && session?.user ? canManageRoom(room, session.user) : false;
  }, [getOverviewRoom, canManageRoom, session?.user]);
  const isAdmin = useMemo(() => {
    const room = useRoomStore.getState().getOverviewRoom();
    return room?.userRole === "ADMIN";
  }, [useRoomStore, roomId]);

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
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <ThemeToggle />
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
            Role: {canManage ? "Admin/Owner" : "Member"}
          </div>
        </div>
      </div>
      <ShapeSelector
        currentShape={currentShape}
        onShapeChange={setCurrentShape}
        onClearShapes={handleClearShapes}
      />
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
          size="icon"
          className="rounded-lg h-10 w-10 shadow-lg"
          variant="outline"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </div>
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          size="icon"
          className="rounded-lg h-10 w-10 shadow-lg"
          variant="outline"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>

      <TypeControlPanel
        options={drawingOptions}
        onChange={setDrawingOptions}
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
      />

      <GroupChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <canvas
        id="canvas"
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className={currentShape === "HAND" ? "cursor-pointer" : "cursor-crosshair"}
      />

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
