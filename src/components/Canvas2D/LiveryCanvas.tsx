import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LiveryState, DecalLayer, VehicleModel } from '../../types';
import { DECAL_LIBRARY } from '../../utils/decalLibrary';
import { CANVAS_SIZE } from '../../constants';
import { ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2, Eye, EyeOff, MapPin, Printer, Compass, Maximize, Minimize, X } from 'lucide-react';

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

// ─── Blueprint Panel Layout (1024 × 1024 canvas) ──────────────────────────
// Cross formation:
//
//           [TOP]              col: 342–682   row: 0–256
//   [WEST] [SIDE_L] [EAST]    col: 0–1024    row: 256–576
//           [FRONT]            col: 342–682   row: 576–768
//           [REAR]             col: 342–682   row: 768–1024
//
// Actually use a cleaner 5-zone layout:
//   TOP:    x 300-724,  y 20-236
//   SIDE_L: x 0-512,    y 256-580
//   SIDE_R: x 512-1024, y 256-580  (mirror — passenger side)
//   FRONT:  x 300-724,  y 596-788
//   REAR:   x 300-724,  y 808-1004
// ─────────────────────────────────────────────────────────────────────────

const PANELS = {
  TOP:    { x: 300, y: 20,  w: 424, h: 216, label: 'ROOF / TOP',        dir: 'N',  color: '#00f0ff' },
  SIDE_L: { x: 0,   y: 256, w: 512, h: 324, label: 'DRIVER SIDE (EAST)', dir: 'E',  color: '#39ff14' },
  SIDE_R: { x: 512, y: 256, w: 512, h: 324, label: 'PASS SIDE (WEST)',   dir: 'W',  color: '#ff5500' },
  FRONT:  { x: 300, y: 596, w: 424, h: 192, label: 'FRONT (NORTH)',      dir: 'N↑', color: '#ff007f' },
  REAR:   { x: 300, y: 808, w: 424, h: 196, label: 'REAR (SOUTH)',       dir: 'S↓', color: '#ffea00' },
};

type PanelKey = keyof typeof PANELS;

function getPanelAtPoint(x: number, y: number): PanelKey | null {
  for (const [key, p] of Object.entries(PANELS)) {
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) {
      return key as PanelKey;
    }
  }
  return null;
}

function resolvePanelName(x: number, y: number, _vehicle: VehicleModel): string {
  const panel = getPanelAtPoint(x, y);
  if (!panel) return 'CHASSIS BODY';
  return PANELS[panel].label;
}

// ─── Draw a single car panel silhouette (car shape outline) ───────────────
function drawCarSilhouette(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, pw: number, ph: number,
  view: 'top' | 'side' | 'front' | 'rear',
  primaryColor: string,
  secondaryColor: string
) {
  ctx.save();
  ctx.translate(px, py);

  if (view === 'side') {
    // Side profile — realistic car silhouette
    ctx.beginPath();
    const bx = 0, by = ph * 0.25, bw = pw, bh = ph * 0.75; // body base
    // Body lower rectangle
    ctx.fillStyle = primaryColor;
    // Full body rect
    ctx.fillRect(bx + pw * 0.04, by + ph * 0.22, pw * 0.92, ph * 0.5);
    // Cabin roof trapezoid
    ctx.beginPath();
    ctx.moveTo(pw * 0.18, by + ph * 0.22);
    ctx.lineTo(pw * 0.82, by + ph * 0.22);
    ctx.lineTo(pw * 0.72, by - ph * 0.05);
    ctx.lineTo(pw * 0.28, by - ph * 0.05);
    ctx.closePath();
    ctx.fill();
    // Windshield outline
    ctx.strokeStyle = 'rgba(0,240,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pw * 0.28, by + ph * 0.22);
    ctx.lineTo(pw * 0.33, by - ph * 0.04);
    ctx.lineTo(pw * 0.46, by - ph * 0.04);
    ctx.lineTo(pw * 0.42, by + ph * 0.22);
    ctx.stroke();
    // Rear window
    ctx.beginPath();
    ctx.moveTo(pw * 0.62, by + ph * 0.22);
    ctx.lineTo(pw * 0.58, by - ph * 0.04);
    ctx.lineTo(pw * 0.71, by - ph * 0.04);
    ctx.lineTo(pw * 0.76, by + ph * 0.22);
    ctx.stroke();
    // Door line
    ctx.strokeStyle = secondaryColor + '66';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pw * 0.50, by + ph * 0.22);
    ctx.lineTo(pw * 0.50, by + ph * 0.72);
    ctx.stroke();
    // Wheels
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    [[pw * 0.18, ph * 0.84], [pw * 0.82, ph * 0.84]].forEach(([wx, wy]) => {
      ctx.beginPath();
      ctx.arc(wx, wy, ph * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Wheel rim
      ctx.beginPath();
      ctx.arc(wx, wy, ph * 0.07, 0, Math.PI * 2);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    // Secondary accent — side stripe
    ctx.fillStyle = secondaryColor + '55';
    ctx.fillRect(pw * 0.04, by + ph * 0.35, pw * 0.92, ph * 0.1);

  } else if (view === 'top') {
    // Aerial / top-down view
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(pw * 0.08, ph * 0.06, pw * 0.84, ph * 0.88, [pw * 0.06, pw * 0.06, pw * 0.08, pw * 0.08]);
    ctx.fill();
    // Windshield band
    ctx.fillStyle = 'rgba(0,200,255,0.22)';
    ctx.fillRect(pw * 0.1, ph * 0.1, pw * 0.8, ph * 0.2);
    // Rear glass
    ctx.fillRect(pw * 0.1, ph * 0.72, pw * 0.8, ph * 0.16);
    // Center dividing rib
    ctx.fillStyle = secondaryColor + '44';
    ctx.fillRect(pw * 0.46, ph * 0.06, pw * 0.08, ph * 0.88);
    // Door seam lines
    ctx.strokeStyle = 'rgba(0,240,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(pw * 0.08, ph * 0.44);
    ctx.lineTo(pw * 0.92, ph * 0.44);
    ctx.stroke();
    ctx.setLineDash([]);

  } else if (view === 'front') {
    // Front fascia
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(pw * 0.06, ph * 0.12, pw * 0.88, ph * 0.68, 8);
    ctx.fill();
    // Windshield band
    ctx.fillStyle = 'rgba(0,200,255,0.22)';
    ctx.beginPath();
    ctx.roundRect(pw * 0.14, ph * 0.08, pw * 0.72, ph * 0.44, 6);
    ctx.fill();
    // Hood center line
    ctx.strokeStyle = secondaryColor + '55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pw * 0.5, ph * 0.12);
    ctx.lineTo(pw * 0.5, ph * 0.80);
    ctx.stroke();
    // Left headlight
    ctx.fillStyle = '#ffffcc';
    ctx.beginPath();
    ctx.ellipse(pw * 0.2, ph * 0.64, pw * 0.11, ph * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right headlight
    ctx.beginPath();
    ctx.ellipse(pw * 0.8, ph * 0.64, pw * 0.11, ph * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    // Grille
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(pw * 0.24, ph * 0.7, pw * 0.52, ph * 0.2, 4);
    ctx.fill();
    // Grille slats
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(pw * 0.24 + (pw * 0.52 / 5) * i, ph * 0.7);
      ctx.lineTo(pw * 0.24 + (pw * 0.52 / 5) * i, ph * 0.9);
      ctx.stroke();
    }

  } else if (view === 'rear') {
    // Rear fascia
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(pw * 0.06, ph * 0.12, pw * 0.88, ph * 0.68, 8);
    ctx.fill();
    // Rear glass
    ctx.fillStyle = 'rgba(0,200,255,0.22)';
    ctx.beginPath();
    ctx.roundRect(pw * 0.16, ph * 0.12, pw * 0.68, ph * 0.36, 5);
    ctx.fill();
    // Spoiler bar
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(pw * 0.06, ph * 0.1, pw * 0.88, ph * 0.06);
    // Left tail light
    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.roundRect(pw * 0.06, ph * 0.55, pw * 0.22, ph * 0.14, 3);
    ctx.fill();
    // Right tail light
    ctx.beginPath();
    ctx.roundRect(pw * 0.72, ph * 0.55, pw * 0.22, ph * 0.14, 3);
    ctx.fill();
    // Diffuser / bumper
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(pw * 0.1, ph * 0.76, pw * 0.8, ph * 0.16, 4);
    ctx.fill();
    // Exhaust pipes
    ctx.fillStyle = '#333';
    [[pw * 0.22, ph * 0.84], [pw * 0.78, ph * 0.84]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.arc(ex, ey, pw * 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  ctx.restore();
}

// ─── Compass Rose ──────────────────────────────────────────────────────────
function drawCompassRose(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,240,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Cardinal directions
  const dirs: [string, number, string][] = [
    ['N', -Math.PI / 2, '#ff007f'],
    ['S',  Math.PI / 2, '#ffea00'],
    ['E',  0,           '#39ff14'],
    ['W',  Math.PI,     '#ff5500'],
  ];
  dirs.forEach(([label, angle, color]) => {
    const nx = Math.cos(angle) * (r - 3);
    const ny = Math.sin(angle) * (r - 3);
    // Arrow pointer
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(r * 0.35, 0);
    ctx.lineTo(r * 0.85, -r * 0.18);
    ctx.lineTo(r * 0.95, 0);
    ctx.lineTo(r * 0.85, r * 0.18);
    ctx.closePath();
    ctx.fillStyle = color + 'bb';
    ctx.fill();
    ctx.restore();
    // Label
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.round(r * 0.38)}px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, nx * 0.65, ny * 0.65);
  });

  // Center dot
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,240,255,0.8)';
  ctx.fill();

  ctx.restore();
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

  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>({ x: 512, y: 512 });
  const [activePanel, setActivePanel] = useState<string>('DRIVER SIDE (EAST)');
  const [activeCompassDir, setActiveCompassDir] = useState<string>('E');

  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; angle: number; scaleX: number; scaleY: number; rotation: number }>({
    dist: 0, angle: 0, scaleX: 1, scaleY: 1, rotation: 0
  });

  const [canvasZoom, setCanvasZoom] = useState(1);
  const [localShowGuides, setLocalShowGuides] = useState(showGuides);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard shortcut listener for Fullscreen (ESC to exit, F to toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          setIsFullscreen(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const selectedDecal = liveryState.decals.find(d => d.id === selectedDecalId);

  // ── Main Canvas Draw ───────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;   // 1024
    const H = canvas.height;  // 1024

    // Background — dark blueprint grid
    ctx.fillStyle = '#0a0a16';
    ctx.fillRect(0, 0, W, H);

    // Subtle blueprint dot grid
    ctx.fillStyle = 'rgba(0,240,255,0.06)';
    for (let gx = 0; gx < W; gx += 32) {
      for (let gy = 0; gy < H; gy += 32) {
        ctx.fillRect(gx, gy, 1, 1);
      }
    }

    const pc = liveryState.primaryColor;
    const sc = liveryState.secondaryColor;

    // ── Draw car silhouettes in each panel ────────────────────────────
    const { TOP, SIDE_L, SIDE_R, FRONT, REAR } = PANELS;

    // Apply paint finish overlay helper
    const applyFinish = (px: number, py: number, pw: number, ph: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      if (liveryState.finish === 'pearlescent') {
        const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, (liveryState.pearlescentColor || '#ffffff') + '44');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py, pw, ph);
      } else if (liveryState.finish === 'chameleon') {
        const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
        grad.addColorStop(0, '#ff007f44');
        grad.addColorStop(0.5, '#00f0ff44');
        grad.addColorStop(1, '#9d00ff44');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py, pw, ph);
      } else if (liveryState.finish === 'carbon') {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        for (let x2 = px; x2 < px + pw; x2 += 6) {
          for (let y2 = py; y2 < py + ph; y2 += 6) {
            if (((x2 - px) + (y2 - py)) % 12 === 0) ctx.fillRect(x2, y2, 3, 3);
          }
        }
      } else if (liveryState.finish === 'metallic') {
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        for (let i = 0; i < 400; i++) {
          ctx.fillRect(px + Math.random() * pw, py + Math.random() * ph, 2, 2);
        }
      } else if (liveryState.finish === 'rust') {
        ctx.fillStyle = 'rgba(139,69,19,0.2)';
        for (let i = 0; i < 300; i++) {
          const rx = px + Math.random() * pw;
          const ry = py + Math.random() * ph;
          ctx.beginPath();
          ctx.arc(rx, ry, Math.random() * 5 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };

    // Draw each panel
    drawCarSilhouette(ctx, TOP.x,    TOP.y,    TOP.w,    TOP.h,    'top',   pc, sc);
    drawCarSilhouette(ctx, SIDE_L.x, SIDE_L.y, SIDE_L.w, SIDE_L.h, 'side',  pc, sc);
    drawCarSilhouette(ctx, SIDE_R.x, SIDE_R.y, SIDE_R.w, SIDE_R.h, 'side',  pc, sc);
    drawCarSilhouette(ctx, FRONT.x,  FRONT.y,  FRONT.w,  FRONT.h,  'front', pc, sc);
    drawCarSilhouette(ctx, REAR.x,   REAR.y,   REAR.w,   REAR.h,   'rear',  pc, sc);

    // Apply finish overlays to each panel
    applyFinish(TOP.x,    TOP.y,    TOP.w,    TOP.h);
    applyFinish(SIDE_L.x, SIDE_L.y, SIDE_L.w, SIDE_L.h);
    applyFinish(SIDE_R.x, SIDE_R.y, SIDE_R.w, SIDE_R.h);
    applyFinish(FRONT.x,  FRONT.y,  FRONT.w,  FRONT.h);
    applyFinish(REAR.x,   REAR.y,   REAR.w,   REAR.h);

    // ── Unlayer image overlay ──────────────────────────────────────────
    if (liveryState.unlayerOverlayUrl) {
      const img = new Image();
      img.src = liveryState.unlayerOverlayUrl;
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(img, 0, 0, W, H);
        ctx.restore();
      } else {
        img.onload = () => drawCanvas();
      }
    }

    // ── Draw Decals ────────────────────────────────────────────────────
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
        drawLicensePlate(ctx, decal);
      } else if (decal.category === 'sponsor' || decal.category === 'text') {
        ctx.font = `bold 42px ${decal.fontFamily || 'Orbitron'}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = decal.color;
        ctx.shadowColor = decal.color;
        ctx.shadowBlur = 8;
        ctx.fillText(decal.customText || decal.name, 0, 0);
      } else if (def?.pathSvg) {
        const path2d = new Path2D(def.pathSvg);
        ctx.fillStyle = decal.color;
        ctx.shadowColor = decal.color;
        ctx.shadowBlur = 4;
        ctx.fill(path2d);
      }
      ctx.restore();
    });

    // Send texture to 3D scene
    if (onCanvasRender) onCanvasRender(canvas);

    // ── Blueprint Panel Labels & Guides ────────────────────────────────
    if (localShowGuides) {
      ctx.save();

      Object.entries(PANELS).forEach(([, p]) => {
        // Panel border glow
        ctx.strokeStyle = p.color + 'cc';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);

        // Panel fill tint
        ctx.fillStyle = p.color + '0d';
        ctx.fillRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);

        // Panel label chip
        ctx.setLineDash([]);
        const chipPad = 5;
        const chipX = p.x + 6;
        const chipY = p.y + 5;
        ctx.font = 'bold 10px Orbitron, monospace';
        const tw = ctx.measureText(p.label).width;
        ctx.fillStyle = '#000000cc';
        ctx.beginPath();
        ctx.roundRect(chipX - chipPad, chipY - chipPad, tw + chipPad * 2, 20, 4);
        ctx.fill();
        ctx.fillStyle = p.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(p.label, chipX, chipY);

        // Direction badge (N / S / E / W)
        ctx.font = 'bold 14px Orbitron, monospace';
        ctx.fillStyle = p.color;
        ctx.textAlign = 'right';
        ctx.fillText(p.dir, p.x + p.w - 6, p.y + 7);
      });

      // Connector dashed lines between panels
      ctx.strokeStyle = 'rgba(0,240,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      // TOP → SIDE_L connector
      ctx.beginPath();
      ctx.moveTo(PANELS.TOP.x, PANELS.TOP.y + PANELS.TOP.h);
      ctx.lineTo(PANELS.SIDE_L.x + PANELS.SIDE_L.w, PANELS.SIDE_L.y);
      ctx.stroke();
      // TOP → SIDE_R connector
      ctx.beginPath();
      ctx.moveTo(PANELS.TOP.x + PANELS.TOP.w, PANELS.TOP.y + PANELS.TOP.h);
      ctx.lineTo(PANELS.SIDE_R.x, PANELS.SIDE_R.y);
      ctx.stroke();
      // SIDE → FRONT connector
      ctx.beginPath();
      ctx.moveTo(PANELS.SIDE_L.x + PANELS.SIDE_L.w / 2, PANELS.SIDE_L.y + PANELS.SIDE_L.h);
      ctx.lineTo(PANELS.FRONT.x + PANELS.FRONT.w / 2, PANELS.FRONT.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // ── Compass Rose (bottom-right corner) ────────────────────────────
    drawCompassRose(ctx, W - 54, H - 54, 42);

    // ── Selection Handles ──────────────────────────────────────────────
    if (selectedDecal && selectedDecal.visible) {
      ctx.save();
      ctx.translate(selectedDecal.x, selectedDecal.y);
      ctx.rotate((selectedDecal.rotation * Math.PI) / 180);

      const handleW = 140 * selectedDecal.scaleX;
      const handleH = 100 * selectedDecal.scaleY;

      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(-handleW / 2, -handleH / 2, handleW, handleH);

      ctx.fillStyle = '#ff007f';
      const corners: [number, number][] = [
        [-handleW / 2, -handleH / 2],
        [handleW / 2, -handleH / 2],
        [handleW / 2, handleH / 2],
        [-handleW / 2, handleH / 2]
      ];
      corners.forEach(([cx, cy]) => ctx.fillRect(cx - 6, cy - 6, 12, 12));

      // Rotation knob
      ctx.beginPath();
      ctx.moveTo(0, -handleH / 2);
      ctx.lineTo(0, -handleH / 2 - 30);
      ctx.strokeStyle = '#ff007f';
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

  // ── Pointer Interaction ────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }

    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;
    const clickX = Math.round((e.clientX - rect.left) * scale);
    const clickY = Math.round((e.clientY - rect.top) * scale);

    setHoverCoords({ x: clickX, y: clickY });
    const panelKey = getPanelAtPoint(clickX, clickY);
    if (panelKey) {
      setActivePanel(PANELS[panelKey].label);
      setActiveCompassDir(PANELS[panelKey].dir);
    }

    activePointers.current.set(e.pointerId, { x: clickX, y: clickY });

    if (activePointers.current.size === 2 && selectedDecal) {
      const pts = Array.from(activePointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
      pinchStart.current = { dist, angle, scaleX: selectedDecal.scaleX, scaleY: selectedDecal.scaleY, rotation: selectedDecal.rotation };
      setDragMode('scale');
      return;
    }

    if (selectedDecal) {
      const handleH = 100 * selectedDecal.scaleY;
      const rotKnobX = selectedDecal.x;
      const rotKnobY = selectedDecal.y - (handleH / 2 + 30);
      if (Math.hypot(clickX - rotKnobX, clickY - rotKnobY) < 35) {
        setIsDragging(true);
        setDragMode('rotate');
        setDragStart({ x: clickX, y: clickY });
        setDecalStartPos({ x: selectedDecal.x, y: selectedDecal.y, scaleX: selectedDecal.scaleX, scaleY: selectedDecal.scaleY, rotation: selectedDecal.rotation });
        return;
      }
    }

    const sorted = [...liveryState.decals].sort((a, b) => b.zIndex - a.zIndex);
    const hit = sorted.find(d => Math.hypot(clickX - d.x, clickY - d.y) < 90 * Math.max(d.scaleX, d.scaleY));
    if (hit) {
      onSelectDecal(hit.id);
      setIsDragging(true);
      setDragMode('move');
      setDragStart({ x: clickX, y: clickY });
      setDecalStartPos({ x: hit.x, y: hit.y, scaleX: hit.scaleX, scaleY: hit.scaleY, rotation: hit.rotation });
    } else {
      onSelectDecal(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;
    const currX = Math.round((e.clientX - rect.left) * scale);
    const currY = Math.round((e.clientY - rect.top) * scale);

    setHoverCoords({ x: currX, y: currY });
    const panelKey = getPanelAtPoint(currX, currY);
    if (panelKey) {
      setActivePanel(PANELS[panelKey].label);
      setActiveCompassDir(PANELS[panelKey].dir);
    }

    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: currX, y: currY });
    }

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
    if (activePointers.current.size === 0) setIsDragging(false);
    const canvas = canvasRef.current;
    if (canvas) { try { canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ } }
  };

  // Active panel color for HUD
  const activePanelColor = Object.values(PANELS).find(p => p.label === activePanel)?.color || '#00f0ff';

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] bg-[#070710]/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fadeIn"
          : "relative w-full h-full flex flex-col items-center justify-center bg-[#07071299] p-2 sm:p-3 rounded-xl border border-vice-border shadow-2xl overflow-hidden"
      }
    >
      {/* FLOATING HUD CONTROLS */}
      <div className={`absolute ${isFullscreen ? 'top-3 right-3 sm:top-5 sm:right-5' : 'top-3 right-3'} z-20 flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-vice-border shadow-lg`}>
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg text-xs transition-all ${canUndo ? 'text-vice-pink hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'}`}
          >
            <Undo2 size={15} />
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg text-xs transition-all ${canRedo ? 'text-vice-cyan hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'}`}
          >
            <Redo2 size={15} />
          </button>
        )}

        <div className="w-[1px] h-4 bg-gray-700 mx-0.5" />

        <button
          onClick={() => setCanvasZoom(prev => Math.min(2.5, prev + 0.15))}
          title="Zoom In"
          className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => setCanvasZoom(prev => Math.max(0.5, prev - 0.15))}
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
          title={localShowGuides ? 'Hide Blueprint Guides' : 'Show Blueprint Guides'}
          className={`p-1.5 rounded-lg transition-all ${
            localShowGuides ? 'text-vice-cyan bg-vice-cyan/20 border border-vice-cyan/40' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {localShowGuides ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>

        <div className="w-[1px] h-4 bg-gray-700 mx-0.5" />

        {/* FULLSCREEN MODE TOGGLE (LIKE UNLAYER) */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen (ESC)" : "Fullscreen 2D Canvas (F)"}
          className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
            isFullscreen
              ? 'text-[#39ff14] bg-[#39ff14]/20 border border-[#39ff14]/50 shadow-neon-green'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          {isFullscreen && <span className="text-[10px] font-vice font-bold pr-1 hidden sm:inline">EXIT FULLSCREEN</span>}
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

      {/* TOP LEFT: VEHICLE BADGE */}
      <div className={`absolute ${isFullscreen ? 'top-3 left-3 sm:top-5 sm:left-5' : 'top-3 left-3'} z-20 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-vice-cyan/40 shadow-lg text-xs font-vice text-vice-cyan`}>
        <Compass size={13} className="animate-spin" style={{ animationDuration: '8s' }} />
        <span className="font-bold">{liveryState.vehicle.toUpperCase()} BLUEPRINT</span>
        <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">{isFullscreen ? 'FULLSCREEN 2D' : '5-VIEW'}</span>
      </div>

      {/* CANVAS CONTAINER */}
      <div
        style={{ transform: `scale(${canvasZoom})`, transition: 'transform 0.15s ease-out' }}
        className={`relative w-full ${isFullscreen ? 'max-w-[min(82vh,850px)] max-h-[82vh]' : 'max-w-[560px]'} aspect-square rounded-lg overflow-hidden border-2 border-vice-cyan/30 shadow-[0_0_30px_#00f0ff22] group my-auto`}
      >
        <canvas
          ref={canvasRef}
          width={1024}
          height={1024}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Holographic scanline overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.18)_51%)] bg-[length:100%_3px]" />
      </div>

      {/* BOTTOM TELEMETRY BAR */}
      <div className={`mt-2.5 w-full ${isFullscreen ? 'max-w-[min(82vh,850px)]' : 'max-w-[560px]'} flex items-center justify-between px-2 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-gray-800 text-[11px] font-mono text-gray-300`}>
        <div className="flex items-center gap-1.5 font-vice font-bold" style={{ color: activePanelColor }}>
          <MapPin size={13} className="animate-pulse" style={{ color: activePanelColor }} />
          <span>{activePanel}</span>
          <span
            className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono border"
            style={{ color: activePanelColor, borderColor: activePanelColor + '55', background: activePanelColor + '18' }}
          >
            {activeCompassDir}
          </span>
        </div>

        {hoverCoords && (
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="text-vice-cyan font-bold">
              X:{hoverCoords.x} Y:{hoverCoords.y}
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
            <span>READY TO PRINT</span>
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

// ─── License Plate Helper ──────────────────────────────────────────────────
function drawLicensePlate(ctx: CanvasRenderingContext2D, decal: DecalLayer) {
  const plateW = 240;
  const plateH = 120;
  ctx.save();
  ctx.translate(-plateW / 2, -plateH / 2);

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

  ctx.beginPath();
  ctx.roundRect(0, 0, plateW, plateH, 12);
  ctx.fill();

  ctx.strokeStyle = decal.plateStyle === 'black_gold' ? '#ffea00' : '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = decal.plateStyle === 'yellow_blue' ? '#ffea00' : '#ffffff';
  ctx.font = 'bold 16px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillText('VICE CITY', plateW / 2, 24);

  ctx.font = 'bold 36px Impact, sans-serif';
  ctx.fillStyle = decal.plateStyle === 'yellow_blue' ? '#ffea00' : decal.plateStyle === 'black_gold' ? '#ffea00' : '#111111';
  if (decal.plateStyle === 'vice_pink') ctx.fillStyle = '#ffffff';
  ctx.fillText(decal.plateText || 'VC 1986', plateW / 2, 70);

  ctx.restore();
}
