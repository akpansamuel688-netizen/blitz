<?php

namespace App\Support;

final class Money
{
    public static function format(float|string|int $amount, int $decimals = 2): string
    {
        return number_format((float) $amount, $decimals, '.', '');
    }

    public static function toCents(string|int|float $amount): int
    {
        $value = trim((string) $amount);

        if (! preg_match('/^(\d+)(?:\.(\d{1,2}))?$/', $value, $matches)) {
            throw new \InvalidArgumentException('The amount must have at most two decimal places.');
        }

        $whole = (int) $matches[1];
        $fraction = str_pad($matches[2] ?? '', 2, '0');

        return ($whole * 100) + (int) $fraction;
    }

    public static function fromCents(int $cents): string
    {
        return sprintf('%d.%02d', intdiv($cents, 100), abs($cents % 100));
    }
}
