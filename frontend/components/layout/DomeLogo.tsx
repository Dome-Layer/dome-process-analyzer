// Blueprint-style DOME wordmark from DOME_DESIGN_SYSTEM_V2.md
// Adapted for light-theme product UI: strokes use text-primary colour

interface DomeLogoProps {
  width?: number;
  className?: string;
}

export function DomeLogo({ width = 120, className }: DomeLogoProps) {
  const height = Math.round(width * (60 / 280));

  return (
    <svg
      viewBox="0 0 280 60"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      aria-label="Dome"
      role="img"
      className={className}
    >
      {/* D with architectural stem split */}
      <g>
        <path
          d="M3 8 L3 52 L24 52 C40 52 48 42 48 30 C48 18 40 8 24 8 Z"
          fill="none"
          stroke="#0C0C0E"
          strokeWidth="2.5"
        />
        <line x1="3" y1="30" x2="24" y2="30" stroke="#5B9CB5" strokeWidth="1" opacity="0.6" />
        <circle cx="3" cy="8" r="2" fill="#5B9CB5" />
        <circle cx="3" cy="52" r="2" fill="#5B9CB5" />
      </g>
      {/* O with crosshair */}
      <path
        d="M64 30 C64 16 74 8 86 8 C98 8 108 16 108 30 C108 44 98 52 86 52 C74 52 64 44 64 30 Z"
        fill="none"
        stroke="#0C0C0E"
        strokeWidth="2.5"
      />
      <line x1="86" y1="12" x2="86" y2="48" stroke="#5B9CB5" strokeWidth="0.75" opacity="0.3" />
      <line x1="68" y1="30" x2="104" y2="30" stroke="#5B9CB5" strokeWidth="0.75" opacity="0.3" />
      {/* M */}
      <polyline
        points="122,52 122,8 142,36 162,8 162,52"
        fill="none"
        stroke="#0C0C0E"
        strokeWidth="2.5"
      />
      {/* E with terminal dots */}
      <polyline points="176,8 176,52" fill="none" stroke="#0C0C0E" strokeWidth="2.5" />
      <line x1="176" y1="8" x2="206" y2="8" stroke="#0C0C0E" strokeWidth="2.5" />
      <line x1="176" y1="30" x2="200" y2="30" stroke="#0C0C0E" strokeWidth="2.5" />
      <line x1="176" y1="52" x2="206" y2="52" stroke="#0C0C0E" strokeWidth="2.5" />
      <circle cx="206" cy="8" r="2" fill="#5B9CB5" />
      <circle cx="200" cy="30" r="2" fill="#5B9CB5" />
      <circle cx="206" cy="52" r="2" fill="#5B9CB5" />
    </svg>
  );
}
