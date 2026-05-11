import React, { useState, useEffect, useRef } from 'react';
import { Move, Check, X } from 'lucide-react';

const CropEditor = ({ imageSrc, crop, onChange, onComplete, onCancel, t }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState(null);

  useEffect(() => {
    if (!crop) {
      onChange({ x: 0, y: 0, width: 1, height: 1 });
    }
  }, []);

  const getClientPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    setIsDragging(true);
    setActiveHandle(handle);
    const pos = getClientPos(e);
    setDragStart(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imgRef.current) return;
    
    const pos = getClientPos(e);
    const dxPx = pos.x - dragStart.x;
    const dyPx = pos.y - dragStart.y;
    
    const rect = imgRef.current.getBoundingClientRect();
    const dx = dxPx / rect.width;
    const dy = dyPx / rect.height;

    let newCrop = { ...crop };

    if (activeHandle === 'move') {
      newCrop.x = Math.max(0, Math.min(1 - newCrop.width, newCrop.x + dx));
      newCrop.y = Math.max(0, Math.min(1 - newCrop.height, newCrop.y + dy));
    } else {
      if (activeHandle === 'se') {
        newCrop.width = Math.max(0.1, Math.min(1 - newCrop.x, newCrop.width + dx));
        newCrop.height = Math.max(0.1, Math.min(1 - newCrop.y, newCrop.height + dy));
      } else if (activeHandle === 'sw') {
        const maxX = newCrop.x + newCrop.width;
        newCrop.x = Math.max(0, Math.min(maxX - 0.1, newCrop.x + dx));
        newCrop.width = maxX - newCrop.x;
        newCrop.height = Math.max(0.1, Math.min(1 - newCrop.y, newCrop.height + dy));
      } else if (activeHandle === 'nw') {
        const maxX = newCrop.x + newCrop.width;
        const maxY = newCrop.y + newCrop.height;
        newCrop.x = Math.max(0, Math.min(maxX - 0.1, newCrop.x + dx));
        newCrop.y = Math.max(0, Math.min(maxY - 0.1, newCrop.y + dy));
        newCrop.width = maxX - newCrop.x;
        newCrop.height = maxY - newCrop.y;
      } else if (activeHandle === 'ne') {
        const maxY = newCrop.y + newCrop.height;
        newCrop.y = Math.max(0, Math.min(maxY - 0.1, newCrop.y + dy));
        newCrop.width = Math.max(0.1, Math.min(1 - newCrop.x, newCrop.width + dx));
        newCrop.height = maxY - newCrop.y;
      }
    }

    onChange(newCrop);
    setDragStart(pos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart, crop]);

  const s = (val) => `${val * 100}%`;

  return (
    <div className="crop-editor">
      <div className="ascii-toolbar">
        <div className="ascii-toolbar__left">
          <span className="text-white font-medium">{t.crop_title}</span>
        </div>
        <div className="ascii-toolbar__right">
          <button onClick={onCancel} className="ascii-button">
            <X className="w-4 h-4"/> {t.btn_cancel}
          </button>
          <button onClick={onComplete} className="ascii-button ascii-button--primary">
            <Check className="w-4 h-4"/> {t.btn_done}
          </button>
        </div>
      </div>

      <div className="crop-editor__area" ref={containerRef}>
         <div style={{ position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <img ref={imgRef} src={imageSrc} alt="Crop Target" style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain', pointerEvents: 'none', display: 'block' }}/>
            <div
              style={{
                position: 'absolute',
                border: '2px solid var(--color-primary)',
                cursor: 'move',
                left: s(crop.x), top: s(crop.y), width: s(crop.width), height: s(crop.height),
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              onTouchStart={(e) => handleMouseDown(e, 'move')}
            >
              <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', pointerEvents: 'none', opacity: 0.3 }}>
                <div style={{ borderRight: '1px solid white', gridRow: '1 / span 3' }}></div>
                <div style={{ borderRight: '1px solid white', gridRow: '1 / span 3' }}></div>
                <div style={{ borderBottom: '1px solid white', gridColumn: '1 / span 3', gridRow: '1', position: 'relative', top: '100%' }}></div>
                <div style={{ borderBottom: '1px solid white', gridColumn: '1 / span 3', gridRow: '2', position: 'relative', top: '100%' }}></div>
              </div>
              
              {[
                { pos: '-top-1.5 -left-1.5', cursor: 'nw-resize', type: 'nw' },
                { pos: '-top-1.5 -right-1.5', cursor: 'ne-resize', type: 'ne' },
                { pos: '-bottom-1.5 -left-1.5', cursor: 'sw-resize', type: 'sw' },
                { pos: '-bottom-1.5 -right-1.5', cursor: 'se-resize', type: 'se' }
              ].map(h => (
                <div 
                  key={h.type}
                  className={`absolute ${h.pos} w-4 h-4 bg-emerald-500 border border-white rounded-full shadow`}
                  style={{ cursor: h.cursor }}
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, h.type); }}
                  onTouchStart={(e) => { e.stopPropagation(); handleMouseDown(e, h.type); }}
                />
              ))}
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                 <Move className="w-8 h-8 text-white/50" />
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CropEditor;