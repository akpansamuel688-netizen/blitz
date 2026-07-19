import type { SVGAttributes } from 'react';
import BrandMark from '@/components/brand-mark';

type Props = SVGAttributes<SVGElement> & {
    framed?: boolean;
};

/** Prefer BrandMark — kept for existing starter-kit imports. */
export default function AppLogoIcon({ framed = false, ...props }: Props) {
    return <BrandMark framed={framed} {...props} />;
}
