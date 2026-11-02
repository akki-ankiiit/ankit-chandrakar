// Shared by the runtime hook and static HTML builder so share previews stay in sync.
export function pageMetaTags({ title, description, ogDescription = description, image, imageType, imageAlt, imageWidth, imageHeight, twitterImage = image, twitterImageAlt = imageAlt, path }, baseUrl) {
  const imageUrl = new URL(image, baseUrl);
  const extension = imageUrl.pathname.split('.').pop().toLowerCase();
  const mime = { gif: 'image/gif', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
  return [
    ['description', description],
    ['og:title', title],
    ['og:description', ogDescription],
    ['og:url', new URL(path, baseUrl).href],
    ['og:image', imageUrl.href],
    ['og:image:type', imageType ?? mime[extension] ?? null],
    ['og:image:width', imageWidth == null ? null : String(imageWidth)],
    ['og:image:height', imageHeight == null ? null : String(imageHeight)],
    ['og:image:alt', imageAlt ?? null],
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', title],
    ['twitter:description', ogDescription],
    ['twitter:image', new URL(twitterImage, baseUrl).href],
    ['twitter:image:alt', twitterImageAlt ?? null],
  ];
}
