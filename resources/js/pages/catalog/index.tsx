import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import VehicleCard from '@/components/customer/VehicleCard';
import VehicleModal from '@/components/customer/VehicleModal';
import CustomerLayout from '@/layouts/customer-layout';
import catalog from '@/routes/catalog';

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
        pricingRules?: PricingRule[];
    };
    year: number;
};

type Props = {
    vehicles: Vehicle[];
    filters: { search: string | null };
    rentalUnits: { value: string; label: string }[];
    pickupOptions: { value: string; label: string }[];
};

export default function CatalogIndex({ vehicles, filters, rentalUnits, pickupOptions }: Props) {
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/catalog', { search: searchQuery }, { preserveState: true, replace: true });
    };

    return (
        <CustomerLayout title="Katalog Kendaraan">
            <div className="mb-10 md:mb-16">
                {/* Mobile specific header styling */}
                <div className="md:hidden mb-8">
                    <h1 className="font-serif text-5xl font-extrabold tracking-tight text-navy-blue mb-3">
                        Armada <br/> <span className="text-amber-gold underline decoration-navy-blue/10 underline-offset-8">Penyewaan</span>
                    </h1>
                    <p className="text-base font-medium text-slate-gray max-w-[280px]">
                        Kendaraan premium untuk setiap perjalanan dengan layanan yang tertata.
                    </p>
                </div>

                {/* Desktop specific header styling */}
                <div className="hidden md:flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-navy-blue mb-3">
                            Armada Premium Kami
                        </h1>
                        <p className="text-lg font-medium text-slate-gray max-w-lg">
                            Pilih kendaraan terbaik sesuai kebutuhan perjalanan Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-gray transition-colors group-focus-within:text-navy-blue" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari berdasarkan merek atau model..." 
                                className="w-[320px] rounded-full border-2 border-slate-gray/10 bg-base-white py-3.5 pl-12 pr-6 text-sm font-medium outline-none transition-all focus:border-navy-blue focus:ring-4 focus:ring-navy-blue/5 shadow-sm"
                            />
                        </form>
                        <button className="flex items-center gap-2 rounded-full bg-navy-blue px-6 py-3.5 text-sm font-bold text-base-white transition-all hover:bg-navy-blue/90 hover:shadow-lg shadow-md">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Daftar kendaraan */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {vehicles.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-gray bg-base-white rounded-[24px] border border-slate-gray/10 shadow-sm">
                        Belum ada kendaraan yang tersedia.
                    </div>
                ) : (
                    vehicles.map((vehicle, index) => (
                        <VehicleCard 
                            key={vehicle.id} 
                            vehicle={vehicle} 
                            onClick={() => setSelectedVehicle(vehicle)}
                            bookUrl={catalog.show.url(vehicle.category.id)}
                            isPopular={index === 0}
                            hasFreeUpgrade={index === 2}
                        />
                    ))
                )}
            </div>

            <VehicleModal 
                vehicle={selectedVehicle}
                isOpen={!!selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
                rentalUnits={rentalUnits}
                pickupOptions={pickupOptions}
            />
        </CustomerLayout>
    );
}
