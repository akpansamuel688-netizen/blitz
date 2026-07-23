<?php
namespace App\Http\Controllers\Security;
use App\Http\Controllers\Controller;
use App\Models\OtpVerification;
use App\Models\TransactionAuthorization;
use App\Services\Banking\TransferService;
use App\Services\Security\OtpService;
use App\Services\Security\TransferAuthorizationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransactionOtpController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        [$authorization, $verification] = $this->active($request);
        if (! $authorization || ! $verification) return redirect()->route('transfers.index');
        $email = $request->user()->email; [$name, $domain] = array_pad(explode('@', $email, 2), 2, '');
        return Inertia::render('auth/otp-verification', ['flow' => 'transaction', 'maskedEmail' => substr($name, 0, 2).str_repeat('*', max(3, strlen($name) - 2)).'@'.$domain, 'expiresAt' => $verification->expires_at->toIso8601String(), 'attemptsRemaining' => max(0, $verification->maximum_attempts - $verification->attempt_count), 'transaction' => app(TransferAuthorizationService::class)->mailContext($authorization->payload)]);
    }

    public function verify(Request $request, OtpService $otp, TransferService $transfers): RedirectResponse
    {
        $request->validate(['code' => ['required', 'digits:6']]);
        [$authorization, $verification] = $this->active($request);
        if (! $authorization || ! $verification || ! $otp->verify($verification, $request->string('code')->toString())) throw ValidationException::withMessages(['code' => ['The verification code is invalid, expired, or has already been used.']]);
        if ($authorization->expires_at->isPast() || $authorization->status !== 'pending') return redirect()->route('transfers.index')->with('error', 'This transfer authorization is no longer active.');
        try {
            $transfer = $transfers->create($request->user(), $authorization->payload);
            $authorization->update(['status' => 'completed', 'completed_at' => now(), 'transfer_id' => $transfer->id]);
            $request->session()->forget('otp_transaction_authorization_id');
            return redirect()->route('transfers.index')->with('success', 'Transfer completed successfully.');
        } catch (\Throwable $exception) {
            $authorization->update(['status' => 'failed']);
            report($exception);
            throw $exception;
        }
    }

    public function resend(Request $request, OtpService $otp, TransferAuthorizationService $authorizations): RedirectResponse
    {
        [$authorization, $verification] = $this->active($request);
        if (! $authorization || ! $verification) return redirect()->route('transfers.index');
        $replacement = $otp->resend($verification, $authorizations->mailContext($authorization->payload), $request);
        $request->session()->put('otp_transaction_verification_id', $replacement->id);
        return back()->with('status', 'A new verification code has been sent.');
    }

    /** @return array{0: ?TransactionAuthorization,1: ?OtpVerification} */
    private function active(Request $request): array
    {
        $authorizationId = $request->session()->get('otp_transaction_authorization_id');
        $verificationId = $request->session()->get('otp_transaction_verification_id');
        $authorization = $authorizationId ? TransactionAuthorization::query()->whereKey($authorizationId)->where('user_id', $request->user()->id)->first() : null;
        $verification = $authorization && $verificationId ? OtpVerification::query()->whereKey($verificationId)->where('transaction_authorization_id', $authorization->id)->first() : null;
        return [$authorization, $verification];
    }
}
