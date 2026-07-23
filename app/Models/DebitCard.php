<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'account_id', 'card_type', 'status', 'card_number_hash', 'card_number', 'cvv', 'last_four', 'expires_at'])]
class DebitCard extends Model
{
    protected function casts(): array
    {
        return ['card_number' => 'encrypted', 'cvv' => 'encrypted', 'expires_at' => 'date'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function account(): BelongsTo { return $this->belongsTo(Account::class); }
}
