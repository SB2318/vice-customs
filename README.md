# 🌴 Vice Customs: 2D Decal & Livery Designer

> **In-Game Vibe:** Next-gen vehicle customization in Vice City garages (Los Santos Customs / Vice Customs).

**Vice Customs** is an interactive car paint & decal wrapping studio where players design custom liveries for iconic Vice City vehicles (*Vice Infernus*, *Banshee GTS*, *Dominator Muscle*, *Street Demon Dirtbike*) in a 2D canvas editor and **Unlayer React Image Editor**, rendered live onto interactive 3D car models inside a neon-lit Vice City garage with 3D rain FX, exhaust flames, engine rev sounds, and synthwave radio!

---

## 🚀 Beginner Guide (What Can You Do as a Noob User?)

Welcome to Vice Customs! If you are new, here is a simple 5-minute walkthrough of everything you can do:

### 1. Choose Your Car Model
- At the top bar, click between **INFERNUS**, **BANSHEE**, **DOMINATOR**, or **DIRTBIKE**. Watch the 3D car model instantly swap inside the neon garage!

### 2. Paint & Finish Your Ride
- Go to the **Paint & Finish** tab on the control panel:
  - **Primary Body Coat**: Pick any retro color (Hot Pink, Neon Cyan, Cyber Yellow, Midnight Black, etc.).
  - **Dual-Tone Secondary**: Color the hood wedge and side sill accents.
  - **Finish Material**: Switch between **Gloss**, **Matte**, **Metallic**, **Pearlescent**, **Chameleon Iridescent**, **Carbon Fiber**, or **Rust Patina**!

### 3. Add Decals, Flames, Stripes & Stencils
- Click the **Decals Studio** tab:
  - 🏁 **Racing Stripes**: Dual GT center stripes, offset rally stripes, checkered banners.
  - 🔥 **Flames**: Retro 80s hot-rod flames, cyber neon wings, Vice sunset palms.
  - 🎨 **Spray Stencils**: Aerosol palms, bold racing number #88, pirate skull & wrenches.
  - ⚡ **Sponsor Logos**: Pegassi, Grotti, Sprunk, eCola, Atomic Radial Tires.
  - 💥 **Damage**: Bullet hole clusters and scratch marks.
- Click any decal to place it on your vehicle. Drag it around the canvas, scale it, or rotate it using the control handles!

### 4. Custom License Plates & Typography
- Go to **Text & Plates**:
  - Type your custom text (e.g., `"VICE CITY"`, `"GT-88"`) and choose fonts like *Orbitron*, *Impact*, *Marker*, or *8-Bit Arcade*.
  - Create a custom **License Plate** ("VC 1986", "V8 BEAST") with Vice Sunset Pink, Blue/Yellow, or Outlaw Black & Gold designs.

### 5. Launch Unlayer React Image Editor (`@unlayer/react-image-editor`)
- Click the **🖌️ UNLAYER EDITOR** button in the header top bar!
- Use Unlayer's image editor tools to crop, adjust filters, annotate, add shapes, draw freehand artwork, or add stickers.
- Click **Save** inside Unlayer to apply your custom artwork directly onto your 3D vehicle texture!

### 6. Interactive 3D Garage Controls, Exhaust Flames & Audio
- **Rev Engine Button**: Click **REV ENGINE!** to trigger 3D exhaust flames, V8 rumble, high-RPM screaming, turbo blow-off valve hiss, and backfire pops!
- **Rainy Vice City Atmosphere**: Go to **Tuning & Rain** and toggle **RAIN ON 🌧️** to experience 3D rain drops, wet floor puddle reflections, and storm lighting!
- **Wheel Tuning & Window Tint**: Customize metallic rim colors and window tint film!
- **Neon Underglow**: Click the **⚡** button to toggle glowing cyan/pink underglow light bars.
- **Camera Views**: Switch camera angles between **3/4 Front**, **Side**, **Rear**, or click **Spin 🔄** for a 360° turntable view!
- **Vice Radio**: Click station buttons at the bottom (**FLASH FM**, **WAVE 103**, **V-ROCK**, **WILDSTYLE**) to play synthesized retro synthwave tracks while customizing!

### 7. Export & Save Your Designs
- Click **PRESETS** to load iconic ready-made liveries.
- Click **EXPORT** to download your 2D UV texture PNG, capture a 3D studio screenshot PNG, or save your setup to browser `LocalStorage`.

---

## 🌐 Vercel Deployment Guide

Deploying **Vice Customs** to Vercel takes under 2 minutes:

### Method A: Deploy via GitHub (Recommended)
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy Vice Customs to Vercel"
   git push origin main
   ```
2. Go to **[Vercel Dashboard](https://vercel.com/new)** and click **Add New Project**.
3. Import your GitHub repository (`automatic-bassoon` or custom name).
4. Configure Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
5. Click **Deploy**. Your live Vice Customs URL will be ready!

### Method B: Deploy via Vercel CLI
Run the following commands in your terminal:
```bash
# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. Deploy to Vercel
vercel --prod
```

---

## 🛠️ Instructions: How to Run Locally

### Prerequisites
Make sure you have **Node.js** (v18 or higher) installed:
```bash
node -v
npm -v
```

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at: **`http://localhost:3000`**

### 3. Production Build
```bash
npm run build
npm run preview
```