<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $account_id
 * @property string $name
 * @property string|null $description
 * @property string $amount
 * @property string $frequency
 * @property \Illuminate\Support\Carbon $next_due_date
 * @property \Illuminate\Support\Carbon|null $last_paid_date
 * @property string $status
 * @property string|null $category
 * @property bool $auto_pay
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable(['user_id', 'account_id', 'name', 'description', 'amount', 'frequency', 'next_due_date', 'last_paid_date', 'status', 'category', 'auto_pay'])]
class Bill extends Model
{
    use HasFactory;

    protected $casts = [
        'amount' => 'decimal:2',
        'next_due_date' => 'date',
        'last_paid_date' => 'date',
        'auto_pay' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
