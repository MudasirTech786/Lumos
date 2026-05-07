export default function NizamooLogo() {
  return (
    <svg
      width="220"
      height="50"
      viewBox="0 0 220 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gradN" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* ICON N */}
      <g filter="url(#shadow)">
        <path
          d="M15 38V12L35 38V12"
          stroke="url(#gradN)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* pixel accent */}
        <rect x="37" y="10" width="4" height="4" fill="#38BDF8" />
        <rect x="42" y="6" width="3" height="3" fill="#60A5FA" />
      </g>

      {/* TEXT: NIZAAMO */}
      <text
        x="55"
        y="34"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="#111827"
        letterSpacing="2"
      >
        NIZAAMO
      </text>
    </svg>
  );
}