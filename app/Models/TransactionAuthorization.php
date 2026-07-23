<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionAuthorization extends Model
{
    protected $fillable = ['user_id', 'purpose', 'fingerprint', 'payload', 'status', 'expires_at', 'completed_at', 'transfer_id'];

    protected function casts(): array
    {
        return ['payload' => 'array', 'expires_at' => 'datetime', 'completed_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function transfer(): BelongsTo { return $this->belongsTo(Transfer::class); }
    public function otpVerifications(): HasMany { return $this->hasMany(OtpVerification::class); }
}
