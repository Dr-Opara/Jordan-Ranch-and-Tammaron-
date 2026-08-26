import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JRT.Community',
    short_name: 'JRT',
    description: 'A private community app for Jordan Ranch and Tamarron residents.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111827',
    orientation: 'portrait',
    categories: ['social', 'lifestyle', 'local'],
  };
}
