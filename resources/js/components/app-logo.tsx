import BrandMark from '@/components/brand-mark';
import { brand } from '@/lib/brand';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md shadow-sm">
                <BrandMark framed className="size-full" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold tracking-tight">
                    {brand.name}
                </span>
            </div>
        </>
    );
}
