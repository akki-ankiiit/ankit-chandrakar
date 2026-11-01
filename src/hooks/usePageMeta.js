import { useEffect } from 'react';
import { pageMetaTags } from './pageMetaTags.js';

// Sets the tab title and the description / Open Graph / Twitter tags for one page, and puts the previous values back on leave.
function setMeta(name, value) {
  const attribute = name.startsWith('og:') ? 'property' : 'name';
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element && value == null) return () => {};
  const created = !element;
  if (created) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.append(element);
  }
  const previous = element.getAttribute('content');
  if (value == null) element.remove();
  else element.setAttribute('content', value);
  if (value == null) return () => document.head.append(element);
  return () => (created ? element.remove() : element.setAttribute('content', previous));
}

export default function usePageMeta({ title, description, ogDescription, image, imageType, imageAlt, imageWidth, imageHeight, twitterImage, twitterImageAlt, path, siteUrl }, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const previousTitle = document.title;
    document.title = title;
    const restore = pageMetaTags({ title, description, ogDescription, image, imageType, imageAlt, imageWidth, imageHeight, twitterImage, twitterImageAlt, path }, siteUrl || window.location.origin)
      .map(([name, value]) => setMeta(name, value));
    return () => {
      restore.reverse().forEach((undo) => undo());
      document.title = previousTitle;
    };
  }, [title, description, ogDescription, image, imageType, imageAlt, imageWidth, imageHeight, twitterImage, twitterImageAlt, path, siteUrl, enabled]);
}
