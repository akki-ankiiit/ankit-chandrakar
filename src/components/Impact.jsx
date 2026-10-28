import { Reveal } from './ui.jsx';
import { impactCapabilities } from '../data/capabilities.js';
import {
  ProductThinkingIcon,
  MotionIcon,
  UserResearchIcon,
  PrototypingIcon,
  IllustrationIcon,
  SystemsIcon,
  AccessibilityIcon,
  BrandingIcon,
  InteractionIcon,
  LeadershipIcon,
} from './impact/ImpactIcons.jsx';

const icons = {
  'product-thinking': ProductThinkingIcon,
  motion: MotionIcon,
  'user-research': UserResearchIcon,
  prototyping: PrototypingIcon,
  illustration: IllustrationIcon,
  systems: SystemsIcon,
  accessibility: AccessibilityIcon,
  branding: BrandingIcon,
  interaction: InteractionIcon,
  leadership: LeadershipIcon,
};

export default function Impact() {
  return (
    <section id="impact" className="impact-section" aria-labelledby="impact-title">
      <div className="container">
        <Reveal className="impact-intro">
          <p className="eyebrow">How I work</p>
          <h2 id="impact-title">How I create impact.</h2>
        </Reveal>
        <ul className="impact-grid" role="list">
          {impactCapabilities.map((capability, index) => {
            const Icon = icons[capability.id];
            return (
              <li key={capability.id} className="impact-cell">
                <Reveal className="impact-cell-body" delay={index * 40}>
                  <span className="impact-icon-wrap"><Icon /></span>
                  <h3>{capability.title}</h3>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
