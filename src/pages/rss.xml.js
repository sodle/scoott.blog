import rss from '@astrojs/rss';

import { getPosts } from '../posts.astro';

export async function GET(context) {
    return rss({
        title: import.meta.env.DEV ? 'scoott.blog [DEV]' : 'scoott.blog',
        description: 'Personal blog of Scott J. Odle',
        site: context.site,
        items: await getPosts().then(posts => posts.map(post => {
            return {
                title: post.frontmatter.title,
                description: post.frontmatter.description,
                pubDate: new Date(post.frontmatter.pubDate),
                link: post.url
            }
        }))
    });
}
