import { Link } from '@inertiajs/react';
import VehicleCard from '@/components/customer/VehicleCard';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

type PricingRule = {
    rental_unit: 'hourly' | 'daily' | 'weekly' | 'monthly';
    base_rate: number;
};

type Vehicle = {
    id: number;
    brand: string;
    model: string;
    status: string;
    category: {
        id: number;
        name: string;
    };
};

type Props = {
    category: { id: number; name: string };
    vehicles: Vehicle[];
    pricingRules: PricingRule[];
};

export default function CatalogShow({ category, vehicles, pricingRules }: Props) {
    return (
        <CustomerLayout title={`${category.name} Selection`}>
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-navy-blue mb-2">
                        {category.name} Collection
                    </h1>
                    <p className="text-sm text-slate-gray">
                        Available vehicles in this category for your booking.
                    </p>
                </div>
                <Link 
                    href={customer.rentalOrders.create.url()}
                    className="rounded-full bg-navy-blue px-6 py-3 text-sm font-bold text-base-white shadow-md hover:bg-navy-blue/90 transition-all"
                >
                    Proceed to Booking →
                </Link>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {vehicles.map((vehicle) => (
                    <VehicleCard 
                        key={vehicle.id} 
                        vehicle={{
                            ...vehicle,
                            category: {
                                ...vehicle.category,
                                pricingRules
                            }
                        }}
                    />
                ))}
            </div>
        </CustomerLayout>
    );
}
