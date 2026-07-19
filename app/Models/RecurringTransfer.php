<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $source_account_id
 * @property int $destination_account_id
 * @property string $amount
 * @property string $frequency
 * @property \Illuminate\Support\Carbon $next_transfer_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property string|null $description
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable(['user_id', 'source_account_id', 'destination_account_id', 'amount', 'frequency', 'next_transfer_date', 'end_date', 'description', 'is_active'])]
class RecurringTransfer extends Model
{
    use HasFactory;

    protected $casts = [
        'amount' => 'decimal:2',
        'next_transfer_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'source_account_id');
    }

    public function destinationAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'destination_account_id');
    }
}
