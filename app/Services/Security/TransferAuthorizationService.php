<?php

namespace App\Services\Security;

use App\Models\OtpVerification;
use App\Models\TransactionAuthorization;
use App\Models\User;
use Illuminate\Http\Request;

class TransferAuthorizationService
{
    /** @param array<string, mixed> $payload */
    public function start(User $user, array $payload, Request $request): TransactionAuthorization
    {
        $payload = $this->normalize($payload);
        $authorization = TransactionAuthorization::query()->create([
            'user_id' => $user->id,
            'purpose' => OtpVerification::TRANSFER,
            'fingerprint' => hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR)),
            'payload' => $payload,
            'expires_at' => now()->addMinutes(OtpService::EXPIRES_IN_MINUTES),
        ]);

        app(OtpService::class)->issue($user, OtpVerification::TRANSFER, $this->mailContext($payload), $authorization, $request);
        return $authorization;
    }

    /** @param array<string, mixed> $payload */
    public function mailContext(array $payload): array
    {
        return [
            'type' => ucfirst((string) $payload['transfer_type']).' transfer',
            'amount' => (string) $payload['amount'],
            'from' => '****'.substr((string) ($payload['source_account_number'] ?? ''), -4),
            'to' => '****'.substr((string) ($payload['destination_account_number'] ?? $payload['recipient_account_number'] ?? $payload['iban'] ?? ''), -4),
        ];
    }

    /** @param array<string, mixed> $payload */
    private function normalize(array $payload): array
    {
        ksort($payload);
        return $payload;
    }
}
