import { Link, usePage, useForm } from '@inertiajs/react';
import { X, CheckCircle2, User, Star, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        pricingRules?: PricingRule[];
    };
};

type Props = {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
    rentalUnits?: { value: string; label: string }[];
    pickupOptions?: { value: string; label: string }[];
};

export default function VehicleModal({ vehicle, isOpen, onClose, rentalUnits = [], pickupOptions = [] }: Props) {
    const { props } = usePage();
    const auth = props.auth as { user?: { name: string } } | undefined;

    const [showBookingForm, setShowBookingForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_id: '',
        rental_unit: 'day',
        duration: '',
        start_at: '',
        pickup_option: 'pickup_at_office',
        delivery_address: '',
        is_out_of_town: false,
        driver_id: '',
    });

    useEffect(() => {
        if (isOpen && vehicle) {
            document.body.style.overflow = 'hidden';
            setData('vehicle_id', vehicle.id.toString());
        } else {
            document.body.style.overflow = 'unset';
            setShowBookingForm(false);
            reset();
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, vehicle]);

    if (!isOpen || !vehicle) {
        return null;
    }

    const getVehicleImage = () => {
        const catName = vehicle.category.name.toLowerCase();

        if (catName.includes('sedan')) {
            return '/images/mockup/sedan.png';
        }

        if (catName.includes('mpv') || catName.includes('minibus')) {
            return '/images/mockup/mpv.png';
        }

        if (catName.includes('suv')) {
            return '/images/mockup/suv.png';
        }

        return '/images/mockup/sedan.png';
    };

    const dailyPricing = vehicle.category.pricingRules?.find(p => p.rental_unit === 'daily');
    const hourlyPricing = vehicle.category.pricingRules?.find(p => p.rental_unit === 'hourly');
    
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const mainPrice = dailyPricing ? formatPrice(dailyPricing.base_rate) : (hourlyPricing ? formatPrice(hourlyPricing.base_rate) : 'TBA');
    const unit = dailyPricing ? '/ day' : (hourlyPricing ? '/ hr' : '');

    const handleBookClick = () => {
        if (!auth?.user) {
            // Handled by Inertia Link to /login normally, but if it's a button we use window.location or router.get
            // Since it's better to use Link, we will conditionally render the button below
        } else {
            setShowBookingForm(true);
        }
    };

    const submitBooking = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders', {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-navy-blue/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-[900px] rounded-[24px] bg-surface-gray shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-auto overflow-y-auto md:overflow-y-visible">
                
                {/* Left Side (Images) */}
                <div className="w-full md:w-2/5 p-6 md:p-8 bg-base-white flex flex-col gap-4">
                    <div className="w-full h-[200px] md:h-[240px] rounded-[16px] bg-surface-gray flex items-center justify-center p-4 overflow-hidden">
                        <img 
                            src={getVehicleImage()} 
                            alt={`${vehicle.brand} ${vehicle.model}`} 
                            className="w-full h-full object-contain drop-shadow-xl"
                        />
                    </div>
                    {/* Thumbnails */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="h-16 rounded-[12px] bg-surface-gray border-2 border-navy-blue flex items-center justify-center p-2 cursor-pointer">
                            <img src={getVehicleImage()} alt="Thumb 1" className="w-full h-full object-contain" />
                        </div>
                        <div className="h-16 rounded-[12px] bg-surface-gray border-2 border-transparent flex items-center justify-center p-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                            <img src={getVehicleImage()} alt="Thumb 2" className="w-full h-full object-contain" />
                        </div>
                        <div className="h-16 rounded-[12px] bg-surface-gray border-2 border-transparent flex items-center justify-center p-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                            <img src={getVehicleImage()} alt="Thumb 3" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    
                    {!showBookingForm && (
                        <div className="mt-4 p-4 rounded-[16px] bg-surface-gray border border-slate-gray/10 hidden md:block">
                            <p className="text-xs font-medium text-slate-gray mb-1">Starting from</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-navy-blue">{mainPrice}</span>
                                <span className="text-sm font-medium text-slate-gray">{unit}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side (Info or Booking Form) */}
                <div className="w-full md:w-3/5 flex flex-col bg-surface-gray">
                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                {showBookingForm && (
                                    <button 
                                        onClick={() => setShowBookingForm(false)}
                                        className="flex items-center gap-2 text-sm font-bold text-slate-gray hover:text-navy-blue transition-colors mb-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Kembali
                                    </button>
                                )}
                                <p className="text-sm font-medium text-slate-gray mb-1">{vehicle.category.name}</p>
                                <h2 className="text-[28px] font-bold text-navy-blue leading-tight">
                                    {vehicle.brand} {vehicle.model}
                                </h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-gray/10 text-slate-gray hover:bg-slate-gray/20 hover:text-navy-blue transition-colors flex-shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {!showBookingForm ? (
                            <>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex items-center gap-1 text-xs font-bold text-navy-blue">
                                        <Star className="h-4 w-4 fill-amber-gold text-amber-gold" />
                                        4.9 (120+ trips)
                                    </div>
                                    <span className="text-slate-gray/30">•</span>
                                    <div className="flex items-center gap-1 text-xs font-bold text-success-green">
                                        <span className="h-1.5 w-1.5 rounded-full bg-success-green"></span>
                                        {vehicle.status === 'available' ? 'Available Now' : vehicle.status}
                                    </div>
                                </div>

                                {/* Quick Specs */}
                                <div className="grid grid-cols-4 gap-3 mb-8">
                                    <div className="flex flex-col items-center justify-center p-3 rounded-[12px] bg-base-white border border-slate-gray/10">
                                        <User className="h-5 w-5 text-navy-blue mb-1" />
                                        <span className="text-[10px] text-slate-gray">4 Seats</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 rounded-[12px] bg-base-white border border-slate-gray/10">
                                        <span className="text-lg font-bold text-navy-blue leading-none mb-1">A</span>
                                        <span className="text-[10px] text-slate-gray">Auto</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 rounded-[12px] bg-base-white border border-slate-gray/10">
                                        <span className="text-lg font-bold text-navy-blue leading-none mb-1">⛽</span>
                                        <span className="text-[10px] text-slate-gray">Petrol</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 rounded-[12px] bg-base-white border border-slate-gray/10">
                                        <span className="text-lg font-bold text-navy-blue leading-none mb-1">💼</span>
                                        <span className="text-[10px] text-slate-gray">2 Bags</span>
                                    </div>
                                </div>

                                {/* Features Checklist */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-navy-blue text-sm mb-4">Included Features</h4>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-success-green" />
                                        <span className="text-sm font-medium text-navy-blue">Professional Driver Available</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-success-green" />
                                        <span className="text-sm font-medium text-navy-blue">Comprehensive Insurance</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-success-green" />
                                        <span className="text-sm font-medium text-navy-blue">Chilled AC & Audio System</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-success-green" />
                                        <span className="text-sm font-medium text-navy-blue">Free Cancellation (24h before)</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Booking Form */
                            <form onSubmit={submitBooking} className="flex flex-col gap-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">Unit Sewa</label>
                                        <select
                                            value={data.rental_unit}
                                            onChange={(e) => setData('rental_unit', e.target.value)}
                                            className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                        >
                                            {rentalUnits.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">Durasi</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={data.duration}
                                            onChange={(e) => setData('duration', e.target.value)}
                                            placeholder="Cth: 3"
                                            className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                        />
                                        {errors.duration && <p className="mt-1 text-xs text-red-500 font-medium">{errors.duration}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-navy-blue">Waktu Mulai</label>
                                    <input
                                        type="datetime-local"
                                        value={data.start_at}
                                        onChange={(e) => setData('start_at', e.target.value)}
                                        className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                    />
                                    {errors.start_at && <p className="mt-1 text-xs text-red-500 font-medium">{errors.start_at}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-navy-blue">Opsi Penjemputan</label>
                                    <select
                                        value={data.pickup_option}
                                        onChange={(e) => setData('pickup_option', e.target.value)}
                                        className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                    >
                                        {pickupOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>

                                {data.pickup_option === 'deliver_to_customer' && (
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">Alamat Pengiriman</label>
                                        <textarea
                                            value={data.delivery_address}
                                            onChange={(e) => setData('delivery_address', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-[16px] border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                            placeholder="Detail alamat lengkap"
                                        />
                                        {errors.delivery_address && <p className="mt-1 text-xs text-red-500 font-medium">{errors.delivery_address}</p>}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 rounded-[12px] border border-slate-gray/10 bg-base-white p-3">
                                    <input
                                        id="out_of_town"
                                        type="checkbox"
                                        checked={data.is_out_of_town}
                                        onChange={(e) => setData('is_out_of_town', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-gray/30 text-amber-gold focus:ring-amber-gold"
                                    />
                                    <label htmlFor="out_of_town" className="text-xs font-bold text-navy-blue">
                                        Perjalanan Luar Kota <span className="ml-1 text-[10px] font-medium text-slate-gray">(+ surcharge)</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-4 w-full rounded-full bg-navy-blue py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : 'Buat Pesanan Sekarang'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Footer - Only visible when not in booking form */}
                    {!showBookingForm && (
                        <div className="p-6 md:p-8 border-t border-slate-gray/10 flex items-center justify-between bg-base-white md:bg-transparent md:border-t-0 md:pt-0">
                            <div className="md:hidden">
                                <p className="text-xs font-medium text-slate-gray mb-1">Starting from</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-extrabold text-navy-blue">{mainPrice}</span>
                                    <span className="text-xs font-medium text-slate-gray">{unit}</span>
                                </div>
                            </div>
                            
                            {!auth?.user ? (
                                <Link 
                                    href="/login"
                                    className="ml-auto rounded-full bg-navy-blue px-8 py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 hover:-translate-y-0.5"
                                >
                                    Login to Book
                                </Link>
                            ) : (
                                <button 
                                    onClick={handleBookClick}
                                    className="ml-auto rounded-full bg-navy-blue px-8 py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 hover:-translate-y-0.5"
                                >
                                    Book Now
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
