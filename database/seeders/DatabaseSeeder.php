<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Bill;
use App\Models\Budget;
use App\Models\RecurringTransfer;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\TransactionCategory;
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
        $admin = User::factory()->admin()->create([
            'name' => 'Blitz Admin',
            'email' => 'admin@blitz.test',
        ]);

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->seedCustomerPortfolio($admin, [
            ['name' => 'Admin Operating', 'type' => 'Checking', 'balance' => 8420.15, 'number' => '9000000001'],
            ['name' => 'Admin Reserve', 'type' => 'Savings', 'balance' => 25000.00, 'number' => '9000000002'],
        ]);

        $this->seedCustomerPortfolio($user, [
            ['name' => 'Everyday Checking', 'type' => 'Checking', 'balance' => 5342.72, 'number' => '1234567890'],
            ['name' => 'Reserve Savings', 'type' => 'Savings', 'balance' => 12984.50, 'number' => '0987654321'],
        ], richActivity: true);

        User::factory()
            ->count(6)
            ->create()
            ->each(function (User $customer) {
                $checking = Account::factory()->for($customer)->create([
                    'type' => 'Checking',
                    'balance' => fake()->randomFloat(2, 200, 8000),
                ]);

                $savings = Account::factory()->for($customer)->create([
                    'type' => 'Savings',
                    'balance' => fake()->randomFloat(2, 500, 20000),
                ]);

                Transaction::factory()->count(3)->for($checking)->create();
                Transaction::factory()->count(2)->for($savings)->create();
            });
    }

    /**
     * @param  list<array{name: string, type: string, balance: float, number: string}>  $accounts
     */
    private function seedCustomerPortfolio(User $user, array $accounts, bool $richActivity = false): void
    {
        $created = [];

        foreach ($accounts as $definition) {
            $created[] = Account::factory()->for($user)->create([
                'name' => $definition['name'],
                'type' => $definition['type'],
                'balance' => $definition['balance'],
                'account_number' => $definition['number'],
            ]);
        }

        if (! $richActivity || count($created) < 2) {
            return;
        }

        [$checking, $savings] = $created;

        $groceries = TransactionCategory::query()->create([
            'user_id' => $user->id,
            'name' => 'Groceries',
            'color' => '#0F6B66',
        ]);

        $income = TransactionCategory::query()->create([
            'user_id' => $user->id,
            'name' => 'Income',
            'color' => '#10B981',
        ]);

        Transaction::create([
            'account_id' => $checking->id,
            'category_id' => $groceries->id,
            'transaction_type' => 'Debit',
            'amount' => 72.34,
            'description' => 'Groceries at Market Street',
            'created_at' => now()->subDays(1),
            'updated_at' => now()->subDays(1),
        ]);

        Transaction::create([
            'account_id' => $checking->id,
            'category_id' => $income->id,
            'transaction_type' => 'Credit',
            'amount' => 1250.00,
            'description' => 'Direct deposit payroll',
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        Transaction::create([
            'account_id' => $savings->id,
            'transaction_type' => 'Credit',
            'amount' => 200.00,
            'description' => 'Automatic savings transfer',
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        Transaction::create([
            'account_id' => $checking->id,
            'transaction_type' => 'Debit',
            'amount' => 89.00,
            'description' => 'Software subscription',
            'created_at' => now()->subDays(4),
            'updated_at' => now()->subDays(4),
        ]);

        Transaction::create([
            'account_id' => $checking->id,
            'category_id' => $income->id,
            'transaction_type' => 'Credit',
            'amount' => 480.00,
            'description' => 'Client invoice payment',
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subDays(5),
        ]);

        Bill::query()->create([
            'user_id' => $user->id,
            'account_id' => $checking->id,
            'name' => 'Electric utility',
            'amount' => 118.50,
            'frequency' => 'monthly',
            'next_due_date' => now()->addDays(8)->toDateString(),
            'status' => 'pending',
            'category' => 'Utilities',
            'auto_pay' => false,
        ]);

        Budget::query()->create([
            'user_id' => $user->id,
            'category_id' => $groceries->id,
            'name' => 'Grocery budget',
            'limit' => 400,
            'period' => 'monthly',
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'spent' => 72.34,
            'is_active' => true,
        ]);

        RecurringTransfer::query()->create([
            'user_id' => $user->id,
            'source_account_id' => $checking->id,
            'destination_account_id' => $savings->id,
            'amount' => 150,
            'frequency' => 'monthly',
            'next_transfer_date' => now()->addDays(3)->toDateString(),
            'description' => 'Pay yourself first',
            'is_active' => true,
        ]);

        SavingsGoal::query()->create([
            'user_id' => $user->id,
            'account_id' => $savings->id,
            'name' => 'Emergency fund',
            'description' => 'Three months of operating runway',
            'target_amount' => 15000,
            'current_amount' => 4200,
            'target_date' => now()->addMonths(10)->toDateString(),
            'status' => 'active',
            'color' => '#0F6B66',
        ]);
    }
}
