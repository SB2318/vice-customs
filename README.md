# Vice Customs — GTA VI-Inspired Car Livery Studio

> **Built for the [#BuiltWithImageEditor](https://www.linkedin.com/search/results/all/?keywords=%23builtwithimageeditor) Challenge by Unlayer** · Submission deadline: September 24, 2026

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)](https://threejs.org)
[![Unlayer React Image Editor](https://img.shields.io/badge/Unlayer-React%20Image%20Editor-ff6b35)](https://github.com/unlayer/react-image-editor)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## What is Vice Customs?

**Vice Customs** is a full-featured, GTA VI-inspired **car livery and decal customization studio** — combining high-performance WebGL 3D rendering with native image editing, running entirely in your browser.

Players design custom vehicle paint wraps on a 2D canvas suite (powered by **Unlayer React Image Editor** and custom 2D UV texture tools), and see their creation **mapped in real-time onto a 3D car model** inside dynamic 3D environments. Add decals, rev the V8 engine, trigger exhaust flames, cycle retro synthwave radio stations, and export print-ready 1024x1024 UV textures and 3D renders.

---

## Challenge Requirements Met

| Requirement | Status |
|---|---|
| GTA VI-inspired experience | Complete — Vice City garage aesthetics, vehicle customization, synthwave radio, 3D environments |
| React Image Editor as a core part | Complete — `@unlayer/react-image-editor` natively embedded inside the 2D suite with full-screen expansion |
| Users can edit / customize visual assets | Complete — Full 2D texture canvas and Unlayer editor composited to live 3D vehicle skins |
| Public GitHub repository | Complete — Source code hosted in this repository |
| Deployed project | Complete — Production build deployed |

---

## Key Integrations & Features

### Embedded Unlayer Image Editor Integration
- **Native Suite Embedding** — Embedded as a primary tab inside the 2D suite for seamless workflow without intrusive modal popups.
- **Full-Screen Maximize / Minimize** — One-click expand button allows users to toggle fullscreen canvas editing mode.
- **Live Texture Compositing** — Saved Unlayer artwork composites directly as a base layer on the 1024x1024 UV canvas map below decals.
- **Full Editing Toolset** — Advanced filters, cropping, stickers, shape tools, text annotations, and freehand drawing.

### 4 Dynamic 3D Scene Environments & Weather Studio
- **Studio Mode** — High-gloss studio lighting setup with classic pink/cyan neon tube accents.
- **Rain & Thunderstorm Mode** — GPU particle rain system, wet floor puddle reflections, storm lighting, and random procedural white lightning flashes.
- **Synthwave Sunset Mode** — Purple-tinted outrun atmosphere featuring an animated retro horizon sun with horizontal slats, golden rim lights, and enhanced reflections.
- **Cyberpunk Night Mode** — Deep green atmospheric fog, green/cyan neon accents, and rising Matrix-style spark particles.

### 2D Livery Canvas & Decal Studio
- **Paint & Finishes** — Primary body color, dual-tone secondary accenting, and physical finish materials (Gloss, Matte, Metallic, Pearlescent, Chameleon Iridescent, Carbon Fiber, Rust Patina).
- **Decal Library** — Racing stripes, flames, stencils, sponsor logos (Pegassi, Grotti, Sprunk, eCola), bullet holes, and scratch damage.
- **Custom License Plates** — Custom typography and plate styles (Sunset Pink, Blue/Yellow, Outlaw Black & Gold).
- **Touch & Gesture Support** — Multi-touch pinch-to-scale, rotate, and drag gestures for mobile devices and tablets.
- **UV Telemetry Bar** — Live X/Y pixel telemetry, UV coordinate tracking, and panel region identification.

### Responsive Mobile & Viewport Architecture
- **100dvh Dynamic Viewport** — Fully responsive container layout utilizing Dynamic Viewport Height (`100dvh`) to prevent address bar scrolling on iOS Safari and Android Chrome.
- **Native Bottom Navigation Bar** — Mobile thumb-friendly bottom bar for toggling between 2D Canvas and 3D Studio views on screens under 1024px width.
- **Non-Overlapping 3D HUD** — Flex overlay structure ensuring 3D title badges, camera presets, and theme selectors never overlap on mobile viewports.
- **Drag-to-Scroll Containers** — Click-and-drag panning on horizontal tab bars for desktop mouse users alongside native mobile touch support.

### Unified Web Audio Engine & Mute Control
- **Global Audio Mute Switch** — Header volume control (`Volume2` / `VolumeX`) synced across engine revs, exhaust backfire SFX, UI transition clicks, and radio playback.
- **Procedural Engine V8 Audio** — Web Audio API synthesized V8 rumble, turbo whistle spooling, blow-off valve hiss, and exhaust flame pops.
- **Vice Radio Synthwave** — 4 generative audio channels: FLASH FM, WAVE 103, V-ROCK, and WILDSTYLE.

### Ready to Print Export & Garage System
- **1024x1024 2D UV Texture Export** — Actionable print-ready PNG download for game mods and texture mapping.
- **3D Studio Render Snapshot** — High-resolution WebGL viewport render export.
- **JSON Livery Backup & Import** — Download complete vehicle state configs as `.json` files or restore previously saved configurations.
- **LocalStorage Garage Slots** — Save named vehicle builds to browser storage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| 3D Renderer | Three.js + `@react-three/fiber` v8 + `@react-three/drei` |
| Image Editor | **`@unlayer/react-image-editor`** |
| Audio | Web Audio API (procedural synthesis) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Run Locally

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

```bash
node -v   # should be v18+
npm -v    # should be v9+
```

### 1. Clone the Repository

```bash
git clone https://github.com/SB2318/automatic-bassoon.git
cd automatic-bassoon
```

### 2. Install Dependencies

> Note: Must use `--legacy-peer-deps` due to `@react-three/fiber` peer dependency compatibility with React 19 defaults.

```bash
npm install --legacy-peer-deps
```

### 3. Start Development Server

```bash
npm run dev
```

Open browser at `http://localhost:5173`.

### 4. Production Build

```bash
npm run build
npm run preview
```

---

## Deploy to Vercel

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "chore: ready for deployment"
   git push origin main
   ```
2. Go to `vercel.com/new` and import the repository.
3. Configure build settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`
4. Click **Deploy**.

---

## Project Structure

```
automatic-bassoon/
├── src/
│   ├── App.tsx                         # Root state manager & responsive layout
│   ├── components/
│   │   ├── Canvas2D/
│   │   │   ├── LiveryCanvas.tsx        # 2D decal canvas & UV print trigger
│   │   │   └── Toolbar2D.tsx           # Paint, Decals, Tuning & Unlayer Editor
│   │   ├── Three3D/
│   │   │   ├── GarageScene.tsx         # R3F Canvas, 3D environments, lightning FX
│   │   │   └── Vehicle3D.tsx           # 3D car mesh, materials, exhaust flames
│   │   └── UI/
│   │       ├── Header.tsx              # Vehicle selector, audio mute, view mode
│   │       ├── ExportModal.tsx         # Ready to Print UV & 3D render export
│   │       ├── PresetModal.tsx         # Preset livery loader
│   │       └── ViceRadio.tsx           # Synthwave radio player component
│   ├── utils/
│   │   ├── decalLibrary.ts             # Decals library definitions
│   │   ├── audioEngine.ts              # Web Audio synthesizer & mute state
│   │   ├── useDragScroll.ts            # Mouse drag-to-scroll utility hook
│   │   └── presetLiveries.ts           # Pre-built vehicle liveries
│   └── types/
│       └── index.ts                    # TypeScript types for LiveryState
├── vercel.json                         # Vercel SPA routing configuration
└── README.md
```

---

## How to Use

1. **Select Vehicle** — Choose Infernus, Banshee, Dominator, or Dirtbike in the header bar or mobile dropdown.
2. **Apply Base Paint & Finishes** — Select primary color, secondary accent coat, and finish materials (Gloss, Matte, Chameleon, Carbon Fiber).
3. **Add Decals** — Choose decals from the library, drag to position, scale, and rotate on the 2D canvas.
4. **Use Unlayer Image Editor** — Switch to the Unlayer Editor tab in the 2D suite to draw, apply filters, or add custom graphics, then save to composite onto the car.
5. **Switch 3D Scene Environments** — Toggle between Studio, Rain & Thunderstorm, Synthwave Sunset, and Cyberpunk Night right from the 3D HUD.
6. **Rev Engine & Radio** — Click REV for engine sounds and exhaust flames, or switch Vice Radio stations. Use the header volume icon to mute/unmute all audio.
7. **Export & Print** — Click "READY TO PRINT" or "EXPORT" to download high-resolution 1024x1024 UV textures, 3D renders, and JSON preset backups.

---

## License

MIT License.

---

*Submitted to the Build with React Image Editor Challenge by Unlayer.*