import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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

type Category = {
    id: number;
    name: string;
    class_level: number;
};

type Driver = {
    id: number;
    professional_title: string | null;
    experience_years: number;
    user: { name: string };
};

type Filters = {
    search: string | null;
    category: number | null;
    min_price: number | null;
    max_price: number | null;
    min_year: number | null;
};

type Props = {
    vehicles: Vehicle[];
    categories: Category[];
    drivers: Driver[];
    filters: Filters;
    rentalUnits: { value: string; label: string }[];
    pickupOptions: { value: string; label: string }[];
};

type FilterState = {
    search: string;
    category: string;
    min_price: string;
    max_price: string;
    min_year: string;
};

const emptyFilters = (filters: Filters): FilterState => ({
    search: filters.search ?? '',
    category: filters.category != null ? String(filters.category) : '',
    min_price: filters.min_price != null ? String(filters.min_price) : '',
    max_price: filters.max_price != null ? String(filters.max_price) : '',
    min_year: filters.min_year != null ? String(filters.min_year) : '',
});

export default function CatalogIndex({ vehicles, categories, drivers, filters, rentalUnits, pickupOptions }: Props) {
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [state, setState] = useState<FilterState>(emptyFilters(filters));

    const hasActiveFilters =
        !!state.category || !!state.min_price || !!state.max_price || !!state.min_year || !!state.search;

    const applyFilters = (overrides: Partial<FilterState> = {}) => {
        const merged = { ...state, ...overrides };

        const params: Record<string, string> = {};

        if (merged.search) {
params.search = merged.search;
}

        if (merged.category) {
params.category = merged.category;
}

        if (merged.min_price) {
params.min_price = merged.min_price;
}

        if (merged.max_price) {
params.max_price = merged.max_price;
}

        if (merged.min_year) {
params.min_year = merged.min_year;
}

        router.get(catalog.index.url(), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const cleared: FilterState = { search: '', category: '', min_price: '', max_price: '', min_year: '' };
        setState(cleared);
        applyFilters(cleared);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
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
                                value={state.search}
                                onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
                                placeholder="Cari berdasarkan merek atau model..."
                                className="w-[320px] rounded-full border-2 border-slate-gray/10 bg-base-white py-3.5 pl-12 pr-6 text-sm font-medium outline-none transition-all focus:border-navy-blue focus:ring-4 focus:ring-navy-blue/5 shadow-sm"
                            />
                        </form>
                        <button
                            type="button"
                            onClick={() => setShowFilterPanel((v) => !v)}
                            className={`flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold shadow-md transition-all ${
                                showFilterPanel || hasActiveFilters
                                    ? 'bg-amber-gold text-navy-blue hover:bg-amber-gold/90'
                                    : 'bg-navy-blue text-base-white hover:bg-navy-blue/90 hover:shadow-lg'
                            }`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter{hasActiveFilters ? ' Aktif' : ''}
                        </button>
                    </div>
                </div>

                {/* Mobile search */}
                <div className="md:hidden mb-6 flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-gray" />
                        <input
                            type="text"
                            value={state.search}
                            onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
                            placeholder="Cari kendaraan..."
                            className="w-full rounded-full border-2 border-slate-gray/10 bg-base-white py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-navy-blue"
                        />
                    </form>
                    <button
                        type="button"
                        onClick={() => setShowFilterPanel((v) => !v)}
                        className={`flex items-center justify-center rounded-full px-4 py-3 text-sm font-bold shadow-md ${
                            showFilterPanel || hasActiveFilters ? 'bg-amber-gold text-navy-blue' : 'bg-navy-blue text-base-white'
                        }`}
                        aria-label="Buka filter"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </button>
                </div>

                {/* Filter panel */}
                {showFilterPanel && (
                    <div className="mb-8 rounded-[24px] bg-base-white border border-slate-gray/10 shadow-sm p-6 md:p-8">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-navy-blue">Filter Kendaraan</h2>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-gray hover:text-navy-blue transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-navy-blue">Kategori</label>
                                <select
                                    value={state.category}
                                    onChange={(e) => setState((s) => ({ ...s, category: e.target.value }))}
                                    className="w-full rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                >
                                    <option value="">Semua kategori</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-navy-blue">Harga Minimum / Hari</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={10000}
                                    value={state.min_price}
                                    onChange={(e) => setState((s) => ({ ...s, min_price: e.target.value }))}
                                    placeholder="cth. 300000"
                                    className="w-full rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-navy-blue">Harga Maksimum / Hari</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={10000}
                                    value={state.max_price}
                                    onChange={(e) => setState((s) => ({ ...s, max_price: e.target.value }))}
                                    placeholder="cth. 1500000"
                                    className="w-full rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-navy-blue">Tahun Minimum</label>
                                <input
                                    type="number"
                                    min={1990}
                                    max={new Date().getFullYear() + 1}
                                    value={state.min_year}
                                    onChange={(e) => setState((s) => ({ ...s, min_year: e.target.value }))}
                                    placeholder="cth. 2020"
                                    className="w-full rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setState(emptyFilters(filters));
                                    setShowFilterPanel(false);
                                }}
                                className="rounded-full border-2 border-slate-gray/20 px-5 py-2.5 text-sm font-bold text-slate-gray transition-all hover:border-navy-blue hover:text-navy-blue"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFilters()}
                                className="rounded-full bg-navy-blue px-6 py-2.5 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Daftar kendaraan */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {vehicles.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-gray bg-base-white rounded-[24px] border border-slate-gray/10 shadow-sm">
                        Tidak ada kendaraan yang cocok dengan filter Anda.
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
                drivers={drivers}
            />
        </CustomerLayout>
    );
}
