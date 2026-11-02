import { useEffect, useState } from 'react';

// Shared by bots AND orbs. Adapted from Helix's 12-slot animation budget.
export const MAX_ANIMATED = 12;
const holders = new Set();
const waiters = new Set();
let sequence = 0;
export function useAnimSlot(want, priority = false) {
  const [me] = useState(() => ++sequence);
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    if (!want) return;
    const acquire = () => {
      // Reserve one slot for the large interactive orb so a visible roster cannot starve it.
      if (!holders.has(me) && holders.size < MAX_ANIMATED - (priority ? 0 : 1)) {
        holders.add(me);
        setGranted(true);
      }
    };
    acquire();
    waiters.add(acquire);
    return () => {
      waiters.delete(acquire);
      setGranted(false);
      if (holders.delete(me)) waiters.forEach((acquireSlot) => acquireSlot());
    };
  }, [want, me, priority]);
  return want && granted;
}
