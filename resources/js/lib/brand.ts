/**
 * Blitz brand system — single source of truth for product identity.
 *
 * Market: personal banking + SME operators (founders, freelancers, local businesses)
 * Promise: clear multi-account banking with transfer tools and security that feels professional
 */

export const brand = {
    name: 'Blitz',
    legalName: 'Blitz',
    tagline: 'Banking for people who run something.',
    description:
        'Blitz is modern personal and small-business banking—multi-account balances, instant transfers, and enterprise-grade security in one clear app.',
    shortDescription: 'Personal & SME banking with multi-account control, instant transfers, and bank-grade security.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    twitterHandle: '@blitz',
    supportEmail: 'hello@blitz.bank',
    colors: {
        /** Deep teal — primary brand */
        brand: '#0F6B66',
        brandDark: '#0A4F4B',
        brandLight: '#14B8A6',
        ink: '#0C1222',
        cream: '#F7F6F2',
        mist: '#E8F5F3',
    },
    images: {
        og: '/images/og-default.svg',
        logo: '/images/brand-mark.svg',
        wordmark: '/images/wordmark.svg',
    },
    seo: {
        titleDefault: 'Blitz — Banking for people who run something',
        titleTemplate: '%s · Blitz',
        keywords: [
            'personal banking',
            'small business banking',
            'SME banking',
            'multi-account',
            'money transfers',
            'digital bank',
            'Blitz',
        ],
    },
} as const;

export type Brand = typeof brand;
