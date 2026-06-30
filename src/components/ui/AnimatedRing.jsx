"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * AnimatedRing.jsx
 *
 * Renders the colourful "O" as fixed SVG geometry (two static stroked
 * circles — outer ring + inner ring, exactly like the original artwork).
 * The ring shapes themselves NEVER move, rotate, or change radius.
 *
 * All motion lives in:
 *   1. A conic-style rainbow gradient whose `gradientTransform` rotation
 *      is animated — this makes the colours appear to drift slowly
 *      and continuously inside the fixed ring, like light moving
 *      through glass rather than a spinning object.
 *   2. A narrow travelling highlight — a short arc <path> with a
 *      bright stroke gradient — animated via `pathLength`/rotation
 *      using gradientTransform on its own gradient, sweeping clockwise.
 *   3. A breathing glow — opacity + filter stdDeviation pulse on a
 *      duplicate blurred copy of the rings.
 *   4. Soft internal reflection streaks that fade in/out in sync with
 *      the travelling highlight's position.
 *
 * Because rotation is applied to *gradients*, not geometry, GPU
 * compositing stays cheap (it's just a transform on a paint server)
 * and the ring silhouette is bit-for-bit identical at every frame.
 *
 * Props:
 *   cx, cy            ring centre, in local SVG units (viewBox space)
 *   rOuter, rInner    ring radii, in local SVG units
 *   strokeOuter       outer ring stroke width
 *   strokeInner       inner ring stroke width
 */
export default function AnimatedRing({
  cx,
  cy,
  rOuter,
  rInner,
  strokeOuter = 8,
  strokeInner = 7,
}) {
  const reduced = useReducedMotion();

  // ── Breathing glow timing ────────────────────────────────────────────────
  const BREATH = { duration: 3, repeat: Infinity, ease: "easeInOut" };

  // ── Colour drift timing (rainbow shifts inside the fixed ring) ──────────
  const DRIFT_OUTER = { duration: 18, repeat: Infinity, ease: "linear" };
  const DRIFT_INNER = { duration: 13, repeat: Infinity, ease: "linear" };

  // ── Travelling highlight timing ──────────────────────────────────────────
  const SWEEP = { duration: 3.4, repeat: Infinity, ease: "linear" };

  return (
    <g>
      {/* ════════════════════════════════════════════════════════════════
          DEFS — gradients used only by this ring instance
      ════════════════════════════════════════════════════════════════ */}
      <defs>
        {/* Conic-like rainbow gradient for the OUTER ring.
            Implemented as a rotating linear gradient sampled around a
            stroked circle — the standard SVG technique for a conic
            effect without native conic-gradient support. */}
        <motion.linearGradient
          id="ringOuterGrad"
          gradientUnits="userSpaceOnUse"
          x1={cx - rOuter} y1={cy}
          x2={cx + rOuter} y2={cy}
          animate={reduced ? {} : { rotate: 360 }}
          transition={reduced ? {} : DRIFT_OUTER}
          style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: "fill-box" }}
        >
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="16%"  stopColor="#8B5CF6" />
          <stop offset="32%"  stopColor="#EC4899" />
          <stop offset="48%"  stopColor="#EF4444" />
          <stop offset="64%"  stopColor="#F59E0B" />
          <stop offset="80%"  stopColor="#22C55E" />
          <stop offset="100%" stopColor="#3B82F6" />
        </motion.linearGradient>

        {/* Inner ring rainbow — drifts the opposite direction, different period */}
        <motion.linearGradient
          id="ringInnerGrad"
          gradientUnits="userSpaceOnUse"
          x1={cx - rInner} y1={cy}
          x2={cx + rInner} y2={cy}
          animate={reduced ? {} : { rotate: -360 }}
          transition={reduced ? {} : DRIFT_INNER}
          style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: "fill-box" }}
        >
          <stop offset="0%"   stopColor="#22C55E" />
          <stop offset="20%"  stopColor="#EF4444" />
          <stop offset="40%"  stopColor="#F59E0B" />
          <stop offset="60%"  stopColor="#EC4899" />
          <stop offset="80%"  stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#22C55E" />
        </motion.linearGradient>

        {/* Bright highlight gradient for the travelling beam — fades to transparent
            at both ends so it reads as a soft moving light, not a hard arc. */}
        <linearGradient id="beamGrad" gradientUnits="userSpaceOnUse"
          x1={cx} y1={cy - rOuter} x2={cx} y2={cy + rOuter}>
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Radial gradient for the breathing ambient bloom */}
        <radialGradient id="breathBloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0" />
          <stop offset="38%"  stopColor="#bcd2ff" stopOpacity="0.35" />
          <stop offset="62%"  stopColor="#c9b8ff" stopOpacity="0.30" />
          <stop offset="82%"  stopColor="#bdf0c9" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ════════════════════════════════════════════════════════════════
          1. BREATHING AMBIENT GLOW — wide, soft, pulses opacity + scale
      ════════════════════════════════════════════════════════════════ */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={rOuter * 1.55}
        fill="url(#breathBloom)"
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
        animate={
          reduced
            ? { opacity: 0.4 }
            : { opacity: [0.35, 0.65, 0.35], scale: [0.97, 1.04, 0.97] }
        }
        transition={reduced ? {} : BREATH}
      />

      {/* ════════════════════════════════════════════════════════════════
          2. FIXED RING GEOMETRY — outer + inner circles, never move
             Colours come from the rotating gradients defined above,
             so the rings *look* alive while their silhouette is static.
      ════════════════════════════════════════════════════════════════ */}
      <g filter="url(#tightGlow)">
        <circle
          cx={cx} cy={cy} r={rOuter}
          fill="none"
          stroke="url(#ringOuterGrad)"
          strokeWidth={strokeOuter}
          strokeLinecap="round"
        />
        <circle
          cx={cx} cy={cy} r={rInner}
          fill="none"
          stroke="url(#ringInnerGrad)"
          strokeWidth={strokeInner}
          strokeLinecap="round"
        />
      </g>

      {/* ════════════════════════════════════════════════════════════════
          3. TRAVELLING LIGHT BEAM — a short bright arc that sweeps
             clockwise around the ring's mid-radius. Achieved by rotating
             the *group* (cheap GPU transform) that contains a small
             fixed-position arc segment — geometry of the ring beneath
             is completely unaffected since this is a separate overlay.
      ════════════════════════════════════════════════════════════════ */}
      {!reduced && (
        <motion.g
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
          animate={{ rotate: 360 }}
          transition={SWEEP}
        >
          {/* Soft corona behind the beam tip */}
          <motion.circle
            cx={cx}
            cy={cy - (rOuter + rInner) / 2}
            r={strokeOuter * 1.6}
            fill="#ffffff"
            filter="url(#softBloom)"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={BREATH}
          />
          {/* Bright tip core */}
          <circle
            cx={cx}
            cy={cy - (rOuter + rInner) / 2}
            r={strokeOuter * 0.42}
            fill="#ffffff"
          />
          {/* Short trailing beam stroke — fades along its own gradient */}
          <path
            d={`M ${cx} ${cy - rOuter + strokeOuter / 2} A ${rOuter - strokeOuter / 2} ${rOuter - strokeOuter / 2} 0 0 1 ${
              cx + (rOuter - strokeOuter / 2) * Math.sin((38 * Math.PI) / 180)
            } ${
              cy - (rOuter - strokeOuter / 2) * Math.cos((38 * Math.PI) / 180)
            }`}
            fill="none"
            stroke="url(#beamGrad)"
            strokeWidth={strokeOuter * 0.65}
            strokeLinecap="round"
            opacity={0.85}
          />
        </motion.g>
      )}

      {/* ════════════════════════════════════════════════════════════════
          4. INTERNAL REFLECTIONS — two faint soft streaks inside the
             ring band that drift with the highlight, suggesting light
             refracting through glass. Pure opacity/rotation, cheap.
      ════════════════════════════════════════════════════════════════ */}
      {!reduced && (
        <motion.g
          style={{ originX: `${cx}px`, originY: `${cy}px`, mixBlendMode: "screen" }}
          animate={{ rotate: 360 }}
          transition={{ ...SWEEP, duration: SWEEP.duration * 1.35 }}
        >
          <ellipse
            cx={cx}
            cy={cy - (rOuter + rInner) / 2}
            rx={strokeOuter * 0.9}
            ry={strokeOuter * 2.6}
            fill="#ffffff"
            opacity={0.16}
            filter="url(#reflectionBlur)"
          />
          <ellipse
            cx={cx - rOuter * 0.55}
            cy={cy + rOuter * 0.4}
            rx={strokeInner * 0.6}
            ry={strokeInner * 1.8}
            fill="#ffffff"
            opacity={0.10}
            filter="url(#reflectionBlur)"
          />
        </motion.g>
      )}
    </g>
  );
}
