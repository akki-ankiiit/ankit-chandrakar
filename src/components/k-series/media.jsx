import { kSeriesImages as img } from '../../data/k-series.js';

export const pic = (key, alt, props = {}) => <img src={img[key].src} width={img[key].width} height={img[key].height} alt={alt} decoding="async" {...props} />;
