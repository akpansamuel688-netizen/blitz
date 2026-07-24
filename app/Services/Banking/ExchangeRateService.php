<?php

namespace App\Services\Banking;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class ExchangeRateService
{
    /**
     * @return array{rate: float, date: string, recipient_amount: string}
     */
    public function quote(string $base, string $quote, string $amount): array
    {
        $base = strtoupper($base);
        $quote = strtoupper($quote);

        if ($base === $quote) {
            return [
                'rate' => 1.0,
                'date' => now()->toDateString(),
                'recipient_amount' => number_format((float) $amount, 2, '.', ''),
            ];
        }

        $response = Http::acceptJson()
            ->timeout(5)
            ->retry(2, 150)
            ->get(rtrim((string) config('wire.rate_url'), '/')."/{$base}/{$quote}");

        if (! $response->successful() || ! is_numeric($response->json('rate'))) {
            throw new RuntimeException('An exchange-rate quote is temporarily unavailable.');
        }

        $rate = (float) $response->json('rate');

        return [
            'rate' => $rate,
            'date' => (string) ($response->json('date') ?: now()->toDateString()),
            'recipient_amount' => number_format(((float) $amount) * $rate, 2, '.', ''),
        ];
    }
}
