import { useId, type SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = SVGAttributes<SVGElement> & {
    /** When true, draws the full app-tile mark with teal background */
    framed?: boolean;
};

/**
 * Blitz brand mark — refined geometric bolt (speed + precision).
 * Default is monochrome (`currentColor`) for flexible UI chrome.
 */
export default function BrandMark({ className, framed = false, ...props }: Props) {
    const reactId = useId().replace(/:/g, '');
    const gradientId = `blitz-mark-bg-${reactId}`;

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
                        <stop stopColor="#148F87" />
                        <stop offset="1" stopColor="#0A4F4B" />
                    </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill={`url(#${gradientId})`} />
                <path
                    fill="#F7F6F2"
                    d="M23.45 6.4 10.35 22.3c-.3.36-.04.92.43.92h7.4l-2 10.25c-.13.68.7 1.09 1.16.57L29.95 18.5c.33-.37.07-.93-.43-.93h-7.45l1.85-9.3c.13-.68-.7-1.09-1.16-.57Z"
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
                d="M23.45 4.2 8.55 22.3c-.35.42-.05 1.08.5 1.08h8.75l-2.35 12.1c-.15.8.83 1.28 1.37.67L31.5 17.95c.39-.44.08-1.12-.5-1.12h-8.8l2.2-11c.15-.8-.83-1.28-1.37-.67Z"
            />
        </svg>
    );
}
