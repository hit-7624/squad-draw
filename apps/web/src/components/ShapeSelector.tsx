"use client";
import { ShapeType } from "@/schemas/index";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Circle,
  Square,
  Minus,
  Diamond,
  ArrowRight,
  PenTool,
  Type,
  Image,
  Eraser,
  Hand,
} from "lucide-react";

interface ShapeSelectorProps {
  currentShape: ShapeType | 'HAND';
  onShapeChange: (shape: ShapeType | 'HAND') => void;
  onClearShapes?: () => void;
  isHandMode: boolean;
  onHandModeToggle: (active: boolean) => void;
}

const shapeOptions: {
  type: ShapeType;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}[] = [
  { type: "ELLIPSE", label: "Ellipse", icon: <Circle size={16} /> },
  { type: "RECTANGLE", label: "Rectangle", icon: <Square size={16} /> },
  { type: "LINE", label: "Line", icon: <Minus size={16} /> },
  { type: "DIAMOND", label: "Diamond", icon: <Diamond size={16} /> },
  { type: "ARROW", label: "Arrow", icon: <ArrowRight size={16} /> },
  { type: "FREEDRAW", label: "Free Draw", icon: <PenTool size={16} /> },
  { type: "TEXT", label: "Text", icon: <Type size={16} />, disabled: true },
  { type: "IMAGE", label: "Image", icon: <Image size={16} />, disabled: true },
];

export default function ShapeSelector({
  currentShape,
  onShapeChange,
  onClearShapes,
  isHandMode,
  onHandModeToggle,
}: ShapeSelectorProps) {
  return (
    <Card className="absolute left-4 top-4 z-10 p-2 bg-background/90 backdrop-blur-sm border">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-center text-muted-foreground mb-1">
          Shapes
        </div>
        <Button
          variant={isHandMode ? "default" : "outline"}
          size="sm"
          onClick={() => {
            onHandModeToggle(!isHandMode);
            onShapeChange('HAND');
          }}
          className={`w-10 h-10 p-0 flex items-center justify-center transition-transform ${isHandMode ? "scale-105" : "hover:scale-105"}`}
          title="Hand Tool (Pan)"
        >
          <Hand size={16} />
        </Button>
        {shapeOptions.map((shape) => (
          <Button
            key={shape.type}
            variant={!isHandMode && currentShape === shape.type ? "default" : "outline"}
            size="sm"
            onClick={() => {
              onHandModeToggle(false);
              if (!shape.disabled) onShapeChange(shape.type);
            }}
            disabled={shape.disabled}
            className={`w-10 h-10 p-0 flex items-center justify-center transition-transform ${
              shape.disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105"
            }`}
            title={
              shape.disabled ? `${shape.label} (Coming Soon)` : shape.label
            }
          >
            {shape.icon}
          </Button>
        ))}
        {/* Separator */}
        <div className="w-full h-px bg-border my-1"></div>
        {/* Eraser button */}
        {onClearShapes && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearShapes}
            className="w-10 h-10 p-0 flex items-center justify-center transition-transform hover:scale-105 hover:bg-destructive hover:text-destructive-foreground"
            title="Clear All Shapes"
          >
            <Eraser size={16} />
          </Button>
        )}
      </div>
    </Card>
  );
}
