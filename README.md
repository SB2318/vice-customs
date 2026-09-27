# Vice Customs - Vehicle Heist: Edit. Escape. Survive.

> Built for the #BuiltWithImageEditor Challenge by Unlayer

**Live Demo**: [https://vice-customs.vercel.app](https://vice-customs.vercel.app)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?logo=vercel&logoColor=white)](https://vice-customs.vercel.app)

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)](https://threejs.org)
[![Unlayer React Image Editor](https://img.shields.io/badge/Unlayer-React%20Image%20Editor-ff6b35)](https://github.com/unlayer/react-image-editor)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## Overview: Dual-Mode Architecture

**Vice Customs: Vehicle Heist** is a dual-mode web application combining a GTA VI-inspired **3D/2D Car Customization Studio** with an interactive narrative crime game called **VEHICLE HEIST — Edit. Escape. Survive.**

Users can freely toggle between two primary experiences:

1. **VICE CUSTOMS (Garage Studio)**: Full-featured freeplay 3D car customization studio with WebGL rendering, paint finishes, decals, dynamic environments, procedural V8 engine sounds, and live 2D UV texture mapping powered by `@unlayer/react-image-editor`.
2. **VEHICLE HEIST (The Forger)**: Interactive heist game where players choose a getaway vehicle path, inspect surveillance evidence, doctor photos using **THE FORGER** (powered by `@unlayer/react-image-editor`), customize 3D getaway rides in the **3D Garage Customizer**, and evade police in live 3D pursuits.

---

## Core Feature: Edit the Evidence to Change the Story

In **THE FORGER**, image editing directly drives the game's narrative:

1. **Receive Evidence**: Intercept surveillance camera photographs and detective dossiers.
2. **Edit Evidence**: Alter evidence photos in the Unlayer image editor (repainting car colors, obscuring license plates, modifying train destination boards from Downtown to Harbor, removing boat markings, or altering helicopter callsigns).
3. **Forgery Validation**: The system analyzes edited image pixels against mission objectives.
4. **Narrative Consequence**: The subsequent story cutscene dynamically displays the player's edited image. Detectives chase forged leads, allowing the getaway.

```
ORIGINAL EVIDENCE           IMAGE EDITOR           STORY CONSEQUENCE
Red sports car        ->   Unlayer Editor   ->   Black sports car displayed
Plate: VC-4821             Respray & Edit        Detectives lose trace
Front bumper damage        Save Forgery          Mission Complete + $5,000
```

---

## 5 Getaway Vehicle Story Paths & Vehicle Models

| Vehicle Path | Mission | Image-Editing Challenge | 3D Vehicle Models |
|---|---|---|---|
| **Car** | Lose the Cameras | Respray paint color, obscure license plate VC-4821, fix bumper damage | **Infernus**, **Cheetah**, **Banshee**, **Comet**, **Dominator** |
| **Motorbike** | Ghost Rider | Alter helmet art, obscure rider jacket logo, remove bike decals | **Street Demon DirtBike** |
| **Train** | Hijack Express | Modify destination board text from Downtown to Harbor, obscure transit logo | **Bullet Train Locomotive** |
| **Speedboat** | Midnight Run | Change hull color, overwrite vessel name Ocean Breeze, remove red markings | **Midnight Powerboat** |
| **Helicopter** | Sky Escape | Modify registration callsign on tail fin, disguise searchlight lens | **Stealth Helo** |

---

## 3D Garage Customizer (Draggable, Fullscreen, Collapsible)

The **3D Garage Customizer** embedded inside the 3D Forgery Editor provides high-end 2D/3D studio controls:

- **Split / 2D / 3D View Modes**: Switch seamlessly between 2D canvas, 3D WebGL viewport, or side-by-side Split view.
- **Draggable Splitter**: Drag the split barrier between the 2D UV texture canvas and the 3D WebGL viewport to adjust layout proportions.
- **Fullscreen & Collapsible Controls**: Expand the 3D Customizer to full screen (`⊕` / `⊖`) or collapse/expand the panel (`▲` / `▼`).
- **Vehicle-Specific Controls**: Car missions feature quick selectors for Infernus, Cheetah, Banshee, Comet, and Dominator, while Bike, Train, Boat, and Helicopter missions display their specific models.



https://github.com/user-attachments/assets/3d24124f-e536-4f7b-9324-6d0480aeb77e

(Sorry, There was memory issue on my computer, You can try on your own).




---

## Full Export Studio (2D, 3D & JSON Configs)

The **Full Export Studio** modal allows users to export and import design assets across all modes:

- **2D UV Texture Export**: Download 1024x1024 unwrapped PNG texture maps.
- **3D Studio Render Export**: Download full-resolution WebGL studio snapshots.
- **JSON Import & Export**: Export livery configurations as `.json` files or upload existing JSON presets to apply across vehicles.

---

## Mobile-Friendly & Responsive Architecture

- **100dvh Dynamic Viewport**: Container layout uses Dynamic Viewport Height to eliminate address bar jump and unwanted scrolling on iOS Safari and Android Chrome.
- **Touch-Friendly Controls**: Touch drag-to-scroll container bars, tap target sizes adhering to mobile usability standards, and pinch gestures.
- **Responsive Mobile Navigation**: Dedicated mobile navigation bar and collapsible objective drawer for small viewports (< 1024px).
- **Non-Overlapping HUD Overlay**: Adaptive flex layouts ensure headers, wanted stars, and control floating bars never collide on small screens.

---

## Challenge Requirements Met

| Requirement | Status |
|---|---|
| GTA VI-inspired experience | Complete - Neon city aesthetics, heist storyline, wanted levels, 3D vehicles, synthwave radio |
| React Image Editor as a core part | Complete - Unlayer React Image Editor powers THE FORGER evidence editing engine and 2D texture studio |
| Users can edit / customize visual assets | Complete - Evidence photos and 3D vehicle livery skins are dynamically generated and edited |
| Mobile Friendly | Complete - Fully responsive across mobile, tablet, and desktop viewports |
| Public GitHub repository | Complete - Source code hosted in this repository |
| Deployed project | Complete - Production build deployed |

---

## Key Integrations and Features

### Embedded Unlayer Image Editor Integration (THE FORGER & 2D Studio)
- Seamless Suite Embedding: Native tab embedding in Garage Studio and full-screen evidence forgery suite in Vehicle Heist.
- Full-Screen Toggle: One-click expand button for uninterrupted editing.
- Dynamic Cutscene Integration: Canvas exports render directly in subsequent story cards and map onto 3D meshes.
- Fault-Tolerant Error Boundary: Unlayer Image Editor is wrapped in a React Error Boundary (`UnlayerErrorBoundary`) with an integrated fallback panel to guarantee non-blocking workflow and submission resilience under restrictive network environments.
- Toolset: Filters, stickers, text annotations, shape tools, cropping, and freehand drawing.

### 3D Environments & Sound Studio
- Interactive 3D Pursuits: Real-time R3F 3D evasion game engine per vehicle type with dynamic HP damage scaling, power-ups, nitro boost, and win-condition escape distance thresholds.
- Environments: Studio, Rain & Thunderstorm (with lightning flashes), Synthwave Sunset, and Cyberpunk Night.
- Audio Synthesis: Procedural V8 engine rumble, blow-off valve hiss, exhaust pops, and 4 synthwave radio channels (Flash FM, Wave 103, V-Rock, Wildstyle).

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| 3D Renderer | Three.js + @react-three/fiber v8 + @react-three/drei |
| Image Editor | **@unlayer/react-image-editor** |
| Audio | Web Audio API (procedural synthesis) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Run Locally

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

```bash
node -v   # should be v18+
npm -v    # should be v9+
```

### 1. Clone the Repository

```bash
git clone https://github.com/SB2318/vice-customs.git
cd vice-customs
```

### 2. Install Dependencies

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

1. Push code to GitHub.
2. Go to vercel.com/new and import the repository.
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`
4. Click Deploy.

---

## Project Structure

```
vice-customs/
├── src/
│   ├── App.tsx                         # Root state manager & mode switch (Vice Customs / Heist)
│   ├── components/
│   │   ├── Canvas2D/
│   │   │   ├── LiveryCanvas.tsx        # 2D decal canvas & UV print trigger
│   │   │   └── Toolbar2D.tsx           # Paint, Decals & Unlayer Image Editor
│   │   ├── Three3D/
│   │   │   ├── GarageScene.tsx         # R3F Canvas, 3D environments, lightning FX
│   │   │   └── Vehicle3D.tsx           # 3D car mesh, materials, exhaust flames
│   │   └── UI/
│   │       ├── Header.tsx              # Mode selector, audio mute, vehicle selection
│   │       ├── HeistMissionHub.tsx     # Vehicle heist dossier & getaway selection
│   │       ├── EvidenceEditorModal.tsx # Embedded Unlayer evidence forgery & 3D Garage customizer
│   │       ├── OnboardingTourModal.tsx # 5-step onboarding tour 
│   │       ├── StoryConsequenceModal.tsx # Dynamic narrative loop cutscenes
│   │       ├── ExportModal.tsx         # Ready to Print UV, 3D render & JSON config export
│   │       ├── ViceOutrunGameModal.tsx # Heist evasion game mode & wanted level engine
│   │       └── ViceRadio.tsx           # Synthwave radio player component
│   ├── utils/
│   │   ├── heistMissions.ts            # 5 Getaway vehicle heist mission definitions
│   │   ├── evidenceValidator.ts        # Evidence forgery pixel validation engine
│   │   ├── decalLibrary.ts             # Decal library definitions
│   │   ├── audioEngine.ts              # Web Audio synthesizer & mute state
│   │   └── presetLiveries.ts           # Pre-built vehicle liveries
│   └── types/
│       └── index.ts                    # TypeScript definitions
├── README.md
└── vercel.json
```

---

## How to Play

### Mode 1: VICE CUSTOMS (Garage Studio)
1. Select **Garage Studio** in the top navigation bar.
2. Select vehicle model, base paint, finishes, decals, and custom license plate.
3. Switch to the Unlayer Editor tab to design custom graphics composite wraps.
4. Toggle 3D environments (Studio, Rain, Synthwave, Cyberpunk) and export print-ready 1024x1024 UV maps or JSON presets.

### Mode 2: VEHICLE HEIST (The Forger)
1. Select **Vehicle Heist** in the top navigation bar.
2. Choose your getaway vehicle (Car, Motorbike, Train, Speedboat, Helicopter).
3. Inspect intercepted surveillance evidence photos.
4. Forge the evidence in **Unlayer Image Editor** (respray colors, obscure plates, alter train destination text).
5. Switch to **3D Garage Customizer** to adjust vehicle specs in 3D (with draggable split, view modes, and fullscreen).
6. Submit forgery and watch the story outcome unfold dynamically based on your edited image.

---

## License

MIT License.

---

*Submitted to the Build with React Image Editor Challenge by Unlayer.*
