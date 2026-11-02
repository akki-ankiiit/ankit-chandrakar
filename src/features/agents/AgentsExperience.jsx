import { useRef, useState } from 'react';
import { AGENTS, AGENT_IDS, ORB_STATES } from '../../agents/registry.js';
import { AgentCard } from '../../components/agents/AgentCard.jsx';
import { AgentBot } from '../../components/agents/AgentBot.jsx';
import { HelixOrb } from '../../components/ai/HelixOrb.jsx';
import { AgentDrawer } from './AgentDrawer.jsx';
import '../../styles/agents.css';

const DESCRIPTIONS = {
  working: 'Particles move along tilted orbits. A little signal that something is in motion.',
  searching: 'A meridian sweeps a dotted globe, looking for the next useful connection.',
  solving: 'Bands scramble in quarter turns, then click back into place.',
  listening: 'A soft waveform rolls through latitude rings. Attentive, without the noise.',
  connecting: 'A constellation wires itself together, with signals travelling between points.',
  weaving: 'Three strands plait around a sphere, bringing separate threads together.',
  composing: 'An undulating, multi-band sash gives shape to a thought.',
  breathing: 'A face-on ring slowly morphs. A quieter moment between ideas.',
  shaping: 'A dotted outline moves from circle to triangle to square.',
};

function Choice({ label, value, values, onChange }) {
  return (
    <div className="agents-choice" role="group" aria-label={label}>
      <span>{label}</span>
      <div>{values.map((item) => (
        <button type="button" key={item} aria-pressed={value === item} onClick={() => onChange(item)}>{item}</button>
      ))}</div>
    </div>
  );
}

export default function AgentsExperience() {
  const [open, setOpen] = useState(null);
  const [custom, setCustom] = useState({});
  const [motion, setMotion] = useState('lively');
  const [material, setMaterial] = useState('plastic');
  const [status, setStatus] = useState('idle');
  const [orb, setOrb] = useState('weaving');
  const [previewAgent, setPreviewAgent] = useState(null);
  const preview = useRef(null);
  const previewActivity = (id) => {
    setPreviewAgent(id);
    setOrb(AGENTS[id].defaultOrb);
    setStatus('working');
    preview.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    preview.current?.focus({ preventScroll: true });
  };
  return <section id="agents" className="agents-page" aria-labelledby="agents-title">
    <div className="agents-container">
      <header className="agents-intro">
        <div className="agents-intro-copy">
          <p className="agents-kicker">Helix / An interactive character study</p>
          <h2 id="agents-title">Agents,<br /><span>with personality.</span></h2>
          <p className="agents-intro-description">Fourteen characters. Nine ways to think. A curious crew of specialists, brought to life through shape and motion.</p>
          <a className="agents-intro-action" href="#agents-roster-title">Meet the characters <span aria-hidden="true">↗</span></a>
        </div>
        <div className="agents-intro-crew">
          <div className="agents-featured-characters">{['reader', 'conductor', 'scribe'].map((id) => <AgentBot key={id} id={id} placement="agents-intro" size={80} motion={motion} frozen={!!open} custom={custom[id]} material={material} />)}</div>
          <p>A few familiar faces. A whole crew below.</p>
        </div>
      </header>
      <section className="agents-orb-section" aria-labelledby="agents-orb-title" ref={preview} tabIndex={-1}>
        <header className="agents-section-heading">
          <div><p className="agents-kicker">01 / States of thought</p><h3 id="agents-orb-title">A signal, with feeling.</h3></div>
          <p>Every thought has a rhythm. Choose a state and watch a different idea take shape.</p>
        </header>
        <div className="agents-orb-study">
          <div className="agents-orb-stage">
            <span className="agents-preview-tag">A thought in motion</span>
            <HelixOrb state={orb} size={200} motion={motion} paused={!!open} />
            <div className="agents-orb-caption" aria-live="polite"><h3>{orb}</h3><p>{DESCRIPTIONS[orb]}</p>{previewAgent && <small>{AGENTS[previewAgent].name}’s signature activity</small>}</div>
            <span className="agents-stage-footnote">Helix / Orb studies</span>
          </div>
          <div className="agents-orb-copy">
            <h3>Choose a state</h3>
            <p>Nine ways to show a little presence.</p>
            <div className="agents-orb-selection" role="group" aria-label="Orb states">{ORB_STATES.map((state, index) => (
              <button type="button" key={state} aria-label={`Preview ${state} orb`} aria-pressed={orb === state} onClick={() => { setOrb(state); setPreviewAgent(null); }}><span aria-hidden="true">0{index + 1}</span>{state}</button>
            ))}</div>
          </div>
        </div>
      </section>
      <section className="agents-roster" aria-labelledby="agents-roster-title">
        <header className="agents-section-heading agents-roster-heading"><div><p className="agents-kicker">02 / Meet the crew</p><h3 id="agents-roster-title">A character for every role.</h3><span className="agents-count">14 distinct personalities</span></div><p>Meet the specialists from the Helix concept. Explore their gestures, or make their look your own.</p></header>
        <div className="agents-control-panel">
          <div className="agents-controls-heading"><h3>Set the mood.</h3><p>One setting, the whole crew.</p></div>
          <div className="agents-controls"><Choice label="Motion" value={motion} values={['lively', 'calm', 'still']} onChange={setMotion} /><Choice label="Material" value={material} values={['plastic', 'fabric']} onChange={setMaterial} /><Choice label="Activity preview" value={status} values={['idle', 'working', 'sleeping']} onChange={setStatus} /></div>
          <p className="agents-control-note">Visual previews only. Motion follows your device’s reduced-motion preference.</p>
        </div>
        <div className="agents-grid">{AGENT_IDS.map((id, index) => <AgentCard key={id} id={id} index={index} custom={custom[id]} motion={motion} material={material} status={status} frozen={!!open} onOpen={() => setOpen(id)} onPreview={() => previewActivity(id)} />)}</div>
      </section>
      <div className="agents-colophon"><p>Small characters. Thoughtful details.</p><span>Characters & orbs adapted from <a href="https://github.com/akki-ankiiit/helix01">Helix</a>.<br />Canvas renderers by Jakub Antalik · MIT licensed.</span></div>
    </div>
    {open && <AgentDrawer key={open} id={open} custom={custom[open] || {}} motion={motion} material={material} status={status} onStatusChange={setStatus} onClose={() => setOpen(null)} onChange={(value) => setCustom((current) => ({ ...current, [open]: value }))} onReset={() => setCustom((current) => ({ ...current, [open]: undefined }))} />}
  </section>;
}
