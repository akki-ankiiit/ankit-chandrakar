import { AGENTS } from '../../agents/registry.js';
import { HelixOrb } from '../ai/HelixOrb.jsx';
import { AgentBot } from './AgentBot.jsx';

export function AgentBadge({ id, status = 'idle', motion, frozen, ...props }) {
  return <span className="agents-badge">
    <AgentBot id={id} status={status} motion={motion} frozen={frozen} {...props} />
    {status === 'working' && <span className="agents-badge-orb"><HelixOrb state={AGENTS[id].defaultOrb} size={20} motion={motion} paused={frozen} /></span>}
  </span>;
}
