import { memo } from 'react';
import { BotAvatar } from 'bot-avatars';
import { AGENTS } from '../../agents/registry.js';
import { hash01 } from '../../agents/hash.js';
import { PERSONALITY, presetProps } from '../../agents/presets.js';
import { useCanvasMotion } from '../../agents/useCanvasMotion.js';

export const AgentBot = memo(function AgentBot({ id, placement, size = 84, status = 'idle', custom = {}, motion = 'lively', material = 'plastic', frozen = false }) {
  const agent = AGENTS[id];
  const personality = motion === 'still' ? 'still' : custom.personality || motion;
  const { ref, animate } = useCanvasMotion(!frozen && personality !== 'still');
  const accessories = agent.accessories || {};
  return <span ref={ref} className="agents-bot" role="img" aria-label={`${agent.name}, ${agent.title} agent, ${status} preview`} data-animating={animate} style={{ width: size, height: size }}>
    <BotAvatar
      key={`${id}-${placement}`} tabIndex={-1} aria-hidden="true"
      type={custom.type || agent.type} face={custom.face || agent.face}
      state={status === 'idle' ? 'default' : status} seed={hash01(id + placement)}
      hat={custom.hat ?? accessories.hat ?? 'none'} glasses={custom.glasses ?? accessories.glasses ?? 'none'}
      headphones={custom.headphones ?? accessories.headphones ?? false} bowTie={custom.bowTie ?? accessories.bowTie ?? false}
      {...presetProps(custom.material || material)} {...PERSONALITY[personality]}
      {...(custom.color ? { color: custom.color } : {})}
      {...(custom.brightness !== undefined ? { brightness: custom.brightness } : {})}
      {...(custom.saturation !== undefined ? { saturation: custom.saturation } : {})}
      size={size} theme="light" interactive={animate} paused={!animate}
    />
  </span>;
});
