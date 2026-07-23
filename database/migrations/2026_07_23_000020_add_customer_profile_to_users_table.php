<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('middle_name')->nullable()->after('first_name');
            $table->string('last_name')->nullable()->after('middle_name');
            $table->date('date_of_birth')->nullable()->after('last_name');
            $table->text('tax_id')->nullable()->after('date_of_birth');
            $table->string('phone', 30)->nullable()->after('tax_id');
            $table->string('street_address')->nullable()->after('phone');
            $table->string('address_line_two')->nullable()->after('street_address');
            $table->string('city')->nullable()->after('address_line_two');
            $table->string('state', 100)->nullable()->after('city');
            $table->string('postal_code', 20)->nullable()->after('state');
            $table->string('country', 100)->nullable()->after('postal_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name', 'middle_name', 'last_name', 'date_of_birth', 'tax_id', 'phone',
                'street_address', 'address_line_two', 'city', 'state', 'postal_code', 'country',
            ]);
        });
    }
};
