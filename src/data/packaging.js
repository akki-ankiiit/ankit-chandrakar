import { kSeriesCard } from './k-series.js';
import { bondureCard } from './bondure.js';
import { shinexCard } from './shinex-crystalx.js';

// The three packaging case studies, in reading order. Previous / next links loop through them.
export const packagingCases = [kSeriesCard, bondureCard, shinexCard];

export function packagingNeighbours(id) {
  const index = packagingCases.findIndex((item) => item.id === id);
  const count = packagingCases.length;
  if (index < 0) return { previous: packagingCases[count - 1], next: packagingCases[0] };
  return {
    previous: packagingCases[(index - 1 + count) % count],
    next: packagingCases[(index + 1) % count],
  };
}
