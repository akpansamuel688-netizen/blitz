import { Link } from '@inertiajs/react';
import BrandMark from '@/components/brand-mark';
import { brand } from '@/lib/brand';
import { cn } from '@/lib/utils';

type Props = {
    href?: string;
    className?: string;
    markClassName?: string;
    /** Show only the mark (icon) */
    markOnly?: boolean;
    /** Invert colors for dark hero backgrounds */
    inverted?: boolean;
    size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
    sm: { mark: 'size-7', text: 'text-base', pad: 'size-7 rounded-lg' },
    md: { mark: 'size-9', text: 'text-lg', pad: 'size-9 rounded-lg' },
    lg: { mark: 'size-11', text: 'text-xl', pad: 'size-11 rounded-xl' },
} as const;

export default function BrandWordmark({
    href = '/',
    className,
    markClassName,
    markOnly = false,
    inverted = false,
    size = 'md',
}: Props) {
    const s = sizeMap[size];
    const markSize = size === 'sm' ? 'size-7' : size === 'md' ? 'size-9' : 'size-11';

    const content = (
        <>
            {inverted ? (
                <BrandMark framed className={cn(markSize, 'shadow-sm', markClassName)} />
            ) : (
                <span
                    className={cn(
                        'flex items-center justify-center overflow-hidden shadow-sm',
                        s.pad,
                        markClassName,
                    )}
                >
                    <BrandMark framed className="size-full" />
                </span>
            )}
            {!markOnly && (
                <span
                    className={cn(
                        'font-semibold tracking-tight',
                        s.text,
                        inverted ? 'text-white' : 'text-foreground',
                    )}
                >
                    {brand.name}
                </span>
            )}
        </>
    );

    return (
        <Link
            href={href}
            className={cn('inline-flex items-center gap-2.5', className)}
            aria-label={`${brand.name} home`}
        >
            {content}
        </Link>
    );
}
