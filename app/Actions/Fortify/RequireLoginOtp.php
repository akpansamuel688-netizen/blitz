<?php
namespace App\Actions\Fortify;
use App\Models\OtpVerification;
use App\Models\User;
use App\Services\Security\OtpService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\LoginRateLimiter;
class RequireLoginOtp { public function __construct(private readonly LoginRateLimiter $limiter, private readonly OtpService $otp) {} public function handle(Request $request, Closure $next): mixed { $email = mb_strtolower((string) $request->input('email')); $user = User::query()->where('email', $email)->first(); if (! $user || ! Hash::check((string) $request->input('password'), $user->password)) { $this->limiter->increment($request); throw ValidationException::withMessages(['email' => [trans('auth.failed')]]); } $this->limiter->clear($request); $verification = $this->otp->issue($user, OtpVerification::LOGIN, [], null, $request); $request->session()->put('otp_login', ['verification_id' => $verification->id, 'user_id' => $user->id, 'remember' => $request->boolean('remember')]); return redirect()->route('security.login.show'); } }
