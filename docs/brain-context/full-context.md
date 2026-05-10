# Laravel Brain AI Context
> Project: Laravel | Analyzed: 2026-05-09T20:30:15+00:00 | Focal: Full project summary | Budget: 20000 tokens

## Call Chain (depth ≤ 3)
inspire

## Complexity Hotspots
| Label | Cyclomatic | Lines |
|-------|-----------|-------|
| DriverAssignmentService@assign | 5 | 25 |
| RentalPricingService@calculateQuote | 4 | 47 |
| OrderStatusService@assertCanDispatch | 3 | 18 |
| ReceiptController@show | 2 | 18 |
| RentalPricingService@calculateOvertime | 2 | 20 |
| ShuttlePricingService@calculateQuote | 2 | 17 |
| ReceiptService@generateForPayment | 2 | 13 |
| DashboardController@__invoke | 1 | 25 |
| DriverController@destroy | 1 | 7 |
| DriverController@index | 1 | 14 |
| DriverController@store | 1 | 21 |
| DriverController@update | 1 | 18 |
| OrderLifecycleController@complete | 1 | 9 |
| OrderLifecycleController@dispatch | 1 | 14 |
| OrderLifecycleController@index | 1 | 13 |
| OrderLifecycleController@processReturn | 1 | 24 |
| OrderLifecycleController@show | 1 | 6 |
| OvertimePenaltyController@destroy | 1 | 7 |
| OvertimePenaltyController@store | 1 | 7 |
| OvertimePenaltyController@update | 1 | 7 |
| PaymentVerificationController@approve | 1 | 24 |
| PaymentVerificationController@index | 1 | 12 |
| PaymentVerificationController@reject | 1 | 19 |
| PricingRuleController@destroy | 1 | 7 |
| PricingRuleController@index | 1 | 17 |
| PricingRuleController@store | 1 | 7 |
| PricingRuleController@update | 1 | 7 |
| ReportController@index | 1 | 34 |
| ShuttleTariffController@destroy | 1 | 7 |
| ShuttleTariffController@index | 1 | 11 |
| ShuttleTariffController@store | 1 | 7 |
| ShuttleTariffController@update | 1 | 7 |
| VehicleCategoryController@destroy | 1 | 7 |
| VehicleCategoryController@index | 1 | 12 |
| VehicleCategoryController@store | 1 | 7 |
| VehicleCategoryController@update | 1 | 7 |
| VehicleController@destroy | 1 | 7 |
| VehicleController@index | 1 | 18 |
| VehicleController@store | 1 | 7 |
| VehicleController@update | 1 | 7 |
| CatalogController@index | 1 | 15 |
| CatalogController@show | 1 | 16 |
| RentalOrderController@create | 1 | 14 |
| RentalOrderController@index | 1 | 13 |
| RentalOrderController@show | 1 | 9 |
| RentalOrderController@store | 1 | 59 |
| ShuttleOrderController@create | 1 | 8 |
| ShuttleOrderController@index | 1 | 13 |
| ShuttleOrderController@show | 1 | 9 |
| ShuttleOrderController@store | 1 | 33 |
| UpgradeOfferController@accept | 1 | 12 |
| UpgradeOfferController@reject | 1 | 11 |
| DashboardRedirectController@__invoke | 1 | 12 |
| PaymentController@recordCash | 1 | 29 |
| PaymentController@uploadProof | 1 | 16 |
| RentalOrderLifecycleService@completeOrder | 1 | 10 |
| RentalOrderLifecycleService@dispatch | 1 | 8 |
| RentalOrderLifecycleService@processReturn | 1 | 25 |

## Database Operations
- eloquent payment receipts (via ReceiptController@show)
- eloquent where payments (via DashboardController@__invoke)
- eloquent where vehicles (via DashboardController@__invoke)
- eloquent where drivers (via DashboardController@__invoke)
- eloquent query rental_orders (via DashboardController@__invoke)
- eloquent update drivers (via DriverController@destroy)
- eloquent query drivers (via DriverController@index)
- eloquent create users (via DriverController@store)
- eloquent create drivers (via DriverController@store)
- eloquent update drivers (via DriverController@update)
- eloquent query rental_orders (via OrderLifecycleController@index)
- eloquent where overtime_penalties (via OrderLifecycleController@processReturn)
- eloquent load rental_orders (via OrderLifecycleController@show)
- eloquent delete overtime_penalties (via OvertimePenaltyController@destroy)
- eloquent create overtime_penalties (via OvertimePenaltyController@store)
- eloquent update overtime_penalties (via OvertimePenaltyController@update)
- eloquent update payments (via PaymentVerificationController@approve)
- eloquent generate receipt_number_generators (via PaymentVerificationController@approve)
- eloquent query payments (via PaymentVerificationController@index)
- eloquent update payments (via PaymentVerificationController@reject)
- eloquent delete pricing_rules (via PricingRuleController@destroy)
- eloquent query pricing_rules (via PricingRuleController@index)
- eloquent with overtime_penalties (via PricingRuleController@index)
- eloquent where vehicle_categories (via PricingRuleController@index)
- eloquent create pricing_rules (via PricingRuleController@store)
- eloquent update pricing_rules (via PricingRuleController@update)
- eloquent query rental_orders (via ReportController@index)
- eloquent query payments (via ReportController@index)
- eloquent delete shuttle_tariffs (via ShuttleTariffController@destroy)
- eloquent query shuttle_tariffs (via ShuttleTariffController@index)
- eloquent create shuttle_tariffs (via ShuttleTariffController@store)
- eloquent update shuttle_tariffs (via ShuttleTariffController@update)
- eloquent update vehicle_categories (via VehicleCategoryController@destroy)
- eloquent query vehicle_categories (via VehicleCategoryController@index)
- eloquent create vehicle_categories (via VehicleCategoryController@store)
- eloquent update vehicle_categories (via VehicleCategoryController@update)
- eloquent update vehicles (via VehicleController@destroy)
- eloquent query vehicles (via VehicleController@index)
- eloquent where vehicle_categories (via VehicleController@index)
- eloquent create vehicles (via VehicleController@store)
- eloquent update vehicles (via VehicleController@update)
- eloquent query vehicles (via CatalogController@index)
- eloquent vehicles vehicle_categories (via CatalogController@show)
- eloquent where vehicle_categories (via RentalOrderController@create)
- eloquent where vehicles (via RentalOrderController@create)
- eloquent query rental_orders (via RentalOrderController@index)
- eloquent load rental_orders (via RentalOrderController@show)
- eloquent findOrFail vehicles (via RentalOrderController@store)
- eloquent create rental_orders (via RentalOrderController@store)
- eloquent query pricing_rules (via RentalOrderController@store)
- eloquent getAvailableDrivers driver_availability_services (via RentalOrderController@store)
- eloquent orderBy shuttle_tariffs (via ShuttleOrderController@create)
- eloquent query shuttle_orders (via ShuttleOrderController@index)
- eloquent load shuttle_orders (via ShuttleOrderController@show)
- eloquent findOrFail shuttle_tariffs (via ShuttleOrderController@store)
- eloquent create shuttle_orders (via ShuttleOrderController@store)
- eloquent find shuttle_tariffs (via ShuttleOrderController@store)
- eloquent update upgrade_offers (via UpgradeOfferController@accept)
- eloquent update upgrade_offers (via UpgradeOfferController@reject)
- eloquent update payments (via PaymentController@recordCash)
- eloquent generate receipt_number_generators (via PaymentController@recordCash)
- eloquent update payments (via PaymentController@uploadProof)

## Backend Packages (composer.json)
| Package | Version | Dev |
|---------|---------|-----|
| fakerphp/faker | ^1.24 | yes |
| inertiajs/inertia-laravel | ^3.0 |  |
| laramint/laravel-brain | * | yes |
| laravel/boost | ^2.2 | yes |
| laravel/fortify | ^1.36 |  |
| laravel/framework | ^13.7 |  |
| laravel/pail | ^1.2.5 | yes |
| laravel/pao | ^1.0.6 | yes |
| laravel/pint | ^1.27 | yes |
| laravel/sail | ^1.53 | yes |
| laravel/tinker | ^3.0 |  |
| laravel/wayfinder | ^0.1.14 |  |
| mockery/mockery | ^1.6 | yes |
| nunomaduro/collision | ^8.9.3 | yes |
| pestphp/pest | ^4.7 | yes |
| pestphp/pest-plugin-laravel | ^4.1 | yes |
| spatie/laravel-permission | ^7.4 |  |

## Frontend Packages (package.json)
| Package | Version | Dev |
|---------|---------|-----|
| @eslint/js | ^9.19.0 | yes |
| @headlessui/react | ^2.2.10 |  |
| @inertiajs/react | ^3.0.0 |  |
| @inertiajs/vite | ^3.0.0 |  |
| @laravel/vite-plugin-wayfinder | ^0.1.3 | yes |
| @stylistic/eslint-plugin | ^5.10.0 | yes |
| @tailwindcss/vite | ^4.1.11 |  |
| @types/node | ^22.13.5 | yes |
| @types/react | ^19.2.0 |  |
| @types/react-dom | ^19.2.0 |  |
| @vitejs/plugin-react | ^5.2.0 |  |
| babel-plugin-react-compiler | ^1.0.0 | yes |
| class-variance-authority | ^0.7.1 |  |
| clsx | ^2.1.1 |  |
| concurrently | ^9.0.1 |  |
| eslint | ^9.17.0 | yes |
| eslint-config-prettier | ^10.0.1 | yes |
| eslint-import-resolver-typescript | ^4.4.4 | yes |
| eslint-plugin-import | ^2.32.0 | yes |
| eslint-plugin-react | ^7.37.3 | yes |
| eslint-plugin-react-hooks | ^7.0.0 | yes |
| globals | ^15.14.0 |  |
| laravel-vite-plugin | ^3.1 |  |
| lucide-react | ^1.14.0 |  |
| prettier | ^3.4.2 | yes |
| prettier-plugin-tailwindcss | ^0.6.11 | yes |
| react | ^19.2.0 |  |
| react-dom | ^19.2.0 |  |
| recharts | ^3.8.1 |  |
| tailwind-merge | ^3.0.1 |  |
| tailwindcss | ^4.0.0 |  |
| typescript | ^5.7.2 |  |
| typescript-eslint | ^8.23.0 | yes |
| vite | ^8.0.0 |  |
## Source: inspire
```php
route
```
