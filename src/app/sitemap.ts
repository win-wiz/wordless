export default function sitemap() {
    return [
        {
            url: 'https://wordless.online',
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://wordless.online/privacy-policy',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://wordless.online/terms-of-service',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];
} 