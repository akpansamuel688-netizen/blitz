<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtpSecurityEvent extends Model
{
    public const UPDATED_AT = null;
    protected $fillable = ['otp_verification_id', 'user_id', 'event', 'metadata'];
    protected function casts(): array { return ['metadata' => 'array']; }
    public function verification(): BelongsTo { return $this->belongsTo(OtpVerification::class, 'otp_verification_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
