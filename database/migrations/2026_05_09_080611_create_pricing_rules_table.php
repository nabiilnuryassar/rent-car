<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_category_id')->constrained()->cascadeOnDelete();
            $table->string('rental_unit'); // app\Enums\RentalUnit
            $table->integer('min_duration');
            $table->integer('max_duration');
            $table->unsignedBigInteger('base_rate');
            $table->decimal('discount_rate', 5, 2)->default(0);
            $table->decimal('out_of_town_surcharge_rate', 5, 2)->default(0.20);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
