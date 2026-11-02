import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { AGENTS } from '../../agents/registry.js';
import { AgentBadge } from './AgentBadge.jsx';

export function AgentCard({ id, index, onOpen, onPreview, status, ...appearance }) {
  const agent = AGENTS[id];
  return <article className="agents-card selection" aria-labelledby={`agent-${id}`}>
    <div className="agents-card-portrait"><span className="agents-status"><span aria-hidden="true" />{status}</span><span className="agents-card-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="agents-avatar-box"><AgentBadge id={id} size={92} placement="agents-page" status={status} {...appearance} /></span></div>
    <div className="agents-card-head"><h3 id={`agent-${id}`}>{agent.name}</h3><p className="agents-specialty">{agent.title}</p></div>
    <p className="agents-role">{agent.plainRole}.</p>
    <p className="agents-signature"><span>Signature state</span><span>{agent.defaultOrb}</span></p>
    <div className="agents-card-actions">
      <button type="button" onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); onOpen(); }} aria-label={`Customize ${agent.name}`}><SlidersHorizontal size={14} /> Customize</button>
      <button type="button" onClick={onPreview} aria-label={`Preview ${agent.name} activity`}>Preview activity <ArrowUpRight size={14} /></button>
    </div>
  </article>;
}
