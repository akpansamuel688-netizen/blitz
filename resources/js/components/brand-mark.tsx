import { useId, type SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = SVGAttributes<SVGElement> & {
    /** When true, draws the full app-tile mark with blue background */
    framed?: boolean;
};

/**
 * NovaTrust brand mark — an architectural N representing stability and forward motion.
 * Default is monochrome (`currentColor`) for flexible UI chrome.
 */
export default function BrandMark({ className, framed = false, ...props }: Props) {
    const reactId = useId().replace(/:/g, '');
    const gradientId = `novatrust-mark-bg-${reactId}`;

    if (framed) {
        return (
            <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn('shrink-0', className)}
                aria-hidden
                {...props}
            >
                <defs>
                    <linearGradient id={gradientId} x1="5" y1="2" x2="35" y2="38" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2563EB" />
                        <stop offset="1" stopColor="#082B5C" />
                    </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill={`url(#${gradientId})`} />
                <path
                    fill="#F7F6F2"
                    d="M10 29V11h5l10 12V11h5v18h-5L15 17v12h-5Z"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('shrink-0', className)}
            aria-hidden
            {...props}
        >
            <path
                fill="currentColor"
                d="M8 31V9h6l12 14V9h6v22h-6L14 17v14H8Z"
            />
        </svg>
    );
}
