function Svg({ className, children }) {
  return (
    <svg
      className={`impact-icon ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

const offset = (x, y) => ({ '--x': `${x}px`, '--y': `${y}px` });

export function ProductThinkingIcon() {
  return (
    <Svg className="ico-product">
      <path d="M22 32C30 32 32 16 42 16M22 32C30 32 32 48 42 48" strokeWidth="1" opacity=".3" />
      <path className="ico-draw" pathLength="1" d="M22 32C30 32 32 16 42 16" />
      <path className="ico-draw" pathLength="1" d="M22 32C30 32 32 48 42 48" />
      <rect x="6" y="25" width="16" height="14" rx="3" />
      <rect className="settle" style={offset(4, -4)} x="42" y="9" width="16" height="14" rx="3" />
      <rect className="settle" style={offset(-3, 5)} x="42" y="41" width="16" height="14" rx="3" />
    </Svg>
  );
}

export function MotionIcon() {
  return (
    <Svg className="ico-motion">
      <rect className="settle" style={{ ...offset(0, 12), '--d': '0ms' }} x="6" y="23" width="16" height="16" rx="3" />
      <rect className="settle" style={{ ...offset(0, -2), '--d': '120ms' }} x="24" y="23" width="16" height="16" rx="3" />
      <rect className="settle" style={{ ...offset(0, -14), '--d': '240ms' }} x="42" y="23" width="16" height="16" rx="3" />
    </Svg>
  );
}

export function UserResearchIcon() {
  return (
    <Svg className="ico-research">
      <defs>
        <clipPath id="impact-lens-clip">
          <circle cx="27" cy="27" r="14" />
        </clipPath>
      </defs>
      <circle cx="27" cy="27" r="15" />
      <path d="M38 38L52 52" strokeWidth="2.4" />
      <g clipPath="url(#impact-lens-clip)">
        <line className="ico-scan" x1="12" x2="42" y1="27" y2="27" />
      </g>
      <circle className="ico-insight" cx="33" cy="22" r="2.6" />
    </Svg>
  );
}

export function PrototypingIcon() {
  return (
    <Svg className="ico-proto">
      <rect x="6" y="8" width="52" height="48" rx="6" />
      <path d="M6 19H58" />
      <g className="ico-wire">
        <rect x="13" y="26" width="24" height="16" rx="2" strokeDasharray="3 3" />
        <rect x="41" y="26" width="10" height="16" rx="2" strokeDasharray="3 3" />
        <rect x="14" y="46" width="18" height="6" rx="3" />
      </g>
      <g className="ico-ui">
        <rect x="13" y="26" width="24" height="16" rx="3" />
        <rect x="41" y="26" width="10" height="16" rx="3" />
        <rect className="ico-ui-button" x="14" y="46" width="18" height="6" rx="3" />
      </g>
    </Svg>
  );
}

export function IllustrationIcon() {
  return (
    <Svg className="ico-illus">
      <path d="M8 48C20 8 44 56 56 16" strokeWidth="1" opacity=".3" />
      <path className="ico-draw" pathLength="1" d="M8 48C20 8 44 56 56 16" strokeWidth="2.2" />
      <path className="ico-handles" d="M8 48L20 8M56 16L44 56" strokeWidth="1" strokeDasharray="2 3" />
      <circle className="ico-anchor" cx="8" cy="48" r="3.2" />
      <circle className="ico-anchor" cx="56" cy="16" r="3.2" />
      <circle className="ico-ctrl" cx="20" cy="8" r="2.4" />
      <circle className="ico-ctrl" cx="44" cy="56" r="2.4" />
    </Svg>
  );
}

export function SystemsIcon() {
  return (
    <Svg className="ico-systems">
      <rect className="settle" x="8" y="8" width="20" height="20" rx="4" />
      <rect className="settle" style={offset(4, 3)} x="36" y="8" width="20" height="20" rx="4" />
      <rect className="settle" style={offset(-3, 3)} x="8" y="36" width="20" height="20" rx="4" />
      <rect className="settle" style={offset(3, -2)} x="36" y="36" width="20" height="20" rx="4" />
    </Svg>
  );
}

export function AccessibilityIcon() {
  return (
    <Svg className="ico-access">
      <circle className="ico-dashed" cx="32" cy="32" r="27" strokeDasharray="3.5 4" />
      <circle className="ico-solid" cx="32" cy="32" r="27" />
      <rect x="18" y="25" width="28" height="14" rx="7" />
      <rect className="ico-control-fill" x="18" y="25" width="28" height="14" rx="7" />
      <circle className="ico-knob" cx="25" cy="32" r="3.6" />
    </Svg>
  );
}

export function BrandingIcon() {
  return (
    <Svg className="ico-brand">
      <circle className="settle" style={offset(-9, -7)} cx="24" cy="32" r="13" />
      <rect className="settle" style={offset(10, 8)} x="30" y="18" width="22" height="22" rx="3" />
      <circle className="settle ico-brand-dot" style={offset(-6, 8)} cx="46" cy="50" r="4" />
    </Svg>
  );
}

export function InteractionIcon() {
  return (
    <Svg className="ico-interact">
      <g className="ico-button">
        <rect x="6" y="24" width="30" height="16" rx="8" />
        <rect className="ico-button-fill" x="6" y="24" width="30" height="16" rx="8" />
        <line x1="14" x2="28" y1="32" y2="32" />
      </g>
      <g className="ico-pointer">
        <path d="M0 0V16L4.6 11.8L7.5 18.4L10.4 17.1L7.6 10.6H12.8Z" strokeWidth="1.4" />
      </g>
    </Svg>
  );
}

export function LeadershipIcon() {
  return (
    <Svg className="ico-lead">
      <path className="ico-spokes" d="M32 25V17M39 32H47M32 39V47M25 32H17" />
      <circle className="ico-core" cx="32" cy="32" r="6" />
      <circle className="settle" style={offset(-8, -6)} cx="32" cy="12" r="3.5" />
      <circle className="settle" style={offset(7, -6)} cx="52" cy="32" r="3.5" />
      <circle className="settle" style={offset(6, 7)} cx="32" cy="52" r="3.5" />
      <circle className="settle" style={offset(-6, -7)} cx="12" cy="32" r="3.5" />
    </Svg>
  );
}
