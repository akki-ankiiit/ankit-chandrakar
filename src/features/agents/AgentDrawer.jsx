import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { botAvatarPalette, botAvatarPresets } from 'bot-avatars';
import { AGENTS, RESERVED_TYPES } from '../../agents/registry.js';
import { presetProps } from '../../agents/presets.js';
import { AgentBadge } from '../../components/agents/AgentBadge.jsx';

function Select({ label, value, values, onChange }) {
  return <label className="agents-field"><span>{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>;
}

export function AgentDrawer({ id, custom, onChange, onReset, onClose, motion, material, status, onStatusChange }) {
  const dialog = useRef(null);
  const agent = AGENTS[id];
  const accessories = agent.accessories || {};
  const type = custom.type || agent.type;
  const preset = presetProps(custom.material || material);
  // Match BotAvatar's resolution order: explicit props, shape preset, library fallback.
  const brightness = custom.brightness ?? preset.brightness ?? botAvatarPresets[type].brightness ?? 1;
  const saturation = custom.saturation ?? preset.saturation ?? botAvatarPresets[type].saturation ?? 1.5;
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  const set = (key, value) => onChange({ ...custom, [key]: value });
  return <dialog ref={dialog} className="agents-drawer" aria-labelledby="agents-drawer-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
    <div className="agents-drawer-content">
      <header className="agents-drawer-header"><div><p className="agents-kicker">Character studio</p><h2 id="agents-drawer-title">{agent.name} · {agent.title}</h2></div><button type="button" className="agents-close" aria-label="Close customization" onClick={onClose} autoFocus><X size={20} /></button></header>
      <div className="agents-drawer-profile">
        <AgentBadge id={id} placement="agent-drawer" size={128} custom={custom} motion={motion} material={material} status={status} />
        <div><p>{agent.plainRole}</p><blockquote>“{agent.greeting}”</blockquote><small>Greeting & appearance preview</small></div>
      </div>
      <section className="agents-drawer-section"><h3>Appearance</h3><p>Changes apply to this character for your visit.</p>
        <label className="agents-field"><span>Body colour</span><input type="color" value={custom.color || botAvatarPalette[type]} onChange={(event) => set('color', event.target.value)} /></label>
        <Select label="Shape" value={type} values={[agent.type, ...RESERVED_TYPES]} onChange={(value) => set('type', value)} />
        <Select label="Material" value={custom.material || material} values={['plastic', 'fabric']} onChange={(value) => set('material', value)} />
        <Select label="Face" value={custom.face || agent.face} values={['eyes', 'mouth']} onChange={(value) => set('face', value)} />
        <Select label="Hat" value={custom.hat ?? accessories.hat ?? 'none'} values={['none', 'beret', 'beanie', 'party', 'crown']} onChange={(value) => set('hat', value)} />
        <Select label="Glasses" value={custom.glasses ?? accessories.glasses ?? 'none'} values={['none', 'round', 'square', 'shades']} onChange={(value) => set('glasses', value)} />
        {['headphones', 'bowTie'].map((key) => <label className="agents-field" key={key}><span>{key === 'bowTie' ? 'Bow tie' : 'Headphones'}</span><input type="checkbox" checked={custom[key] ?? accessories[key] ?? false} onChange={(event) => set(key, event.target.checked)} /></label>)}
        <label className="agents-field"><span>Brightness <output>{brightness.toFixed(2)}</output></span><input aria-label="Brightness" type="range" min="0.5" max="1.5" step="0.01" value={brightness} onChange={(event) => set('brightness', Number(event.target.value))} /></label>
        <label className="agents-field"><span>Saturation <output>{saturation.toFixed(2)}</output></span><input aria-label="Saturation" type="range" min="0.5" max="2.5" step="0.01" value={saturation} onChange={(event) => set('saturation', Number(event.target.value))} /></label>
        <Select label="Motion" value={custom.personality || 'follow page'} values={['follow page', 'lively', 'calm', 'still']} onChange={(value) => set('personality', value === 'follow page' ? undefined : value)} />
        <p className="agents-control-note">Lively looks around and hops. Calm turns gently. Still holds a pose. Page-level Still and reduced motion always take priority.</p>
        <Select label="Preview activity" value={status} values={['idle', 'working', 'sleeping']} onChange={onStatusChange} />
        <button type="button" className="agents-reset" onClick={onReset}>Reset {agent.name} to default</button>
      </section>
      <section className="agents-drawer-section"><h3>From the original Helix concept</h3><p className="agents-drawer-description">{agent.role}</p><h4>Source tools</h4><div className="agents-tools">{agent.tools.map((tool) => <code key={tool}>{tool}</code>)}</div></section>
      <section className="agents-drawer-section"><h3>Original product touchpoints</h3><ul>{agent.worksOn.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <p className="agents-control-note">An interactive character study from Helix. Activity states are visual demonstrations.</p>
    </div>
  </dialog>;
}
