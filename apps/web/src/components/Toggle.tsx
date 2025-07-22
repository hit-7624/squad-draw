"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
interface ToggleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export function Toggle({ isOpen, setIsOpen }: ToggleProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full h-9 w-9 sm:h-10 sm:w-10 shadow-lg transition-transform duration-300 ease-in-out",
          isOpen
            ? "rotate-90 bg-destructive hover:bg-destructive/90"
            : "bg-primary hover:bg-primary/90",
        )}
        size="icon"
      >
        <X
          className={cn(
            "h-6 w-6 transition-all duration-300 ease-in-out",
            isOpen ? "scale-100 rotate-0" : "scale-0 -rotate-90",
          )}
        />
        <MessageCircle
          className={cn(
            "absolute h-6 w-6 transition-all duration-300 ease-in-out",
            isOpen ? "scale-0 rotate-90" : "scale-100 rotate-0",
          )}
        />
        <span className="sr-only">Toggle Chat</span>
      </Button>
    </div>
  );
}