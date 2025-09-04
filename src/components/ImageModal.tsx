
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

const ImageModal = ({ isOpen, onClose, imageUrl, alt }: ImageModalProps) => {
  if (!isOpen) return null;

  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const preventDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const preventKeyboardActions = (e: React.KeyboardEvent) => {
    // Prevent Ctrl+S, Ctrl+A, Ctrl+C, etc.
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      return false;
    }
    // Prevent F12, F11, etc.
    if (e.key === 'F12' || e.key === 'F11') {
      e.preventDefault();
      return false;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 select-none"
      onClick={onClose}
      onContextMenu={preventContextMenu}
      onKeyDown={preventKeyboardActions}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div className="relative max-w-7xl max-h-full">
        <Button
          variant="outline"
          size="icon"
          className="absolute -top-12 right-0 bg-white text-black hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-screen object-contain rounded-lg pointer-events-none select-none"
          onClick={(e) => e.stopPropagation()}
          onContextMenu={preventContextMenu}
          onDragStart={preventDragStart}
          draggable={false}
          style={{ 
            userSelect: 'none', 
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
          } as React.CSSProperties}
        />
        {/* Invisible overlay to prevent right-click */}
        <div 
          className="absolute inset-0 z-10"
          onContextMenu={preventContextMenu}
          onDragStart={preventDragStart}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageModal;
