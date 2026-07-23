<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debit_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('card_type');
            $table->string('status');
            $table->string('card_number_hash', 64)->unique();
            $table->text('card_number')->nullable();
            $table->text('cvv')->nullable();
            $table->string('last_four', 4);
            $table->date('expires_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'card_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debit_cards');
    }
};
