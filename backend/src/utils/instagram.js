const extractInstagramInfo = (rawUrl) => {
  if (!rawUrl) {
    throw new Error('Instagram URL is required');
  }

  let url;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error('Invalid Instagram URL');
  }

  const host = url.hostname.replace('www.', '');

  if (!host.includes('instagram.com') && !host.includes('instagr.am')) {
    throw new Error('Only Instagram URLs are allowed');
  }

  const parts = url.pathname.split('/').filter(Boolean);

  const first = parts[0];
  const shortcode = parts[1];

  let type = null;

  if (first === 'reel' || first === 'reels') {
    type = 'reel';
  } else if (first === 'p') {
    type = 'post';
  } else if (first === 'tv') {
    type = 'tv';
  }

  if (!type || !shortcode) {
    throw new Error('Invalid Instagram reel/post URL');
  }

  const pathType = type === 'post' ? 'p' : type;

  return {
    type,
    shortcode,
    normalizedUrl: `https://www.instagram.com/${pathType}/${shortcode}/`,
    embedUrl: `https://www.instagram.com/${pathType}/${shortcode}/embed`,
  };
};

module.exports = {
  extractInstagramInfo,
};