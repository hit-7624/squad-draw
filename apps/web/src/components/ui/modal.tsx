import React from 'react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'danger';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = 'default'
}: ModalProps) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={
              variant === 'danger'
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-custom text-white hover:bg-custom-hover"
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}; 