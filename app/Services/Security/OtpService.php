<?php

namespace App\Services\Security;

use App\Mail\OtpVerificationMail;
use App\Models\OtpSecurityEvent;
use App\Models\OtpVerification;
use App\Models\TransactionAuthorization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public const EXPIRES_IN_MINUTES = 5;
    public const RESEND_DELAY_SECONDS = 60;
    public const MAX_SENDS_PER_WINDOW = 3;

    /** @param array<string, mixed> $context */
    public function issue(User $user, string $purpose, array $context = [], ?TransactionAuthorization $authorization = null, ?Request $request = null): OtpVerification
    {
        abort_unless(in_array($purpose, OtpVerification::PURPOSES, true), 422);

        $recentSends = OtpVerification::query()
            ->where('user_id', $user->id)->where('purpose', $purpose)
            ->where('created_at', '>=', now()->subMinutes(10))->count();
        if ($recentSends >= self::MAX_SENDS_PER_WINDOW) {
            throw ValidationException::withMessages(['otp' => 'Too many codes have been requested. Please try again in a few minutes.']);
        }

        OtpVerification::query()->where('user_id', $user->id)->where('purpose', $purpose)
            ->when($authorization, fn ($query) => $query->where('transaction_authorization_id', $authorization->id), fn ($query) => $query->whereNull('transaction_authorization_id'))
            ->where('status', 'pending')->update(['status' => 'invalidated', 'invalidated_at' => now()]);

        $code = (string) random_int(100000, 999999);
        $verification = OtpVerification::query()->create([
            'user_id' => $user->id,
            'transaction_authorization_id' => $authorization?->id,
            'purpose' => $purpose,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::EXPIRES_IN_MINUTES),
            'last_sent_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);

        $this->event($verification, 'requested');
        Mail::to($user->email)->send(new OtpVerificationMail($user, $code, $purpose, $context));
        $this->event($verification, 'sent');

        return $verification;
    }

    public function resend(OtpVerification $current, array $context = [], ?Request $request = null): OtpVerification
    {
        if ($current->last_sent_at?->gt(now()->subSeconds(self::RESEND_DELAY_SECONDS))) {
            throw ValidationException::withMessages(['otp' => 'Please wait one minute before requesting another code.']);
        }

        $this->event($current, 'resend');
        return $this->issue($current->user, $current->purpose, $context, $current->authorization, $request);
    }

    public function verify(OtpVerification $verification, string $code): bool
    {
        $verification->refresh();
        if ($verification->status !== 'pending') {
            return false;
        }
        if ($verification->expires_at->isPast()) {
            $verification->update(['status' => 'expired']);
            $this->event($verification, 'expired');
            return false;
        }
        if ($verification->attempt_count >= $verification->maximum_attempts) {
            $verification->update(['status' => 'failed']);
            $this->event($verification, 'failed');
            return false;
        }

        $verification->increment('attempt_count');
        if (! Hash::check($code, $verification->code_hash)) {
            if ($verification->fresh()->attempt_count >= $verification->maximum_attempts) {
                $verification->update(['status' => 'failed']);
            }
            $this->event($verification, 'verification_failed');
            return false;
        }

        $verification->update(['status' => 'verified', 'verified_at' => now()]);
        $this->event($verification, 'verified');
        return true;
    }

    public function invalidate(OtpVerification $verification): void
    {
        if ($verification->status === 'pending') {
            $verification->update(['status' => 'invalidated', 'invalidated_at' => now()]);
            $this->event($verification, 'invalidated');
        }
    }

    private function event(OtpVerification $verification, string $event): void
    {
        OtpSecurityEvent::query()->create(['otp_verification_id' => $verification->id, 'user_id' => $verification->user_id, 'event' => $event]);
    }
}
