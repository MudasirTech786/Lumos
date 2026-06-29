"use client";

/**
 * LoadingLogo.jsx
 *
 * Renders the LUMOS logo PNG exactly as-is — completely static image.
 * Overlays a <canvas> precisely over the "O" ring artwork.
 *
 * Instead of hardcoded geometry, the component automatically detects
 * the "O" ring position by scanning the loaded PNG pixels once at
 * mount time. This makes it robust against minor logo updates.
 *
 * The canvas paints ONLY light effects using "screen" blend mode.
 * The ring colours are never changed. No geometry rotates. Ever.
 *
 * Three layered effects:
 *
 *  1. BREATHING GLOW  — a soft multi-layer radial bloom that pulses
 *     gently in and out on a 3 s sine curve. Tinted with the ring's
 *     own spectrum. Never bright enough to wash out the artwork.
 *
 *  2. TRAVELLING HIGHLIGHT — a luminous arc tip (≈30° wide) that
 *     sweeps the outer ring circumference once every ~3.5 s, like light
 *     catching a polished glass surface as it passes, then pauses
 *     briefly (~1 s) before repeating. The arc has a soft corona, a
 *     mid-ring white stripe, and a tiny bright tip with a lens-flare
 *     radial bloom. Ring colours are used to tint the highlight so it
 *     feels part of the artwork.
 *
 *  3. SPARKLES — 1–2 tiny bright points that appear at random
 *     positions on the ring radius and fade out over ~0.6–1 s.
 *     Fast appearance, slow fade. Rare enough to feel special.
 */

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

// ── Ring colour palette (sampled from the logo artwork) ─────────────────────
const PALETTE = [
  "#60a5fa",   //  0° – blue
  "#a78bfa",   // 60° – violet
  "#f472b6",   // 120° – pink
  "#f87171",   // 180° – red
  "#fbbf24",   // 240° – amber
  "#4ade80",   // 300° – green
];

function ringColor(angleDeg) {
  const idx = Math.floor(((angleDeg % 360 + 360) % 360 / 360) * PALETTE.length);
  return PALETTE[idx % PALETTE.length];
}

// ── Sparkle factory ──────────────────────────────────────────────────────────
function newSparkle(Ro, Ri) {
  const angle  = Math.random() * Math.PI * 2;
  const onOuter = Math.random() > 0.4;
  const radius = onOuter
    ? Ro * (0.88 + Math.random() * 0.22)
    : Ri + (Ro - Ri) * Math.random();
  return {
    angle,
    radius,
    size:     1.0 + Math.random() * 1.6,
    duration: 0.50 + Math.random() * 0.50,
    color:    ringColor((angle * 180) / Math.PI),
    born:     performance.now(),
  };
}

// ── Auto-detect ring geometry from the logo image ──────────────────────────
/*
  Scans the loaded PNG pixel by pixel to find the colourful ring artwork.

  Strategy:
    - Skip transparent and near-white background pixels.
    - Skip near-black text pixels.
    - The remaining coloured pixels belong to the ring.
    - Compute their centre of mass and distance distribution to get
      inner radius (~20th percentile) and outer radius (~80th percentile).

  Returns null if detection fails (caller falls back to defaults).
*/
function analyzeLogo(image) {
  const w = image.naturalWidth  || image.width;
  const h = image.naturalHeight || image.height;
  if (!w || !h) return null;

  const cvs = document.createElement("canvas");
  cvs.width  = w;
  cvs.height = h;
  const ctx = cvs.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const points = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent
      if (a < 200) continue;

      // Skip near-white (background)
      if (r > 220 && g > 220 && b > 220) continue;

      // Skip near-black (text)
      if (r < 50 && g < 50 && b < 50) continue;

      points.push({ x, y });
    }
  }

  if (points.length < 10) return null;

  // Centre of mass
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

  // Distance from centre for each pixel
  const dists = points.map((p) => Math.hypot(p.x - cx, p.y - cy));
  dists.sort((a, b) => a - b);

  const innerR = dists[Math.floor(dists.length * 0.20)];
  const outerR = dists[Math.floor(dists.length * 0.85)];

  // Guard against degenerate results
  if (innerR < 2 || outerR < innerR + 2) return null;

  return {
    cxRatio: cx / w,
    cyRatio: cy / h,
    roRatio: outerR / w,
    riRatio: innerR / w,
  };
}

// ── Default geometry (used as fallback if image analysis fails) ────────────
const FALLBACK_GEO = {
  cxRatio: 0.641,
  cyRatio: 0.395,
  roRatio: 0.150,
  riRatio: 0.100,
};

// ── Frame painter ─────────────────────────────────────────────────────────────
function paint(ctx, W, H, elapsed, sparkles, reduced, geo) {
  ctx.clearRect(0, 0, W, H);

  const cx = W * geo.cxRatio;
  const cy = H * geo.cyRatio;
  const Ro = W * geo.roRatio;
  const Ri = W * geo.riRatio;
  const Rm = (Ro + Ri) / 2;
  const Rb = Ro - Ri;

  // ── 1. BREATHING GLOW ──────────────────────────────────────────────────
  const BREATH_PERIOD = 3000;
  const breathPhase   = (Math.sin((elapsed / BREATH_PERIOD) * Math.PI * 2) + 1) / 2;
  const baseGlow      = 0.05 + breathPhase * 0.10;

  const bloom = ctx.createRadialGradient(cx, cy, Ri * 0.5, cx, cy, Ro * 1.6);
  bloom.addColorStop(0,    `rgba(255,255,255,0)`);
  bloom.addColorStop(0.35, `rgba(140,90,220,${(baseGlow * 0.45).toFixed(3)})`);
  bloom.addColorStop(0.60, `rgba(80,180,240,${(baseGlow * 0.80).toFixed(3)})`);
  bloom.addColorStop(0.80, `rgba(50,170,80,${(baseGlow * 0.55).toFixed(3)})`);
  bloom.addColorStop(1,    `rgba(255,255,255,0)`);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Thin glow ring — 72 tinted arc segments
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const SEGS  = 72;
  const ringA = (baseGlow * 3.5);
  for (let i = 0; i < SEGS; i++) {
    const a0  = (i / SEGS) * Math.PI * 2;
    const a1  = ((i + 1.6) / SEGS) * Math.PI * 2;
    const mid = (a0 + a1) / 2;
    const col = ringColor((mid * 180) / Math.PI);
    ctx.beginPath();
    ctx.arc(cx, cy, Rm, a0, a1);
    ctx.strokeStyle = col;
    ctx.lineWidth   = Rb * 0.65;
    ctx.globalAlpha = ringA;
    ctx.stroke();
  }
  ctx.restore();

  if (reduced) return;

  // ── 2. TRAVELLING HIGHLIGHT ─────────────────────────────────────────────
  const SWEEP_MS = 3500;
  const HOLD_MS  = 1000;
  const CYCLE_MS = SWEEP_MS + HOLD_MS;
  const cycleT   = (elapsed % CYCLE_MS) / CYCLE_MS;
  const sweepT   = Math.min(cycleT * (CYCLE_MS / SWEEP_MS), 1);
  const sa       = sweepT * Math.PI * 2;
  const AH       = (28 * Math.PI) / 180;
  const hlDeg    = ((sa * 180) / Math.PI) % 360;
  const hlCol    = ringColor(hlDeg);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.arc(cx, cy, Ro * 1.07, sa - AH, sa + AH);
  ctx.strokeStyle = hlCol;
  ctx.lineWidth   = Rb * 2.2;
  ctx.globalAlpha = 0.15 + breathPhase * 0.10;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, Rm, sa - AH * 0.55, sa + AH * 0.55);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth   = Rb * 0.4;
  ctx.globalAlpha = 0.08 + breathPhase * 0.06;
  ctx.stroke();

  const TIP = AH * 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy, Rm, sa - TIP, sa + TIP);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth   = Rb * 0.2;
  ctx.globalAlpha = 0.45 + breathPhase * 0.12;
  ctx.stroke();

  ctx.restore();

  // Lens-flare radial bloom at the tip
  const tx   = cx + Math.cos(sa) * Rm;
  const ty   = cy + Math.sin(sa) * Rm;
  const fr   = Ro * 0.30;
  const flare = ctx.createRadialGradient(tx, ty, 0, tx, ty, fr);
  flare.addColorStop(0,    `rgba(255,255,255,${(0.12 + breathPhase * 0.08).toFixed(2)})`);
  flare.addColorStop(0.35, `rgba(255,255,255,0.04)`);
  flare.addColorStop(1,    `rgba(255,255,255,0)`);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.beginPath();
  ctx.arc(tx, ty, fr, 0, Math.PI * 2);
  ctx.fillStyle   = flare;
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.restore();

  // ── 3. SPARKLES ─────────────────────────────────────────────────────────
  const now = performance.now();
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (const sp of sparkles) {
    const age  = (now - sp.born) / 1000;
    const t01  = Math.min(age / sp.duration, 1);
    const alpha = t01 < 0.20
      ? t01 / 0.20
      : 1 - ((t01 - 0.20) / 0.80);
    if (alpha <= 0.01) continue;

    const sx = cx + Math.cos(sp.angle) * sp.radius;
    const sy = cy + Math.sin(sp.angle) * sp.radius;
    const sz = sp.size * (0.8 + alpha * 0.4);

    ctx.beginPath();
    ctx.arc(sx, sy, sz, 0, Math.PI * 2);
    ctx.fillStyle   = "#ffffff";
    ctx.globalAlpha = alpha * 0.92;
    ctx.fill();

    const hr   = sz * 4;
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, hr);
    halo.addColorStop(0,    `rgba(255,255,255,${(alpha * 0.55).toFixed(2)})`);
    halo.addColorStop(0.45, `${sp.color}${Math.round(alpha * 50).toString(16).padStart(2, "0")}`);
    halo.addColorStop(1,    "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(sx, sy, hr, 0, Math.PI * 2);
    ctx.fillStyle   = halo;
    ctx.globalAlpha = 1;
    ctx.fill();
  }

  ctx.restore();
}

// ── Component ────────────────────────────────────────────────────────────────
export default function LoadingLogo() {
  const containerRef  = useRef(null);
  const canvasRef     = useRef(null);
  const rafRef        = useRef(null);
  const sparkles      = useRef([]);
  const lastSpawn     = useRef(0);
  const reduced       = useReducedMotion();
  const geoRef        = useRef(FALLBACK_GEO);

  // ── Analyse the logo once to discover the "O" ring geometry ─────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const detected = analyzeLogo(img);
      if (detected) geoRef.current = detected;
    };
    img.src = "/images/loading.png";
  }, []);

  // ── Animation loop ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let startTs = null;

    function syncSize() {
      canvas.width  = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);
    syncSize();

    function frame(ts) {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;

      const nowMs = performance.now();
      if (!reduced && nowMs - lastSpawn.current > 1200 + Math.random() * 900) {
        const W  = canvas.width;
        const Ro = W * geoRef.current.roRatio;
        const Ri = W * geoRef.current.riRatio;
        sparkles.current.push(newSparkle(Ro, Ri));
        lastSpawn.current = nowMs;

        if (Math.random() > 0.60) {
          const delay = 120 + Math.random() * 140;
          setTimeout(() => {
            sparkles.current.push(
              newSparkle(canvas.width * geoRef.current.roRatio, canvas.width * geoRef.current.riRatio)
            );
          }, delay);
        }
      }

      sparkles.current = sparkles.current.filter(
        (sp) => (performance.now() - sp.born) / 1000 < sp.duration
      );

      const ctx = canvas.getContext("2d");
      paint(ctx, canvas.width, canvas.height, elapsed, sparkles.current, !!reduced, geoRef.current);

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [reduced]);

  return (
    <motion.div
      ref={containerRef}
      className="relative select-none"
      style={{ width: 612, maxWidth: "90vw" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Static logo — never touched */}
      <img
        src="/images/loading.png"
        alt="LUMOS Rentals"
        draggable={false}
        style={{ width: "100%", display: "block", userSelect: "none" }}
      />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         0,
          width:         "100%",
          height:        "100%",
          pointerEvents: "none",
          mixBlendMode:  "screen",
        }}
      />
    </motion.div>
  );
}
