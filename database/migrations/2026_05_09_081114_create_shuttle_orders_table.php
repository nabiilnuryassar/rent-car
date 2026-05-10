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
        Schema::create('shuttle_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shuttle_tariff_id')->constrained()->cascadeOnDelete();
            $table->string('pickup_address');
            $table->string('destination_address');
            $table->decimal('estimated_distance_km', 8, 2);
            $table->integer('estimated_duration_minutes');
            $table->dateTime('scheduled_at');
            $table->string('status'); // app\Enums\OrderStatus
            $table->unsignedBigInteger('total_amount');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shuttle_orders');
    }
};
