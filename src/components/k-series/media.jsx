import { kSeriesImages as img } from '../../data/k-series.js';

export const pic = (key, alt, props = {}) => <img src={img[key].src} srcSet={img[`${key}-thumb`] ? `${img[`${key}-thumb`].src} ${img[`${key}-thumb`].width}w, ${img[key].src} ${img[key].width}w` : undefined} sizes="(max-width: 700px) 90vw, 560px" width={img[key].width} height={img[key].height} alt={alt} decoding="async" loading="lazy" {...props} />;
