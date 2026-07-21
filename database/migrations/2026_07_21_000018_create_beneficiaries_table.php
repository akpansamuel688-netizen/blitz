<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('transfer_type');
            $table->string('name');
            $table->string('account_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('swift_bic', 11)->nullable();
            $table->string('iban', 34)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'transfer_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};
