import { useId } from 'react';

export interface WritingCapsuleProps {
  /** Animated horizontal position of the capsule's left edge, CSS px, relative to the rail. */
  x: number;
  /** True for the duration of a hammer strike on a printable key. */
  isStriking: boolean;
  /** True while the carriage is returning to the left margin. */
  isReturning: boolean;
  reducedMotion: boolean;
  width: number;
  height: number;
  /** Height of the vertical printing stem and hammer above the body. */
  hammerHeight: number;
  /** Changes on every strike; remounting the hammer replays its CSS animation on rapid keys. */
  strikeId?: number;
  className?: string;
}

/**
 * Original warm-ivory writing capsule mounted on the rail. Moves only with transform: translate3d().
 * The hammer and body share one SVG so they scale together with the text size.
 */
export function WritingCapsule({ x, isStriking, isReturning, reducedMotion, width, height, hammerHeight, strikeId = 0, className = '' }: WritingCapsuleProps) {
  const uid = useId().replace(/:/g, '');
  const total = hammerHeight + height;
  const radius = height * 0.38;
  const strike = isStriking && !reducedMotion;
  return (
    <div
      className={`mr-capsule${isReturning ? ' is-returning' : ''}${className ? ` ${className}` : ''}`}
      style={{ width, height: total, transform: `translate3d(${x}px, 0, 0)` }}
    >
      <svg className="mr-capsule-svg" width={width} height={total} viewBox={`0 0 ${width} ${total}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${uid}-body`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFFCF4" />
            <stop offset=".42" stopColor="#F4EEDF" />
            <stop offset=".86" stopColor="#E2D8C2" />
            <stop offset="1" stopColor="#CDBFA3" />
          </linearGradient>
          <linearGradient id={`${uid}-edge`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#7D6D52" stopOpacity=".3" />
            <stop offset=".14" stopColor="#7D6D52" stopOpacity="0" />
            <stop offset=".86" stopColor="#7D6D52" stopOpacity="0" />
            <stop offset="1" stopColor="#7D6D52" stopOpacity=".32" />
          </linearGradient>
          <linearGradient id={`${uid}-steel`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#17191C" />
            <stop offset=".42" stopColor="#4B5056" />
            <stop offset=".58" stopColor="#70767D" />
            <stop offset="1" stopColor="#15171A" />
          </linearGradient>
        </defs>
        <g transform={`translate(0 ${hammerHeight})`}>
          <rect x={0.5} y={0.5} width={width - 1} height={height - 1} rx={radius} fill={`url(#${uid}-body)`} stroke="#8C7D62" strokeOpacity=".55" strokeWidth={1} />
          <rect x={0} y={0} width={width} height={height} rx={radius} fill={`url(#${uid}-edge)`} />
          <rect x={radius * 0.7} y={1.6} width={Math.max(0, width - radius * 1.4)} height={1.2} rx={0.6} fill="#FFFFFF" opacity={0.9} />
          <circle cx={width * 0.3} cy={height * 0.5} r={Math.max(1.2, height * 0.06)} fill="#6E6150" opacity={0.5} />
          <circle cx={width * 0.7} cy={height * 0.5} r={Math.max(1.2, height * 0.06)} fill="#60784B" opacity={0.75} />
        </g>
        <g key={strikeId} className={`mr-hammer${strike ? ' is-striking' : ''}`}>
          <rect x={width / 2 - 1.6} y={hammerHeight * 0.34} width={3.2} height={hammerHeight * 0.66} rx={1.2} fill={`url(#${uid}-steel)`} />
          <rect x={width / 2 - width * 0.12} y={0} width={width * 0.24} height={hammerHeight * 0.42} rx={Math.min(3, width * 0.06)} fill={`url(#${uid}-steel)`} />
        </g>
      </svg>
    </div>
  );
}
