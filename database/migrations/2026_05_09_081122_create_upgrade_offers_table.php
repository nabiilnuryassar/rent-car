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
        Schema::create('upgrade_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rental_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('original_vehicle_category_id')->constrained('vehicle_categories')->cascadeOnDelete();
            $table->foreignId('upgraded_vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->string('status'); // app\Enums\OfferStatus
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upgrade_offers');
    }
};
