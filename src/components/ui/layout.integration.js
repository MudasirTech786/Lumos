/**
 * app/layout.js  (or app/layout.tsx)
 *
 * Root layout — mount PageTransitionProvider ONCE here.
 * Every router.push(), <Link />, sidebar navigation, and search navigation
 * will automatically trigger the loading animation.
 *
 * ── WHAT TO ADD ──────────────────────────────────────────────────────────────
 * 1. Import PageTransitionProvider
 * 2. Wrap {children} with it
 *
 * Everything else in your layout stays exactly as-is.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import PageTransitionProvider from "@/components/ui/PageTransitionProvider";
// ^ adjust the import path to wherever you place the components

export const metadata = {
  title: "LUMOS Rentals",
  description: "LUMOS Rentals ERP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/*
          PageTransitionProvider must be a client boundary wrapper.
          It mounts PageLoader and NavigationProgress once at the root.
          No other pages or components need any changes.
        */}
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
}

/**
 * ── OPTIONAL: Triggering loading manually ────────────────────────────────────
 *
 * For cases where you want to manually control loading (e.g. form submit
 * that triggers navigation), use the hook:
 *
 *   import { usePageTransition } from "@/components/ui/PageTransitionProvider";
 *
 *   function MyComponent() {
 *     const { startLoading } = usePageTransition();
 *
 *     const handleSubmit = async () => {
 *       startLoading();
 *       await submitForm();
 *       router.push("/dashboard");
 *     };
 *   }
 *
 * ── FILE PLACEMENT ────────────────────────────────────────────────────────────
 *
 * Recommended structure:
 *
 *   components/
 *   └── ui/
 *       ├── PageTransitionProvider.jsx   ← context + history patch
 *       ├── PageLoader.jsx               ← fullscreen overlay
 *       ├── LoadingLogo.jsx              ← logo + animated SVG rings
 *       ├── LoadingDots.jsx              ← animated "Loading..." text
 *       └── NavigationProgress.jsx      ← optional top rainbow bar
 *
 * ── LOGO IMAGE ────────────────────────────────────────────────────────────────
 *
 * LoadingLogo.jsx uses:
 *   src="/images/LUMOS-LOGO-BLACK.jpeg"
 *
 * This matches your existing Layout.js. Make sure the logo file exists at
 * public/images/LUMOS-LOGO-BLACK.jpeg (or .png — update the src accordingly).
 *
 * ── FRAMER MOTION ─────────────────────────────────────────────────────────────
 *
 * If not already installed:
 *   npm install framer-motion
 *
 */
