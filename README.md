# 🌴 Vice Customs — GTA VI-Inspired Car Livery Studio

> **Built for the [#BuiltWithImageEditor](https://www.linkedin.com/search/results/all/?keywords=%23builtwithimageeditor) Challenge by Unlayer** · Submission deadline: September 24, 2026

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)](https://threejs.org)
[![Unlayer React Image Editor](https://img.shields.io/badge/Unlayer-React%20Image%20Editor-ff6b35)](https://github.com/unlayer/react-image-editor)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 🎮 What is Vice Customs?

**Vice Customs** is a full-featured, GTA VI-inspired **car livery & decal customization studio** — think *Los Santos Customs* meets *Vice City* neon fever dream, running entirely in your browser.

Players design custom vehicle paint wraps on a 2D canvas editor (powered by **Unlayer React Image Editor**), and see their creation **mapped in real-time onto a 3D car model** inside a neon-soaked, rain-drenched synthwave garage. Add decals, rev the engine, trigger exhaust flames, crank up the Vice Radio, and export a studio-quality PNG — all without leaving the browser.

---

## 🏆 Challenge Requirements Met

| Requirement | Status |
|---|---|
| GTA VI-inspired experience | ✅ Vice City neon garage, car customization, synthwave radio |
| React Image Editor as a core part | ✅ `@unlayer/react-image-editor` — full image editing modal for custom livery artwork |
| Users can edit / customize at least one visual | ✅ Full 2D texture canvas + Unlayer editor → live 3D car skin |
| Public GitHub repository | ✅ This repo |
| Deployed project | ✅ See **Live Demo** link below |

---

## ✨ Features

### 🎨 2D Livery Canvas (Core Customization)
- **Paint & Finish** — Primary body color, dual-tone secondary coat, finish materials: Gloss, Matte, Metallic, Pearlescent, Chameleon Iridescent, Carbon Fiber, Rust Patina
- **Decals Studio** — Racing stripes, retro hot-rod flames, cyberpunk neon wings, spray stencils, GTA-style sponsor logos (Pegassi, Grotti, Sprunk, eCola), bullet holes & scratch damage marks
- **Text & License Plates** — Custom typography (Orbitron, Impact, 8-Bit Arcade), Vice City license plate designer (Sunset Pink, Blue/Yellow, Outlaw Black & Gold)
- **1-Click Mirror** — Mirror any decal to the opposite side of the vehicle instantly

### 🖌️ Unlayer React Image Editor Integration
- Launched via the **🖌️ UNLAYER EDITOR** button in the header
- Full image editing suite: crop, filters, adjustments, shapes, freehand draw, stickers, annotations
- **Save inside Unlayer** → artwork is applied directly onto the live 3D vehicle texture in real time

### 🚗 Live 3D Garage Renderer (Three.js / React Three Fiber)
- **4 vehicle models**: Vice Infernus, Banshee GTS, Dominator Muscle, Street Demon Dirtbike
- Real-time `CanvasTexture` pipeline — every 2D paint stroke updates the 3D skin instantly
- **Camera presets**: 3/4 Front, Side Profile, Rear Bumper, Cinematic, 360° Turntable spin
- **Neon Underglow** — animated cyan/pink pulsing light bars
- **3D Exhaust Flames** — cone mesh + dynamic point lights burst from exhaust pipes on rev
- **Rainy Vice City Mode** — GPU particle rain system, wet reflective floor, storm atmosphere

### 🎵 Web Audio Synthwave Engine
- Procedurally synthesized engine rev, turbo whine, blow-off valve hiss, backfire pops
- 4 Vice Radio stations: **FLASH FM**, **WAVE 103**, **V-ROCK**, **WILDSTYLE** — generative retro synthwave music
- Click SFX on every UI interaction

### 🏎️ Tuning Suite
- **Rim Color Picker** — Full hex color custom metallic rims
- **Window Tint Film** — Clear, Dark Limo, Pink Neon, Cyan Neon
- **Spoiler & Body Kit** styles

### 📤 Export Studio
- **2D UV Texture PNG** — 1024×1024 high-res unwrapped livery texture
- **3D Studio Screenshot PNG** — Full-res WebGL canvas snapshot of the garage viewport
- **Save to Garage** — Persist livery configurations to browser `localStorage`
- **Load Presets** — Iconic ready-made liveries: Neon Strike, Retro Sunset, Carbon Ghost, Cyber Drift

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + custom Vice City neon theme |
| 3D Renderer | Three.js + `@react-three/fiber` v8 + `@react-three/drei` |
| Image Editor | **`@unlayer/react-image-editor`** |
| Audio | Web Audio API (procedural synthesis) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 🚀 Run Locally

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

> ⚠️ **Must use `--legacy-peer-deps`** — `@react-three/fiber` has a peer dependency conflict with React 19 (npm's default). This flag resolves it without downgrading.

```bash
npm install --legacy-peer-deps
```

### 3. Start the Development Server

```bash
npm run dev
```

Open your browser at **`http://localhost:5173`** (or the port Vite prints in the terminal).

### 4. Production Build (Optional)

```bash
npm run build
npm run preview
```

---

## 🌐 Deploy to Vercel

### Method A — Deploy via GitHub (Recommended, ~2 minutes)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "chore: ready for Vercel deploy"
   git push origin main
   ```
2. Go to **[vercel.com/new](https://vercel.com/new)** → **Import** your GitHub repo.
3. Configure build settings:
   | Setting | Value |
   |---|---|
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install --legacy-peer-deps` |
4. Click **Deploy** — your live URL is ready in ~60 seconds!

### Method B — Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

> The included `vercel.json` already handles SPA client-side routing rewrites — no extra config needed.

---

## 🗂️ Project Structure

```
automatic-bassoon/
├── src/
│   ├── App.tsx                         # Root state manager & layout
│   ├── components/
│   │   ├── Canvas2D/
│   │   │   ├── LiveryCanvas.tsx        # 2D decal canvas renderer
│   │   │   ├── Toolbar2D.tsx           # Paint, Decals, Text, Tuning tabs
│   │   │   └── UnlayerEditorModal.tsx  # @unlayer/react-image-editor wrapper
│   │   ├── Three3D/
│   │   │   ├── GarageScene.tsx         # R3F Canvas, rain FX, lighting
│   │   │   └── Vehicle3D.tsx           # 3D car mesh, texture, flames, rims
│   │   └── UI/
│   │       ├── Header.tsx              # Vehicle selector, action buttons
│   │       ├── ExportModal.tsx         # Download 2D/3D + save to garage
│   │       └── PresetModal.tsx         # Preset livery loader
│   ├── utils/
│   │   ├── decalLibrary.ts             # SVG decal path library
│   │   ├── audioEngine.ts              # Web Audio synthesizer + radio
│   │   └── presetLiveries.ts           # Pre-built livery configurations
│   └── types/
│       └── index.ts                    # TypeScript types for LiveryState
├── vercel.json                         # Vercel SPA rewrite rules
└── README.md
```

---

## 🎯 How to Use (5-Minute Walkthrough)

1. **Choose your car** — Click `INFERNUS`, `BANSHEE`, `DOMINATOR`, or `DIRTBIKE` in the header. The 3D garage model swaps instantly.
2. **Paint it** — Go to **Paint & Finish** → pick body color, secondary coat, and finish material.
3. **Add decals** — Go to **Decals Studio** → click any decal to place it. Drag, scale, and rotate it on the canvas.
4. **Open Unlayer Editor** — Click **🖌️ UNLAYER EDITOR** in the header → design custom artwork → click Save to apply it to the car.
5. **Rev the engine** — Click **REV ENGINE!** to trigger exhaust flames, V8 roar, and turbo sounds.
6. **Enable rain** — Go to **Tuning & Rain** → toggle **RAIN ON 🌧️** for a stormy Vice City atmosphere.
7. **Spin & shoot** — Click **🔄 Spin** to rotate the car 360°, or switch camera presets.
8. **Export** — Click **EXPORT** → download your 2D UV texture or 3D studio screenshot.

---

## 📄 License

MIT — feel free to fork, remix, and build upon this.

---

*Submitted to the [Build with React Image Editor Challenge](https://lnkd.in/eEE_bKHc) by Unlayer · [#BuiltWithImageEditor](https://www.linkedin.com/search/results/all/?keywords=%23builtwithimageeditor)*