<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'transfer_type', 'name', 'account_number', 'bank_name', 'swift_bic', 'iban'])]
class Beneficiary extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
