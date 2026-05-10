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
        Schema::create('rental_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();
            $table->string('status'); // app\Enums\OrderStatus
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->dateTime('actual_return_at')->nullable();
            $table->unsignedBigInteger('total_amount');
            $table->string('rental_unit'); // app\Enums\RentalUnit
            $table->integer('duration');
            $table->boolean('is_out_of_town')->default(false);
            $table->string('pickup_option'); // app\Enums\PickupOption
            $table->text('delivery_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_orders');
    }
};
