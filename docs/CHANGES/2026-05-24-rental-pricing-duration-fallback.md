# Rental Pricing Duration Fallback & Route Binding Test Fixes

Date: 2026-05-24  
Area: backend  
Type: fix  

## Context

When a customer books a vehicle with a duration that exceeds the maximum duration specified in the database's `pricing_rules` table (e.g., booking for 5 weeks when the seeded weekly rule maxes out at 3 weeks), the application previously threw an `InvalidArgumentException` saying no pricing rule was found. 

Instead, the pricing engine should gracefully fall back to the highest available duration tier configured for that unit and category.

Additionally, existing customer order tests were failing due to:
1. Routing bound to `{order:order_number}` while test requests hardcoded `id`.
2. Registration tests using simple password `'password'` which failed the updated password strength rules.

## What changed

- **`app/Services/Pricing/RentalPricingService.php`**: Implemented a fallback query that retrieves the pricing rule with the highest `max_duration` for a vehicle category and rental unit if no exact range-matching rule is found.
- **`tests/Unit/RentalPricingServiceTest.php`**: Updated unit tests to verify the fallback logic works as intended and only throws `InvalidArgumentException` when no rules exist at all for that rental unit.
- **`tests/Feature/CustomerOrderFlowTest.php`** and **`tests/Feature/OrderCancellationTest.php`**: Fixed test HTTP requests to hit endpoints using `$order->order_number` instead of `$order->id` to match the route-model binding.
- **`tests/Feature/Auth/FortifyAuthenticationTest.php`**: Updated registration test passwords to `'Password123!'` to satisfy the mixed case and symbol constraints.

## Impact

- Customers can now book vehicles for any duration length without encountering system errors, keeping the best rate from the highest duration tier.
- Complete feature and unit test coverage is fully passing (98/98 tests).

## How to test

Run the following command in the workspace to verify all tests pass:

```bash
php artisan test --compact
```

## Rollback plan

- Revert the changes in `app/Services/Pricing/RentalPricingService.php` and tests using git.
