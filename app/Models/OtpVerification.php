<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OtpVerification extends Model
{
    public const LOGIN = 'login';
    public const TRANSFER = 'transfer';
    public const PURPOSES = [self::LOGIN, self::TRANSFER];

    protected $fillable = ['user_id', 'transaction_authorization_id', 'purpose', 'code_hash', 'development_code', 'status', 'attempt_count', 'maximum_attempts', 'expires_at', 'verified_at', 'invalidated_at', 'last_sent_at', 'ip_address', 'user_agent'];
    protected $hidden = ['code_hash', 'development_code'];

    protected function casts(): array
    {
        return ['development_code' => 'encrypted', 'expires_at' => 'datetime', 'verified_at' => 'datetime', 'invalidated_at' => 'datetime', 'last_sent_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function authorization(): BelongsTo { return $this->belongsTo(TransactionAuthorization::class, 'transaction_authorization_id'); }
    public function events(): HasMany { return $this->hasMany(OtpSecurityEvent::class); }
}
