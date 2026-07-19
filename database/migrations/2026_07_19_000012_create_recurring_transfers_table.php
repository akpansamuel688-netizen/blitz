<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('source_account_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignId('destination_account_id')->constrained('accounts')->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->string('frequency'); // daily, weekly, biweekly, monthly
            $table->date('next_transfer_date');
            $table->date('end_date')->nullable();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_transfers');
    }
};
