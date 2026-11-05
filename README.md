# Priyanka M — Product Design Portfolio

A single-page portfolio presented as a virtual museum. The desktop walkthrough introduces Priyanka's practice and experience before leading into three product exhibits. Each exhibit includes its design process, an orbitable 3D model, and a project PDF link. A scrollable portfolio fallback keeps every section accessible on mobile.

`src/ProductGeometry.jsx` contains the shared models used in both the museum and project previews: Swara's low wooden note drum with segmented color tiles and pull mallet, Cozy Grow's padded cradle/high-chair with its lavender support frame and tray, and Kosha's contoured upholstered recliner with sculpted walnut side frames and pivots.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Verify a production build with:

```bash
npm run build
npm run preview
```

## Portfolio assets

The project PDFs and portrait are served from `public/`:

- `SWARA.pdf`
- `COZY GROW.pdf`
- `KOSHA.pdf`
- `Priyanka_Picture.jpg`

The portfolio uses React Three Fiber and Three.js for the museum and interactive product previews, GSAP ScrollTrigger for scroll-driven camera waypoints, and CSS for the responsive layout and accessible project dialogs.

On desktop, scroll or use the navigation and exhibit arrows to move through the museum. Project previews support pointer drag, zoom, keyboard arrows, and on-screen view controls. On mobile, scroll through the portfolio cards and open each exhibit for its details.
