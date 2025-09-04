import React from 'react';

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const ProtectedImage = ({ src, alt, className, onClick, style }: ProtectedImageProps) => {
  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const preventDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const preventSelectStart = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div className="relative inline-block select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <img
        src={src}
        alt={alt}
        className={`select-none pointer-events-none ${className || ''}`}
        onClick={onClick}
        onContextMenu={preventContextMenu}
        onDragStart={preventDragStart}
        
        draggable={false}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          pointerEvents: 'none',
          ...style
        } as React.CSSProperties}
      />
      {/* Invisible overlay to capture clicks and prevent right-click */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={onClick}
        onContextMenu={preventContextMenu}
        onDragStart={preventDragStart}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      />
    </div>
  );
};

export default ProtectedImage;