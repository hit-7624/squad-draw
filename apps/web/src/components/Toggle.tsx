"use client";

import React from "react";
    import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToggleProps {
isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Toggle({ isOpen, setIsOpen }: ToggleProps) {
    return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-6 md:right-6 z-40">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="rounded-lg h-12 w-12 sm:h-10 sm:w-10 shadow-lg transition-all duration-200 hover:scale-105"
        variant="outline"
      >
        <MessageCircle className="h-6 w-6 sm:h-5 sm:w-5" />
      </Button>
    </div>
  );
}