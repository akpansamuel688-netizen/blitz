<?php

namespace Tests\Feature\Banking;

use App\Models\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransferTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_complete_internal_transfer_and_create_balanced_ledger_entries(): void
    {
        $user = User::factory()->create();
        $source = Account::factory()->for($user)->create(['balance' => '100.00', 'currency' => 'USD']);
        $destination = Account::factory()->for($user)->create(['balance' => '20.00', 'currency' => 'USD']);

        $this->actingAs($user)->post(route('transfers.store'), [
            'transfer_type' => 'internal',
            'source_account_id' => $source->id,
            'destination_account_id' => $destination->id,
            'amount' => '25.50',
            'description' => 'Monthly savings',
        ])->assertRedirect();

        $this->assertDatabaseHas('accounts', ['id' => $source->id, 'balance' => '74.50']);
        $this->assertDatabaseHas('accounts', ['id' => $destination->id, 'balance' => '45.50']);
        $this->assertDatabaseHas('transfers', ['user_id' => $user->id, 'transfer_type' => 'internal', 'status' => 'completed']);
        $this->assertDatabaseCount('transactions', 2);
    }

    public function test_user_can_send_domestic_and_wire_transfers(): void
    {
        $user = User::factory()->create();
        $source = Account::factory()->for($user)->create(['balance' => '1000.00', 'currency' => 'USD']);

        $this->actingAs($user)->post(route('transfers.store'), [
            'transfer_type' => 'domestic', 'source_account_id' => $source->id, 'amount' => '150.00',
            'recipient_name' => 'Taylor Smith', 'recipient_account_number' => '1234567890', 'bank_name' => 'Example Bank',
        ])->assertRedirect();

        $this->post(route('transfers.store'), [
            'transfer_type' => 'wire', 'source_account_id' => $source->id, 'amount' => '200.00',
            'recipient_name' => 'Avery Jones', 'wire_bank_name' => 'International Bank',
            'swift_bic' => 'DEUTDEFF', 'iban' => 'DE89370400440532013000',
        ])->assertRedirect();

        $this->assertDatabaseHas('accounts', ['id' => $source->id, 'balance' => '650.00']);
        $this->assertDatabaseHas('transfers', ['transfer_type' => 'domestic', 'bank_name' => 'Example Bank', 'status' => 'completed']);
        $this->assertDatabaseHas('transfers', ['transfer_type' => 'wire', 'swift_bic' => 'DEUTDEFF', 'status' => 'completed']);
        $this->assertDatabaseCount('transactions', 2);
    }

    public function test_transfer_is_rejected_when_source_balance_is_insufficient(): void
    {
        $user = User::factory()->create();
        $source = Account::factory()->for($user)->create(['balance' => '10.00']);
        $destination = Account::factory()->for($user)->create(['balance' => '0.00']);

        $this->actingAs($user)->from(route('transfers.index'))->post(route('transfers.store'), [
            'transfer_type' => 'internal', 'source_account_id' => $source->id,
            'destination_account_id' => $destination->id, 'amount' => '10.01',
        ])->assertSessionHasErrors('amount');

        $this->assertDatabaseHas('accounts', ['id' => $source->id, 'balance' => '10.00']);
        $this->assertDatabaseCount('transfers', 0);
        $this->assertDatabaseCount('transactions', 0);
    }
}
