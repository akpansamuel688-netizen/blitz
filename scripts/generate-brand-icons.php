<?php

declare(strict_types=1);

function roundedRect($im, int $x, int $y, int $w, int $h, int $r, int $color): void
{
    imagefilledrectangle($im, $x + $r, $y, $x + $w - $r, $y + $h, $color);
    imagefilledrectangle($im, $x, $y + $r, $x + $w, $y + $h - $r, $color);
    imagefilledellipse($im, $x + $r, $y + $r, $r * 2, $r * 2, $color);
    imagefilledellipse($im, $x + $w - $r, $y + $r, $r * 2, $r * 2, $color);
    imagefilledellipse($im, $x + $r, $y + $h - $r, $r * 2, $r * 2, $color);
    imagefilledellipse($im, $x + $w - $r, $y + $h - $r, $r * 2, $r * 2, $color);
}

function makeIcon(int $size, string $path): void
{
    $base = imagecreatetruecolor($size, $size);

    // Vertical gradient #2563EB → #082B5C
    for ($y = 0; $y < $size; $y++) {
        $t = $y / max(1, $size - 1);
        $r = (int) round(37 + (8 - 37) * $t);
        $g = (int) round(99 + (43 - 99) * $t);
        $b = (int) round(235 + (92 - 235) * $t);
        $col = imagecolorallocate($base, $r, $g, $b);
        imageline($base, 0, $y, $size, $y, $col);
    }

    // Rounded corner mask
    $mask = imagecreatetruecolor($size, $size);
    imagesavealpha($mask, true);
    $clear = imagecolorallocatealpha($mask, 0, 0, 0, 127);
    imagefill($mask, 0, 0, $clear);
    $white = imagecolorallocate($mask, 255, 255, 255);
    $radius = (int) round($size * 0.22);
    roundedRect($mask, 0, 0, $size - 1, $size - 1, $radius, $white);

    $out = imagecreatetruecolor($size, $size);
    imagesavealpha($out, true);
    $transparent = imagecolorallocatealpha($out, 0, 0, 0, 127);
    imagefill($out, 0, 0, $transparent);

    for ($y = 0; $y < $size; $y++) {
        for ($x = 0; $x < $size; $x++) {
            $m = imagecolorsforindex($mask, imagecolorat($mask, $x, $y));
            if ($m['red'] > 200) {
                $src = imagecolorsforindex($base, imagecolorat($base, $x, $y));
                $c = imagecolorallocatealpha($out, $src['red'], $src['green'], $src['blue'], 0);
                imagesetpixel($out, $x, $y, $c);
            }
        }
    }

    // Architectural N (normalized coordinates)
    $bolt = [
        [0.25, 0.75],
        [0.25, 0.25],
        [0.38, 0.25],
        [0.62, 0.58],
        [0.62, 0.25],
        [0.75, 0.25],
        [0.75, 0.75],
        [0.62, 0.75],
        [0.38, 0.42],
        [0.38, 0.75],
    ];

    $points = [];
    foreach ($bolt as [$px, $py]) {
        $points[] = (int) round($px * $size);
        $points[] = (int) round($py * $size);
    }

    $cream = imagecolorallocate($out, 248, 250, 252);
    imagefilledpolygon($out, $points, $cream);

    if (! is_dir(dirname($path))) {
        mkdir(dirname($path), 0777, true);
    }

    imagepng($out, $path, 6);

    imagedestroy($base);
    imagedestroy($mask);
    imagedestroy($out);

    echo "Wrote {$path}\n";
}

$root = dirname(__DIR__);

makeIcon(180, $root.'/public/apple-touch-icon.png');
makeIcon(32, $root.'/public/favicon-32x32.png');
makeIcon(16, $root.'/public/favicon-16x16.png');
makeIcon(192, $root.'/public/images/icon-192.png');
makeIcon(512, $root.'/public/images/icon-512.png');

// Simple multi-size ICO (PNG-in-ICO friendly format for modern browsers)
// Fallback: copy 32px as favicon.ico alternative consumers still pick SVG first.
copy($root.'/public/favicon-32x32.png', $root.'/public/favicon.ico');
echo "Wrote favicon.ico (png payload)\n";
echo "Done.\n";
