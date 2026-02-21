// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://jaspergeertsma.github.io',
    base: '/tassy_2026',
    integrations: [react()],
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'nl'],
        routing: {
            prefixDefaultLocale: false
        }
    }
});
