import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LiveryState, DecalLayer } from '../../types';
import { DECAL_LIBRARY } from '../../utils/decalLibrary';

interface LiveryCanvasProps {
  liveryState: LiveryState;
  selectedDecalId: string | null;
  onSelectDecal: (id: string | null) => void;
  onUpdateDecal: (id: string, updates: Partial<DecalLayer>) => void;
  onCanvasRender?: (canvas: HTMLCanvasElement) => void;
  showGuides?: boolean;
}

export const LiveryCanvas: React.FC<LiveryCanvasProps> = ({
  liveryState,
  selectedDecalId,
  onSelectDecal,
  onUpdateDecal,
  onCanvasRender,
  showGuides = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'rotate' | 'scale'>('move');
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [decalStartPos, setDecalStartPos] = useState<{ x: number; y: number; scaleX: number; scaleY: number; rotation: number }>({
    x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0
  });

  const selectedDecal = liveryState.decals.find(d => d.id === selectedDecalId);

  // Redraw Canvas whenever liveryState changes
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas Size 1024x1024 for sharp UV texture mapping
    const W = canvas.width;
    const H = canvas.height;

    // 1. CLEAR & PRIMARY PAINT COAT
    ctx.fillStyle = liveryState.primaryColor;
    ctx.fillRect(0, 0, W, H);

    // 2. DUAL TONE SECONDARY ACCENT SECTIONS (Hood/Roof/Side)
    ctx.save();
    ctx.fillStyle = liveryState.secondaryColor;
    // Hood wedge accent
    ctx.beginPath();
    ctx.moveTo(W * 0.3, 0);
    ctx.lineTo(W * 0.7, 0);
    ctx.lineTo(W * 0.6, H * 0.45);
    ctx.lineTo(W * 0.4, H * 0.45);
    ctx.closePath();
    ctx.fill();

    // Side sill accent lines
    ctx.fillRect(0, H * 0.9, W, H * 0.1);
    ctx.restore();

    // 3. PAINT FINISH OVERLAYS (Matte, Metallic, Pearlescent, Chameleon, Carbon, Rust)
    ctx.save();
    if (liveryState.finish === 'pearlescent') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, liveryState.pearlescentColor + '55');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (liveryState.finish === 'chameleon') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#ff007f44');
      grad.addColorStop(0.5, '#00f0ff44');
      grad.addColorStop(1, '#9d00ff44');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (liveryState.finish === 'carbon') {
      // Carbon fiber weave pattern
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      for (let x = 0; x < W; x += 8) {
        for (let y = 0; y < H; y += 8) {
          if ((x + y) % 16 === 0) {
            ctx.fillRect(x, y, 4, 4);
          }
        }
      }
    } else if (liveryState.finish === 'rust') {
      // Rust patina noise
      ctx.fillStyle = 'rgba(139, 69, 19, 0.25)';
      for (let i = 0; i < 2000; i++) {
        const rx = Math.random() * W;
        const ry = Math.random() * H;
        const rSize = Math.random() * 8 + 2;
        ctx.beginPath();
        ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (liveryState.finish === 'metallic') {
      // Subtle metallic sparkle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 1500; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
      }
    }
    ctx.restore();

    // 4. DRAW DECALS IN Z-INDEX ORDER
    const sortedDecals = [...liveryState.decals].sort((a, b) => a.zIndex - b.zIndex);

    sortedDecals.forEach(decal => {
      if (!decal.visible) return;

      ctx.save();
      ctx.translate(decal.x, decal.y);
      ctx.rotate((decal.rotation * Math.PI) / 180);
      ctx.scale(decal.scaleX * (decal.flipX ? -1 : 1), decal.scaleY * (decal.flipY ? -1 : 1));
      ctx.globalAlpha = decal.opacity;

      const def = DECAL_LIBRARY.find(d => d.id === decal.assetId);

      if (decal.category === 'plate') {
        // Draw License Plate Graphic
        drawLicensePlate(ctx, decal);
      } else if (decal.category === 'sponsor' || decal.category === 'text') {
        // Draw Typography
        ctx.font = `bold 42px ${decal.fontFamily || 'Orbitron'}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = decal.color;
        ctx.shadowColor = decal.color;
        ctx.shadowBlur = 8;
        ctx.fillText(decal.customText || decal.name, 0, 0);
      } else if (def?.pathSvg) {
        // Draw SVG path graphic (centered at 0,0 origin)
        const path2d = new Path2D(def.pathSvg);
        ctx.fillStyle = decal.color;
        ctx.shadowColor = decal.color;
        ctx.shadowBlur = 4;
        ctx.fill(path2d);
      }

      ctx.restore();
    });

    // Send CLEAN texture to 3D Three.js material & Exports BEFORE drawing overlays
    if (onCanvasRender) {
      onCanvasRender(canvas);
    }

    // 5. DRAW VEHICLE UV PANEL OUTLINE GUIDES (If enabled)
    if (showGuides) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);

      // Hood region
      ctx.strokeRect(W * 0.25, H * 0.05, W * 0.5, H * 0.35);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.font = '14px Orbitron';
      ctx.fillText('[ HOOD / FRONT BONNET ]', W * 0.26, H * 0.08);

      // Doors region (Left & Right)
      ctx.strokeRect(W * 0.05, H * 0.45, W * 0.42, H * 0.35);
      ctx.fillText('[ LEFT DOOR PANEL ]', W * 0.07, H * 0.48);

      ctx.strokeRect(W * 0.53, H * 0.45, W * 0.42, H * 0.35);
      ctx.fillText('[ RIGHT DOOR PANEL ]', W * 0.55, H * 0.48);

      // Rear wing & bumper
      ctx.strokeRect(W * 0.2, H * 0.85, W * 0.6, H * 0.12);
      ctx.fillText('[ REAR BUMPER & SPOILER ]', W * 0.22, H * 0.88);

      ctx.restore();
    }

    // 6. DRAW SELECTION HANDLES FOR ACTIVE DECAL
    if (selectedDecal && selectedDecal.visible) {
      ctx.save();
      ctx.translate(selectedDecal.x, selectedDecal.y);
      ctx.rotate((selectedDecal.rotation * Math.PI) / 180);

      const handleW = 140 * selectedDecal.scaleX;
      const handleH = 100 * selectedDecal.scaleY;

      // Selection bounding box
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(-handleW / 2, -handleH / 2, handleW, handleH);

      // Corner handles
      ctx.fillStyle = '#ff007f';
      const corners = [
        [-handleW / 2, -handleH / 2],
        [handleW / 2, -handleH / 2],
        [handleW / 2, handleH / 2],
        [-handleW / 2, handleH / 2]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx - 6, cy - 6, 12, 12);
      });

      // Rotation stem & knob
      ctx.beginPath();
      ctx.moveTo(0, -handleH / 2);
      ctx.lineTo(0, -handleH / 2 - 30);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -handleH / 2 - 30, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();

      ctx.restore();
    }
  }, [liveryState, selectedDecalId, showGuides, onCanvasRender]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // --- MOUSE / TOUCH INTERACTION FOR DECAL DRAGGING & TRANSFORMS ---
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 1024 / rect.width;
    const clickX = (e.clientX - rect.left) * scale;
    const clickY = (e.clientY - rect.top) * scale;

    if (selectedDecal) {
      const handleW = 140 * selectedDecal.scaleX;
      const handleH = 100 * selectedDecal.scaleY;

      // Check top rotation knob click
      const rotKnobX = selectedDecal.x;
      const rotKnobY = selectedDecal.y - (handleH / 2 + 30);
      const distRot = Math.hypot(clickX - rotKnobX, clickY - rotKnobY);

      if (distRot < 25) {
        setIsDragging(true);
        setDragMode('rotate');
        setDragStart({ x: clickX, y: clickY });
        setDecalStartPos({
          x: selectedDecal.x,
          y: selectedDecal.y,
          scaleX: selectedDecal.scaleX,
          scaleY: selectedDecal.scaleY,
          rotation: selectedDecal.rotation
        });
        return;
      }
    }

    // Check hit test against decals (topmost zIndex first)
    const sorted = [...liveryState.decals].sort((a, b) => b.zIndex - a.zIndex);
    const hit = sorted.find(d => {
      const dist = Math.hypot(clickX - d.x, clickY - d.y);
      return dist < 80 * Math.max(d.scaleX, d.scaleY);
    });

    if (hit) {
      onSelectDecal(hit.id);
      setIsDragging(true);
      setDragMode('move');
      setDragStart({ x: clickX, y: clickY });
      setDecalStartPos({
        x: hit.x,
        y: hit.y,
        scaleX: hit.scaleX,
        scaleY: hit.scaleY,
        rotation: hit.rotation
      });
    } else {
      onSelectDecal(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedDecalId || !selectedDecal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = 1024 / rect.width;
    const currX = (e.clientX - rect.left) * scale;
    const currY = (e.clientY - rect.top) * scale;

    const dx = currX - dragStart.x;
    const dy = currY - dragStart.y;

    if (dragMode === 'move') {
      onUpdateDecal(selectedDecalId, {
        x: Math.round(decalStartPos.x + dx),
        y: Math.round(decalStartPos.y + dy)
      });
    } else if (dragMode === 'rotate') {
      const angleRad = Math.atan2(currY - selectedDecal.y, currX - selectedDecal.x);
      let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
      if (angleDeg < 0) angleDeg += 360;
      onUpdateDecal(selectedDecalId, { rotation: angleDeg });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0d0d18] p-3 rounded-xl border border-vice-border shadow-2xl">
      <div className="relative w-full max-w-[560px] aspect-square rounded-lg overflow-hidden border-2 border-vice-pink/40 shadow-neon-pink group">
        <canvas
          ref={canvasRef}
          width={1024}
          height={1024}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-crosshair touch-none bg-black"
        />

        {/* Dynamic Scanline & Grid HUD Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.25)_51%)] bg-[length:100%_4px]" />
        
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-xs font-vice text-vice-cyan border border-vice-cyan/30 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-vice-cyan animate-ping" />
          2D UV TEXTURE CANVAS (1024x1024)
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400 font-sans flex items-center justify-between w-full max-w-[560px] px-1">
        <span>💡 Drag decals to reposition • Use handles to scale & rotate</span>
        <span className="text-vice-pink font-semibold">Live 3D Sync Active</span>
      </div>
    </div>
  );
};

// --- HELPER FUNCTION TO RENDER LICENSE PLATES ---
function drawLicensePlate(ctx: CanvasRenderingContext2D, decal: DecalLayer) {
  const plateW = 240;
  const plateH = 120;

  ctx.save();
  ctx.translate(-plateW / 2, -plateH / 2);

  // Plate background box
  if (decal.plateStyle === 'vice_pink') {
    const grad = ctx.createLinearGradient(0, 0, 0, plateH);
    grad.addColorStop(0, '#ff007f');
    grad.addColorStop(0.5, '#ff5500');
    grad.addColorStop(1, '#ffea00');
    ctx.fillStyle = grad;
  } else if (decal.plateStyle === 'yellow_blue') {
    ctx.fillStyle = '#0a2342';
  } else if (decal.plateStyle === 'black_gold') {
    ctx.fillStyle = '#111111';
  } else {
    ctx.fillStyle = '#00f0ff';
  }

  // Rounded rectangle plate
  ctx.beginPath();
  ctx.roundRect(0, 0, plateW, plateH, 12);
  ctx.fill();

  // Outer border
  ctx.strokeStyle = decal.plateStyle === 'black_gold' ? '#ffea00' : '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Header Title Text ("VICE CITY")
  ctx.fillStyle = decal.plateStyle === 'yellow_blue' ? '#ffea00' : '#ffffff';
  ctx.font = 'bold 16px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillText('VICE CITY', plateW / 2, 24);

  // Main Registration Number ("VC 1986")
  ctx.font = 'bold 36px Impact, sans-serif';
  ctx.fillStyle = decal.plateStyle === 'yellow_blue' ? '#ffea00' : decal.plateStyle === 'black_gold' ? '#ffea00' : '#111111';
  if (decal.plateStyle === 'vice_pink') ctx.fillStyle = '#ffffff';
  ctx.fillText(decal.plateText || 'VC 1986', plateW / 2, 70);

  ctx.restore();
}
