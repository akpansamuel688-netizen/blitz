<?php
namespace App\Mail;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
class OtpVerificationMail extends Mailable { use Queueable, SerializesModels; /** @param array<string,mixed> $context */ public function __construct(public User $user, public string $code, public string $purpose, public array $context = []) {} public function build(): self { return $this->subject('Your Blitz Security Verification Code')->view('emails.otp-verification'); } }
