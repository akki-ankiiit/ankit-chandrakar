import { useId, type CSSProperties, type MutableRefObject } from 'react';
import { WritingCapsule } from './WritingCapsule';
import { useMechanicalCarriage, type CarriageSound, type InputAction } from '../../hooks/useMechanicalCarriage';
import { usePrefersReducedMotion } from '../../hooks/useTypewriter';
import type { TextLayout } from '../../lib/typewriter/textLayout';

export interface MechanicalRailProps {
  width: number;
  height: number;
  style?: CSSProperties;
}

/** Full-width charcoal metal rail: vertical cylinder shading, a silver highlight band, a dark lower edge and two end clamps. */
export function MechanicalRail({ width, height, style }: MechanicalRailProps) {
  const uid = useId().replace(/:/g, '');
  const radius = height / 2;
  const clampW = Math.max(8, height * 1.5);
  const clampH = height * 1.9;
  return (
    <svg className="mr-rail" width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', left: 0, ...style }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-metal`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3A3E43" />
          <stop offset=".22" stopColor="#8E959C" />
          <stop offset=".38" stopColor="#4A4F55" />
          <stop offset=".7" stopColor="#23262A" />
          <stop offset="1" stopColor="#0D0E10" />
        </linearGradient>
        <linearGradient id={`${uid}-sheen`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset=".3" stopColor="#FFFFFF" stopOpacity=".2" />
          <stop offset=".62" stopColor="#FFFFFF" stopOpacity=".05" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-clamp`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2A2D31" />
          <stop offset=".5" stopColor="#5B6066" />
          <stop offset="1" stopColor="#17191C" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} rx={radius} fill={`url(#${uid}-metal)`} />
      <rect x={radius * 0.6} y={height * 0.17} width={Math.max(0, width - radius * 1.2)} height={Math.max(1, height * 0.1)} rx={height * 0.05} fill={`url(#${uid}-sheen)`} />
      <rect x={radius * 0.6} y={height * 0.78} width={Math.max(0, width - radius * 1.2)} height={height * 0.1} rx={height * 0.05} fill="#000000" opacity={0.38} />
      <rect x={0} y={(height - clampH) / 2} width={clampW} height={clampH} rx={clampH * 0.3} fill={`url(#${uid}-clamp)`} />
      <rect x={Math.max(0, width - clampW)} y={(height - clampH) / 2} width={clampW} height={clampH} rx={clampH * 0.3} fill={`url(#${uid}-clamp)`} />
    </svg>
  );
}

export interface MechanicalCarriageProps {
  enabled: boolean;
  text: string;
  caretIndex: number;
  layout: TextLayout;
  cellW: number;
  lineH: number;
  padX: number;
  /** Rail width: the writing surface's width. */
  width: number;
  fontSize: number;
  actionRef: MutableRefObject<InputAction>;
  onLineFeed: () => void;
  onNavigate: () => void;
  onSound?: (kind: CarriageSound) => void;
}

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Rail + capsule. Sits above the paper, outside the paper-feed transform, so it never moves vertically. */
export function MechanicalCarriage(p: MechanicalCarriageProps) {
  const reduced = usePrefersReducedMotion();
  // Every size derives from the measured text metrics, so the carriage scales with the type.
  const capW = Math.round(clampN(p.cellW * 2.1, 36, 96));
  const capH = Math.round(clampN(p.lineH * 0.92, 22, 52));
  const hammerH = Math.round(capH * 0.78);
  const railH = Math.round(clampN(p.fontSize * 0.5, 12, 22));
  const railCentre = hammerH + capH / 2;
  const state = useMechanicalCarriage({
    enabled: p.enabled,
    text: p.text,
    caretIndex: p.caretIndex,
    layout: p.layout,
    geometry: { cellW: p.cellW, lineH: p.lineH, padX: p.padX, railWidth: p.width, capsuleWidth: capW },
    reduced,
    actionRef: p.actionRef,
    onLineFeed: p.onLineFeed,
    onNavigate: p.onNavigate,
    onSound: p.onSound,
  });
  if (!p.enabled || p.width <= 0 || p.cellW <= 0) return null;
  return (
    <div className="mr-carriage" style={{ height: hammerH + capH + 6 }} aria-hidden="true">
      <MechanicalRail width={p.width} height={railH} style={{ top: railCentre - railH / 2 }} />
      <WritingCapsule
        x={state.x}
        width={capW}
        height={capH}
        hammerHeight={hammerH}
        isStriking={state.striking}
        isReturning={state.returning}
        reducedMotion={reduced}
        strikeId={state.strikeId}
      />
    </div>
  );
}
