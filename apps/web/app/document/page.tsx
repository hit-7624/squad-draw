"use client";
import { useRef, useEffect } from "react";

export default function Document() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allRects = useRef<{x: number, y: number, width: number, height: number}[]>([]);

  useEffect(()=>{
    if(!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", {willReadFrequently: true});

    if(!ctx) return;

    canvas.width = 496;
    canvas.height = 496;

    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDrawing = true;
      startX = e.offsetX;
      startY = e.offsetY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if(!isDrawing) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw all existing rectangles
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      for(const rect of allRects.current){
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      }
      
      // Draw current rectangle being drawn
      const width = e.offsetX - startX;
      const height = e.offsetY - startY;
      ctx.strokeRect(startX, startY, width, height);
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDrawing = false;
      allRects.current.push({
        x: startX, 
        y: startY, 
        width: e.offsetX - startX, 
        height: e.offsetY - startY
      });
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  })

  return (
    <>
      <canvas ref={canvasRef} style={{
        border: "2px solid white", 
        boxSizing: "border-box", 
        width: "500px", 
        height: "500px"
      }} />
    </>
  )
}