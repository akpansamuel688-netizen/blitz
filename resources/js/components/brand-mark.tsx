import type { SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Blitz monogram — a geometric bolt mark (speed + precision).
 * Use for favicons, app chrome, and marketing lockups.
 */
export default function BrandMark({ className, ...props }: SVGAttributes<SVGElement>) {
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
                d="M22.8 3.5 8.2 22.1h8.4l-2.6 14.4L29.8 17.9h-8.6L22.8 3.5Z"
                fill="currentColor"
            />
        </svg>
    );
}
