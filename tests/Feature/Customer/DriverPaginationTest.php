<?php

use App\Enums\DriverStatus;
use App\Models\Driver;
use Inertia\Testing\AssertableInertia as Assert;

test('public drivers page paginates six cards per page', function (): void {
    Driver::factory()->count(7)->create([
        'status' => DriverStatus::Available,
    ]);

    $this->get(route('drivers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/drivers/index')
            ->has('drivers.data', 6)
            ->where('drivers.per_page', 6)
            ->where('drivers.last_page', 2)
        );
});
