import { Link } from '@inertiajs/react';
import VehicleCard from '@/components/customer/VehicleCard';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

type PricingRule = {
    rental_unit: 'hour' | 'day' | 'week' | 'month';
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
        <CustomerLayout title={`Pilihan ${category.name}`}>
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-navy-blue mb-2">
                        Koleksi {category.name}
                    </h1>
                    <p className="text-sm text-slate-gray">
                        Kendaraan yang tersedia pada kategori ini untuk kebutuhan pemesanan Anda.
                    </p>
                </div>
                <Link 
                    href={customer.orders.index.url({ query: { new: 1 } })}
                    className="rounded-full bg-navy-blue px-6 py-3 text-sm font-bold text-base-white shadow-md hover:bg-navy-blue/90 transition-all"
                >
                    Lanjutkan Pemesanan
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
