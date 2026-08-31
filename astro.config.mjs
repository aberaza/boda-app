import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  session: {
    cookie: { name: 'bodorrio-rsvp', sameSite: 'lax', httpOnly: true, secure: true },
    ttl: 60 * 60 * 24 * 365 * 2,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
