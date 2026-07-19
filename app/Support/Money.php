<?php

namespace App\Support;

final class Money
{
    public static function format(float|string|int $amount, int $decimals = 2): string
    {
        return number_format((float) $amount, $decimals, '.', '');
    }
}
