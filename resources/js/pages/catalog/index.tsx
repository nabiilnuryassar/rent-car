import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import FilterModal from '@/components/customer/FilterModal';
import VehicleCard from '@/components/customer/VehicleCard';
import VehicleModal from '@/components/customer/VehicleModal';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { Pagination } from '@/components/ui/pagination';
import { SkeletonCard } from '@/components/ui/skeleton';
import CustomerLayout from '@/layouts/customer-layout';
import catalog from '@/routes/catalog';
import type { Paginated } from '@/types/pagination';

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
        pricing_rules?: PricingRule[];
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
    vehicles: Paginated<Vehicle>;
    categories: Category[];
    drivers: Driver[];
    isLoyalCustomer?: boolean;
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

const countActive = (f: FilterState) =>
    [f.category, f.min_price, f.max_price, f.min_year].filter(Boolean).length;

export default function CatalogIndex({
    vehicles,
    categories,
    drivers,
    isLoyalCustomer = false,
    filters,
    rentalUnits,
    pickupOptions,
}: Props) {
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
        null,
    );
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [state, setState] = useState<FilterState>(emptyFilters(filters));
    const [isFiltering, setIsFiltering] = useState(false);

    const activeCount = countActive(state);
    const hasActiveFilters = activeCount > 0 || !!state.search;

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
            onStart: () => setIsFiltering(true),
            onFinish: () => setIsFiltering(false),
        });
    };

    const resetFilters = () => {
        const cleared: FilterState = {
            search: '',
            category: '',
            min_price: '',
            max_price: '',
            min_year: '',
        };
        setState(cleared);
        applyFilters(cleared);
        setShowFilterModal(false);
    };

    const handleApply = () => {
        applyFilters();
        setShowFilterModal(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    return (
        <CustomerLayout title="Katalog Kendaraan">
            <div className="mb-10 md:mb-16">
                {/* Mobile specific header styling */}
                <div className="mb-8 md:hidden">
                    <h1 className="mb-3 font-serif text-5xl font-extrabold tracking-tight text-navy-blue">
                        Armada <br />{' '}
                        <span className="text-amber-gold underline decoration-navy-blue/10 underline-offset-8">
                            Penyewaan
                        </span>
                    </h1>
                    <p className="max-w-[280px] text-base font-medium text-slate-gray">
                        Kendaraan premium untuk setiap perjalanan dengan layanan
                        yang tertata.
                    </p>
                </div>

                {/* Desktop specific header styling */}
                <div className="mb-12 hidden items-center justify-between md:flex">
                    <div>
                        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-navy-blue">
                            Armada Premium Kami
                        </h1>
                        <p className="max-w-lg text-lg font-medium text-slate-gray">
                            Pilih kendaraan terbaik sesuai kebutuhan perjalanan
                            Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <form
                            onSubmit={handleSearch}
                            className="group relative"
                        >
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-gray transition-colors group-focus-within:text-navy-blue" />
                            <input
                                type="text"
                                value={state.search}
                                onChange={(e) =>
                                    setState((s) => ({
                                        ...s,
                                        search: e.target.value,
                                    }))
                                }
                                placeholder="Cari berdasarkan merek atau model..."
                                className="w-[320px] rounded-full border-2 border-slate-gray/10 bg-base-white py-3.5 pr-6 pl-12 text-sm font-medium shadow-sm transition-all outline-none focus:border-navy-blue focus:ring-4 focus:ring-navy-blue/5"
                            />
                        </form>
                        <button
                            type="button"
                            onClick={() => setShowFilterModal(true)}
                            className={`relative flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold shadow-md transition-all ${
                                hasActiveFilters
                                    ? 'bg-amber-gold text-navy-blue hover:bg-amber-gold/90'
                                    : 'bg-navy-blue text-base-white hover:bg-navy-blue/90 hover:shadow-lg'
                            }`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter
                            {activeCount > 0 && (
                                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-blue px-1.5 text-[10px] font-bold text-base-white">
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile search */}
                <div className="mb-6 flex items-center gap-3 md:hidden">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-gray" />
                        <input
                            type="text"
                            value={state.search}
                            onChange={(e) =>
                                setState((s) => ({
                                    ...s,
                                    search: e.target.value,
                                }))
                            }
                            placeholder="Cari kendaraan..."
                            className="w-full rounded-full border-2 border-slate-gray/10 bg-base-white py-3 pr-4 pl-11 text-sm font-medium outline-none focus:border-navy-blue"
                        />
                    </form>
                    <button
                        type="button"
                        onClick={() => setShowFilterModal(true)}
                        className={`relative flex items-center justify-center rounded-full px-4 py-3 text-sm font-bold shadow-md ${
                            hasActiveFilters
                                ? 'bg-amber-gold text-navy-blue'
                                : 'bg-navy-blue text-base-white'
                        }`}
                        aria-label="Buka filter"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        {activeCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy-blue px-1 text-[10px] font-bold text-base-white ring-2 ring-base-white">
                                {activeCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filter modal (mobile drawer / desktop centered) */}
            <FilterModal
                open={showFilterModal}
                onClose={() => {
                    setState(emptyFilters(filters));
                    setShowFilterModal(false);
                }}
                onApply={handleApply}
                onReset={resetFilters}
                activeCount={activeCount}
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-navy-blue uppercase">
                            Kategori
                        </label>
                        <select
                            value={state.category}
                            onChange={(e) =>
                                setState((s) => ({
                                    ...s,
                                    category: e.target.value,
                                }))
                            }
                            className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm outline-none focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                        >
                            <option value="">Semua kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-navy-blue uppercase">
                            Tahun Minimum
                        </label>
                        <input
                            type="number"
                            min={1990}
                            max={new Date().getFullYear() + 1}
                            value={state.min_year}
                            onChange={(e) =>
                                setState((s) => ({
                                    ...s,
                                    min_year: e.target.value,
                                }))
                            }
                            placeholder="cth. 2020"
                            className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm outline-none focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-navy-blue uppercase">
                            Harga Minimum / Hari
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={10000}
                            value={state.min_price}
                            onChange={(e) =>
                                setState((s) => ({
                                    ...s,
                                    min_price: e.target.value,
                                }))
                            }
                            placeholder="cth. 300000"
                            className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm outline-none focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold tracking-wider text-navy-blue uppercase">
                            Harga Maksimum / Hari
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={10000}
                            value={state.max_price}
                            onChange={(e) =>
                                setState((s) => ({
                                    ...s,
                                    max_price: e.target.value,
                                }))
                            }
                            placeholder="cth. 1500000"
                            className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm outline-none focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                        />
                    </div>
                </div>
            </FilterModal>

            {/* Daftar kendaraan */}
            <LoadingWrapper
                loading={isFiltering}
                skeleton={
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                }
            >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {vehicles.data.length === 0 ? (
                        <div className="col-span-full rounded-[24px] border border-slate-gray/10 bg-base-white py-10 text-center text-slate-gray shadow-sm">
                            Tidak ada kendaraan yang cocok dengan filter Anda.
                        </div>
                    ) : (
                        vehicles.data.map((vehicle, index) => (
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
            </LoadingWrapper>

            <Pagination
                links={vehicles.links}
                currentPage={vehicles.current_page}
                lastPage={vehicles.last_page}
            />

            <VehicleModal
                vehicle={selectedVehicle}
                isOpen={!!selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
                rentalUnits={rentalUnits}
                pickupOptions={pickupOptions}
                drivers={drivers}
                isLoyalCustomer={isLoyalCustomer}
            />
        </CustomerLayout>
    );
}
