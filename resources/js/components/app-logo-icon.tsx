import type { SVGAttributes } from 'react';
import BrandMark from '@/components/brand-mark';

/** @deprecated Prefer BrandMark — kept for starter-kit imports. */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return <BrandMark {...props} />;
}
