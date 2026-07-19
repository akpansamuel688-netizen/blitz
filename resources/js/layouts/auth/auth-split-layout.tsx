import { Link, usePage } from '@inertiajs/react';
import BrandMark from '@/components/brand-mark';
import { brand } from '@/lib/brand';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const productName = typeof name === 'string' && name.length > 0 ? name : brand.name;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-[oklch(0.22_0.05_195)]" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand/40 via-transparent to-black/20" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-2.5 text-lg font-semibold tracking-tight"
                >
                    <BrandMark framed className="size-9 shadow-sm" />
                    {productName}
                </Link>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed text-white/95">
                            “{brand.tagline}”
                        </p>
                        <p className="text-sm text-white/60">
                            Personal & SME banking — accounts, transfers, and security in one place.
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <BrandMark framed className="size-10 shadow-sm" />
                        <span className="font-semibold tracking-tight">{productName}</span>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
