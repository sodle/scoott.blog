import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

const sitemapIgnoreList = [
  'https://scoott.blog/posts/2024/01/ground/',
];


// https://astro.build/config
export default defineConfig({
  site: 'https://scoott.blog',
  integrations: [mdx(), sitemap({
    filter: u => !sitemapIgnoreList.includes(u),
  })]
});