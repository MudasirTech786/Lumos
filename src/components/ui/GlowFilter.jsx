"use client";

/**
 * GlowFilter.jsx
 *
 * Pure SVG <defs> — reusable filter primitives for the illuminated ring.
 * No JS animation lives here; Framer Motion animates the *attributes*
 * of elements that reference these filters (stdDeviation, etc.) from
 * the parent. This file only declares the optical building blocks:
 *
 *   - softBloom   : wide, low-intensity Gaussian blur (ambient glow)
 *   - tightGlow   : narrow, higher-intensity blur (ring-hugging glow)
 *   - sparkleGlow : small soft blur for sparkle points
 *
 * Mount once per <svg> via <GlowFilter /> inside <defs>.
 */
export default function GlowFilter() {
  return (
    <>
      {/* Wide ambient bloom — used by the breathing halo */}
      <filter id="softBloom" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur2" />
        <feMerge>
          <feMergeNode in="blur1" />
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Tighter glow — hugs the ring stroke closely, used by the travelling beam */}
      <filter id="tightGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Soft small blur for sparkle points */}
      <filter id="sparkleGlow" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" />
      </filter>

      {/* Very soft wash used by internal reflections */}
      <filter id="reflectionBlur" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" />
      </filter>
    </>
  );
}
