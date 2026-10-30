import { useEffect } from 'react';

// Sets the tab title and the description / Open Graph / Twitter tags for one page, and puts the previous values back on leave.
function setMeta(name, value) {
  const attribute = name.startsWith('og:') ? 'property' : 'name';
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  const created = !element;
  if (created) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.append(element);
  }
  const previous = element.getAttribute('content');
  element.setAttribute('content', value);
  return () => (created ? element.remove() : element.setAttribute('content', previous));
}

export default function usePageMeta({ title, description, image, imageAlt, imageWidth, imageHeight, path }) {
  useEffect(() => {
    const previousTitle = document.title;
    const imageUrl = new URL(image, window.location.origin).href;
    document.title = title;
    const restore = [
      setMeta('description', description),
      setMeta('og:title', title),
      setMeta('og:description', description),
      setMeta('og:url', new URL(path, window.location.origin).href),
      setMeta('og:image', imageUrl),
      setMeta('og:image:width', String(imageWidth)),
      setMeta('og:image:height', String(imageHeight)),
      setMeta('og:image:alt', imageAlt),
      setMeta('twitter:card', 'summary_large_image'),
      setMeta('twitter:image', imageUrl),
    ];
    return () => {
      restore.reverse().forEach((undo) => undo());
      document.title = previousTitle;
    };
  }, [title, description, image, imageAlt, imageWidth, imageHeight, path]);
}
