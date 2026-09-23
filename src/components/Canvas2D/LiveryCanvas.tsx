import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LiveryState, DecalLayer, VehicleModel } from '../../types';
import { DECAL_LIBRARY } from '../../utils/decalLibrary';
import { ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2, Eye, EyeOff, Crosshair, MapPin, Printer, Download } from 'lucide-react';

interface LiveryCanvasProps {
  liveryState: LiveryState;
  selectedDecalId: string | null;
  onSelectDecal: (id: string | null) => void;
  onUpdateDecal: (id: string, updates: Partial<DecalLayer>) => void;
  onCanvasRender?: (canvas: HTMLCanvasElement) => void;
  showGuides?: boolean;
  onToggleGuides?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenExportModal?: () => void;
}

export const LiveryCanvas: React.FC<LiveryCanvasProps> = ({
  liveryState,
  selectedDecalId,
  onSelectDecal,
  onUpdateDecal,
  onCanvasRender,
  showGuides = true,
  onToggleGuides,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenExportModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'rotate' | 'scale'>('move');
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [decalStartPos, setDecalStartPos] = useState<{ x: number; y: number; scaleX: number; scaleY: number; rotation: number }>({
    x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0
  });

  // Real-time VX tracking
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>({ x: 512, y: 512 });
  const [activePanel, setActivePanel] = useState<string>('HOOD BONNET');

  // Multi-touch tracking
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; angle: number; scaleX: number; scaleY: number; rotation: number }>({
    dist: 0,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  });

  const [canvasZoom, setCanvasZoom] = useState(1);
  const [localShowGuides, setLocalShowGuides] = useState(showGuides);

  const selectedDecal = liveryState.decals.find(d => d.id === selectedDecalId);

  // Helper to resolve panel based on 2D coordinates
  const resolvePanelName = (x: number, y: number, vehicle: VehicleModel): string => {
    if (vehicle === 'dirtbike') {
      if (y < 400) return 'FRONT NUMBER PLATE & FORKS';
      if (y >= 400 && y <= 750) return x < 512 ? 'LEFT TANK SHROUD' : 'RIGHT TANK SHROUD';
      return 'REAR FENDER & EXHAUST';
    }
    if (y < 420 && x >= 200 && x <= 824) return 'HOOD / FRONT BONNET';
    if (y >= 420 && y <= 830) {
      if (x <= 480) return 'LEFT DOOR & SIDE SILL';
      if (x >= 544) return 'RIGHT DOOR & SIDE SILL';
      return 'ROOF & CABIN TOP';
    }
    if (y > 830) return 'REAR SPOILER & BUMPER';
    return 'CHASSIS BODYWORK';
  };

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

    // 3. PAINT FINISH OVERLAYS
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

    // 3b. UNLAYER IMAGE EDITOR OVERLAY — drawn below decals, above paint
    if (liveryState.unlayerOverlayUrl) {
      const img = new Image();
      img.src = liveryState.unlayerOverlayUrl;
      // Draw synchronously if already cached in browser, otherwise skip frame
      // (next drawCanvas call triggered by state update will catch it)
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(img, 0, 0, W, H);
        ctx.restore();
      } else {
        img.onload = () => drawCanvas();
      }
    }

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
        // Draw SVG path graphic
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

    // 5. DRAW VEHICLE UV BLUEPRINT WIREFRAME GUIDES (If enabled)
    if (localShowGuides) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);

      // Technical blueprint grid background
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let gx = 128; gx < W; gx += 128) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = 128; gy < H; gy += 128) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // Panel outlines with cyan neon glow
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);

      // 1. Hood Region
      ctx.strokeRect(W * 0.22, H * 0.04, W * 0.56, H * 0.36);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.font = 'bold 13px Orbitron';
      ctx.fillText('[ FRONT HOOD / BONNET ]', W * 0.25, H * 0.08);
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.fillText('UV: (0.22, 0.04) → (0.78, 0.40)', W * 0.25, H * 0.11);

      // 2. Left Door Panel
      ctx.strokeRect(W * 0.04, H * 0.44, W * 0.42, H * 0.36);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.font = 'bold 13px Orbitron';
      ctx.fillText('[ LEFT DOOR & FLANK ]', W * 0.06, H * 0.48);
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.fillText('UV: (0.04, 0.44) → (0.46, 0.80)', W * 0.06, H * 0.51);

      // 3. Right Door Panel
      ctx.strokeRect(W * 0.54, H * 0.44, W * 0.42, H * 0.36);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.font = 'bold 13px Orbitron';
      ctx.fillText('[ RIGHT DOOR & FLANK ]', W * 0.56, H * 0.48);
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.fillText('UV: (0.54, 0.44) → (0.96, 0.80)', W * 0.56, H * 0.51);

      // 4. Center Roof & Deck
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.5)';
      ctx.strokeRect(W * 0.42, H * 0.44, W * 0.16, H * 0.36);
      ctx.fillStyle = 'rgba(255, 0, 127, 0.8)';
      ctx.fillText('[ ROOF ]', W * 0.45, H * 0.62);

      // 5. Rear Bumper & Spoiler
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.strokeRect(W * 0.18, H * 0.84, W * 0.64, H * 0.13);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.font = 'bold 13px Orbitron';
      ctx.fillText('[ REAR BUMPER & SPOILER DECK ]', W * 0.22, H * 0.88);

      // Center crosshair
      ctx.strokeStyle = 'rgba(255, 234, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

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
  }, [liveryState, selectedDecalId, localShowGuides, onCanvasRender]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // --- MULTI-TOUCH & POINTER INTERACTION WITH REAL-TIME VX TRACKING ---
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const rect = canvas.getBoundingClientRect();
    const scale = 1024 / rect.width;
    const clickX = Math.round((e.clientX - rect.left) * scale);
    const clickY = Math.round((e.clientY - rect.top) * scale);

    setHoverCoords({ x: clickX, y: clickY });
    setActivePanel(resolvePanelName(clickX, clickY, liveryState.vehicle));

    activePointers.current.set(e.pointerId, { x: clickX, y: clickY });

    // Handle 2-Finger Pinch Start
    if (activePointers.current.size === 2 && selectedDecal) {
      const pts = Array.from(activePointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
      pinchStart.current = {
        dist,
        angle,
        scaleX: selectedDecal.scaleX,
        scaleY: selectedDecal.scaleY,
        rotation: selectedDecal.rotation
      };
      setDragMode('scale');
      return;
    }

    if (selectedDecal) {
      const handleW = 140 * selectedDecal.scaleX;
      const handleH = 100 * selectedDecal.scaleY;

      // Check top rotation knob click
      const rotKnobX = selectedDecal.x;
      const rotKnobY = selectedDecal.y - (handleH / 2 + 30);
      const distRot = Math.hypot(clickX - rotKnobX, clickY - rotKnobY);

      if (distRot < 35) {
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
      return dist < 90 * Math.max(d.scaleX, d.scaleY);
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

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = 1024 / rect.width;
    const currX = Math.round((e.clientX - rect.left) * scale);
    const currY = Math.round((e.clientY - rect.top) * scale);

    setHoverCoords({ x: currX, y: currY });
    setActivePanel(resolvePanelName(currX, currY, liveryState.vehicle));

    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: currX, y: currY });
    }

    // Two-finger Pinch & Rotate
    if (activePointers.current.size === 2 && selectedDecalId && selectedDecal) {
      const pts = Array.from(activePointers.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const currentAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);

      const scaleFactor = Math.max(0.2, Math.min(3.0, currentDist / pinchStart.current.dist));
      const angleDiff = ((currentAngle - pinchStart.current.angle) * 180) / Math.PI;

      onUpdateDecal(selectedDecalId, {
        scaleX: Number((pinchStart.current.scaleX * scaleFactor).toFixed(2)),
        scaleY: Number((pinchStart.current.scaleY * scaleFactor).toFixed(2)),
        rotation: Math.round((pinchStart.current.rotation + angleDiff) % 360)
      });
      return;
    }

    if (!isDragging || !selectedDecalId || !selectedDecal) return;

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

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size === 0) {
      setIsDragging(false);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center bg-[#0d0d18] p-2 sm:p-3 rounded-xl border border-vice-border shadow-2xl overflow-hidden"
    >
      {/* FLOATING HUD CONTROLS OVER CANVAS */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-vice-border shadow-lg">
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              canUndo ? 'text-vice-pink hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <Undo2 size={15} />
          </button>
        )}

        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              canRedo ? 'text-vice-cyan hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <Redo2 size={15} />
          </button>
        )}

        <div className="w-[1px] h-4 bg-gray-700 mx-0.5" />

        <button
          onClick={() => setCanvasZoom(prev => Math.min(2.0, prev + 0.15))}
          title="Zoom In"
          className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ZoomIn size={15} />
        </button>

        <button
          onClick={() => setCanvasZoom(prev => Math.max(0.7, prev - 0.15))}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ZoomOut size={15} />
        </button>

        <button
          onClick={() => setCanvasZoom(1)}
          title="Reset Zoom"
          className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <RotateCcw size={14} />
        </button>

        <div className="w-[1px] h-4 bg-gray-700 mx-0.5" />

        <button
          onClick={() => {
            setLocalShowGuides(!localShowGuides);
            if (onToggleGuides) onToggleGuides();
          }}
          title={localShowGuides ? 'Hide UV Guides' : 'Show UV Guides'}
          className={`p-1.5 rounded-lg transition-all ${
            localShowGuides ? 'text-vice-cyan bg-vice-cyan/20 border border-vice-cyan/40' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {localShowGuides ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>

        {onOpenExportModal && (
          <>
            <div className="w-[1px] h-4 bg-gray-700 mx-0.5" />
            <button
              onClick={onOpenExportModal}
              title="Ready to Print & Export Studio"
              className="px-2 py-1 bg-vice-pink/20 hover:bg-vice-pink text-vice-pink hover:text-white rounded-lg text-[10px] font-vice font-bold transition-all border border-vice-pink/40 shadow-neon-pink flex items-center gap-1 cursor-pointer"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">READY TO PRINT</span>
            </button>
          </>
        )}
      </div>

      {/* TOP LEFT: ACTIVE VEHICLE & UV BADGE */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-vice-cyan/40 shadow-lg text-xs font-vice text-vice-cyan">
        <span className="w-2 h-2 rounded-full bg-vice-cyan animate-ping" />
        <span className="font-bold">{liveryState.vehicle.toUpperCase()} UV MAP</span>
        <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">(1024×1024)</span>
      </div>

      {/* CANVAS CONTAINER WITH SMOOTH TRANSFORM */}
      <div
        style={{ transform: `scale(${canvasZoom})`, transition: 'transform 0.15s ease-out' }}
        className="relative w-full max-w-[560px] aspect-square rounded-lg overflow-hidden border-2 border-vice-pink/40 shadow-neon-pink group"
      >
        <canvas
          ref={canvasRef}
          width={1024}
          height={1024}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none bg-black"
        />

        {/* Dynamic Holographic Scanline Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.25)_51%)] bg-[length:100%_4px]" />
      </div>

      {/* MODERN VX HUD / ACTIVE PANEL & PIXEL TELEMETRY BAR */}
      <div className="mt-2.5 w-full max-w-[560px] flex items-center justify-between px-2 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-gray-800 text-[11px] font-mono text-gray-300">
        <div className="flex items-center gap-1.5 font-vice text-vice-pink font-bold">
          <MapPin size={13} className="text-vice-pink animate-pulse" />
          <span>{activePanel}</span>
        </div>

        {hoverCoords && (
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="text-vice-cyan font-bold">
              X: {hoverCoords.x}px • Y: {hoverCoords.y}px
            </span>
            <span className="hidden sm:inline text-gray-500">
              UV: [{(hoverCoords.x / 1024).toFixed(2)}, {(hoverCoords.y / 1024).toFixed(2)}]
            </span>
          </div>
        )}

        {onOpenExportModal ? (
          <button
            onClick={onOpenExportModal}
            className="px-2 py-0.5 bg-vice-pink hover:bg-pink-600 text-white rounded-lg text-[10px] font-vice font-bold flex items-center gap-1 shadow-neon-pink transition-transform hover:scale-105 cursor-pointer"
            title="Open Ready to Print & Export Studio"
          >
            <Printer size={12} />
            <span>READY TO PRINT 🖨️</span>
          </button>
        ) : (
          <div className="text-[10px] font-vice text-vice-yellow font-bold hidden sm:block">
            {selectedDecal ? `${selectedDecal.name.slice(0, 14)} (${selectedDecal.scaleX.toFixed(1)}x)` : 'READY TO PAINT'}
          </div>
        )}
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
