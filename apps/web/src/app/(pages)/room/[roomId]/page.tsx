"use client"

import { useState, useRef, useEffect } from "react"
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Diamond,
  Type,
  ImageIcon,
  Minus,
  Edit3,
  Menu,
  RotateCcw,
  Move,
  ZoomIn,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RoomPage() {
  const [selectedTool, setSelectedTool] = useState("pointer")
  const [zoom, setZoom] = useState(105)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Only include tools that match the database ShapeType enum:
  // RECTANGLE, DIAMOND, ELLIPSE, LINE, ARROW, FREEDRAW, TEXT, IMAGE
  const tools = [
    { id: "pointer", icon: MousePointer2, label: "Select" },
    { id: "hand", icon: Hand, label: "Hand" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "diamond", icon: Diamond, label: "Diamond" },
    { id: "ellipse", icon: Circle, label: "Ellipse" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "arrow", icon: Move, label: "Arrow" },
    { id: "freedraw", icon: Edit3, label: "Free Draw" },
    { id: "text", icon: Type, label: "Text" },
    { id: "image", icon: ImageIcon, label: "Image" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to full viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Clear canvas with very dark background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full Screen Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{
          backgroundColor: '#0a0a0a',
        }}
      />

      {/* Floating Top Toolbar */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
        <div
          className="flex items-center gap-0.5 px-1.5 py-1 rounded-md backdrop-blur-md"
          style={{
            backgroundColor: "var(--color-bg-1)",
            borderColor: "var(--color-border-1)",
            border: "1px solid var(--color-border-1)",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.10)",
          }}
        >
          {/* Left Section */}
          <Button variant="ghost" size="icon" className="p-0.5 h-6 w-6">
            <Menu className="w-3 h-3" style={{ color: "var(--color-font-2)" }} />
          </Button>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-300 mx-0.5"></div>

          {/* Center Tools */}
          <div className="flex items-center gap-0.5">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant="ghost"
                size="icon"
                className={`p-0.5 h-6 w-6 hover:bg-opacity-80 ${selectedTool === tool.id ? "bg-opacity-100" : ""}`}
                style={{
                  backgroundColor: selectedTool === tool.id ? "var(--color-custom)" : "transparent",
                  color: selectedTool === tool.id ? "var(--color-lightbg)" : "var(--color-font-2)",
                }}
                onClick={() => setSelectedTool(tool.id)}
              >
                <tool.icon className="w-3 h-3" />
              </Button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-300 mx-0.5"></div>

          {/* Right Section */}
          <div className="flex items-center gap-0.5">
            <Button
              className="px-2 py-0.5 text-xs font-medium rounded h-6"
              style={{
                backgroundColor: "var(--color-custom)",
                color: "var(--color-lightbg)",
              }}
            >
              Share
            </Button>
            <Button
              variant="ghost"
              className="px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 h-6"
              style={{ color: "var(--color-font-2)" }}
            >
              <BookOpen className="w-3 h-3" />
              Library
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Left - Zoom Controls */}
      <div className="absolute bottom-2 left-2 z-10">
        <div
          className="flex items-center gap-0.5 px-1.5 py-1 rounded-md backdrop-blur-md"
          style={{
            backgroundColor: "var(--color-bg-1)",
            borderColor: "var(--color-border-1)",
            border: "1px solid var(--color-border-1)",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.10)",
          }}
        >
          <Button variant="ghost" size="icon" className="p-0.5 h-6 w-6">
            <Minus className="w-3 h-3" style={{ color: "var(--color-font-2)" }} />
          </Button>
          <span className="text-xs min-w-[2rem] text-center" style={{ color: "var(--color-font-2)" }}>
            {zoom}%
          </span>
          <Button variant="ghost" size="icon" className="p-0.5 h-6 w-6">
            <ZoomIn className="w-3 h-3" style={{ color: "var(--color-font-2)" }} />
          </Button>
        </div>
      </div>

      {/* Floating Bottom Center - Navigation Controls */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
        <div
          className="flex items-center gap-0.5 px-1.5 py-1 rounded-md backdrop-blur-md"
          style={{
            backgroundColor: "var(--color-bg-1)",
            borderColor: "var(--color-border-1)",
            border: "1px solid var(--color-border-1)",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.10)",
          }}
        >
          <Button variant="ghost" size="icon" className="p-0.5 h-6 w-6">
            <RotateCcw className="w-3 h-3" style={{ color: "var(--color-font-2)" }} />
          </Button>
          <Button variant="ghost" size="icon" className="p-0.5 h-6 w-6">
            <Move className="w-3 h-3" style={{ color: "var(--color-font-2)" }} />
          </Button>
        </div>
      </div>

      {/* Floating Bottom Right - Color Indicators */}
      <div className="absolute bottom-2 right-2 z-10">
        <div
          className="flex items-center gap-0.5 px-1.5 py-1 rounded-md backdrop-blur-md"
          style={{
            backgroundColor: "var(--color-bg-1)",
            borderColor: "var(--color-border-1)",
            border: "1px solid var(--color-border-1)",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.10)",
          }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-custom)" }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-font-3)" }}></div>
        </div>
      </div>

      {/* Tool Indicator - Top Center (hidden by default to match screenshot) */}
      {false && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <div 
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: 'var(--color-bg-1)',
              color: 'var(--color-font-1)',
              border: '1px solid var(--color-border-1)',
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.10)",
            }}
          >
            Selected tool: {tools.find(t => t.id === selectedTool)?.label || "Unknown"}
          </div>
        </div>
      )}
    </div>
  )
}
