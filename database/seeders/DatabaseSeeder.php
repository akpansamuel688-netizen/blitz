<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $checking = Account::factory()->for($user)->create([
            'name' => 'Everyday Checking',
            'type' => 'Checking',
            'balance' => 5342.72,
            'account_number' => '1234567890',
        ]);

        $savings = Account::factory()->for($user)->create([
            'name' => 'Reserve Savings',
            'type' => 'Savings',
            'balance' => 12984.50,
            'account_number' => '0987654321',
        ]);

        Transaction::create([
            'account_id' => $checking->id,
            'transaction_type' => 'Debit',
            'amount' => 72.34,
            'description' => 'Groceries at Market Street',
        ]);

        Transaction::create([
            'account_id' => $checking->id,
            'transaction_type' => 'Credit',
            'amount' => 1250.00,
            'description' => 'Direct deposit payroll',
        ]);

        Transaction::create([
            'account_id' => $savings->id,
            'transaction_type' => 'Credit',
            'amount' => 200.00,
            'description' => 'Automatic savings transfer',
        ]);
    }
}
