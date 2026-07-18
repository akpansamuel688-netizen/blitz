<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->company() . ' Account',
            'account_number' => fake()->unique()->numerify('##########'),
            'type' => fake()->randomElement(['Checking', 'Savings']),
            'currency' => 'USD',
            'balance' => fake()->randomFloat(2, 100, 10000),
        ];
    }
}
