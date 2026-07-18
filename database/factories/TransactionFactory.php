<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'account_id' => Account::factory(),
            'transaction_type' => fake()->randomElement(['Credit', 'Debit']),
            'amount' => fake()->randomFloat(2, 10, 2000),
            'description' => fake()->sentence(),
        ];
    }
}
