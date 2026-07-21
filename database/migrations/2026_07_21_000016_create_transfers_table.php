<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('source_account_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignId('destination_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('transfer_type'); // internal, domestic, wire
            $table->string('status')->default('pending'); // pending, completed, failed
            $table->decimal('amount', 18, 2);
            $table->string('currency', 3);
            $table->string('recipient_name')->nullable();
            $table->string('recipient_account_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('swift_bic', 11)->nullable();
            $table->string('iban', 34)->nullable();
            $table->string('description')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'transfer_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
