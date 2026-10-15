const defaultScenes = [
  { id: 'discovery', headline: 'Descubrí otra perspectiva', start: 5, end: 30, position: 'left', theme: 'light' },
  {
    id: 'details',
    headline: 'Cada detalle cuenta',
    subheadline: 'Una experiencia diseñada para descubrir algo diferente.',
    start: 30,
    end: 65,
    position: 'left',
    theme: 'light',
  },
  { id: 'destination', headline: 'Tu viaje comienza acá', start: 65, end: 100, position: 'left', theme: 'light' },
];

const nonEmpty = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

export const assetUrl = (asset, fallback) => {
  const url = asset?.filename;
  return typeof url === 'string' && /^(https?:\/\/|\/)/i.test(url) ? url : fallback;
};

export function linkUrl(link) {
  if (!link || typeof link !== 'object') return '';
  const raw = nonEmpty(link.linktype === 'story' ? link.cached_url || link.url : link.url || link.cached_url);
  if (!raw || raw === '#') return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
  if (raw.startsWith('#')) return raw;
  if (link.linktype === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return `mailto:${raw}`;
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) || raw.startsWith('//')) return '';
  return `/${raw.replace(/^\/+/, '')}`;
}

function objectPosition(value) {
  if (typeof value !== 'string') return '50% 50%';
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 2 || parts.some((part) => !/^\d{1,3}%$/.test(part))) return '50% 50%';
  if (parts.some((part) => Number(part.slice(0, -1)) > 100)) return '50% 50%';
  return parts.join(' ');
}

function normalizeScenes(items) {
  if (!Array.isArray(items) || !items.length) return defaultScenes;
  const entries = items.filter((item) => item?.component === 'scene-item');
  if (!entries.length) return defaultScenes;

  const scenes = entries.map((item) => {
    const start = item.start_progress === '' || item.start_progress == null ? NaN : Number(item.start_progress);
    const end = item.end_progress === '' || item.end_progress == null ? NaN : Number(item.end_progress);
    return {
      id: item._uid,
      headline: nonEmpty(item.headline),
      subheadline: nonEmpty(item.subheadline),
      start,
      end,
      position: ['left', 'center', 'right'].includes(item.text_position) ? item.text_position : 'left',
      theme: item.text_theme === 'dark' ? 'dark' : 'light',
      raw: item,
    };
  });

  scenes.sort((a, b) => a.start - b.start);
  const invalid = scenes.some(
    (scene, index) =>
      !scene.headline ||
      !Number.isFinite(scene.start) ||
      !Number.isFinite(scene.end) ||
      scene.start < 0 ||
      scene.end > 100 ||
      scene.start >= scene.end ||
      (index > 0 && scene.start < scenes[index - 1].end),
  );

  if (invalid) {
    console.warn('The hero-section has invalid or overlapping scene-item progress ranges; using the default scenes.');
    return defaultScenes;
  }
  return scenes;
}

export function getHeroContent(blok) {
  const ctaHref = linkUrl(blok.cta_link);
  const ctaText = nonEmpty(blok.cta_text);

  return {
    introVideo: assetUrl(blok.intro_video, '/videos/toma-hero-web.mp4'),
    scrollVideo: assetUrl(blok.scroll_video, '/videos/toma-scroll-web.mp4'),
    introPoster: assetUrl(blok.poster_image, '/videos/toma-hero-poster.webp'),
    scrollPoster: assetUrl(blok.scroll_poster_image, '/videos/toma-scroll-poster.webp'),
    introTitle: nonEmpty(blok.intro_title, 'Bienvenido a este viaje'),
    introSubtitle: nonEmpty(blok.intro_subtitle, 'Una experiencia que comienza con una nueva perspectiva.'),
    scrollHint: nonEmpty(blok.scroll_hint, 'Deslizá para explorar'),
    objectPositionDesktop: objectPosition(blok.object_position_desktop),
    objectPositionMobile: blok.object_position_mobile ? objectPosition(blok.object_position_mobile) : '40% 50%',
    scenes: normalizeScenes(blok.scenes),
    cta: ctaHref && ctaText ? { href: ctaHref, text: ctaText, external: /^https?:\/\//i.test(ctaHref) } : null,
  };
}
