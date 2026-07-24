/**
 * NovaTrust Bank brand system — single source of truth for product identity.
 */
export const brand = {
    name: 'NovaTrust',
    legalName: 'NovaTrust Bank',
    tagline: 'Confidence in every financial move.',
    description:
        'NovaTrust Bank brings personal and business accounts, fast transfers, savings tools, and robust security together in one clear digital banking experience.',
    shortDescription: 'Modern personal and business banking with clear financial control and bank-grade security.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    twitterHandle: '@novatrustbank',
    supportEmail: 'support@novatrust.test',
    colors: {
        brand: '#1557C0',
        brandDark: '#082B5C',
        brandLight: '#3B82F6',
        ink: '#0B1930',
        cream: '#F8FAFC',
        mist: '#EAF2FF',
    },
    images: {
        og: '/images/og-default.svg',
        logo: '/images/logo.svg',
        mark: '/images/brand-mark.svg',
        wordmark: '/images/wordmark.svg',
        favicon: '/favicon.svg',
        appleTouchIcon: '/apple-touch-icon.png',
    },
    seo: {
        titleDefault: 'NovaTrust Bank — Confidence in every financial move',
        titleTemplate: '%s · NovaTrust Bank',
        keywords: [
            'personal banking',
            'business banking',
            'secure payments',
            'savings',
            'money transfers',
            'digital bank',
            'NovaTrust Bank',
        ],
    },
} as const;

export type Brand = typeof brand;
