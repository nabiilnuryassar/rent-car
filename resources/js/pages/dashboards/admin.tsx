import { usePage } from '@inertiajs/react';
import { Car, CarFront, AlertTriangle } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import QuickInsight from '@/components/dashboard/QuickInsight';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import TopHeader from '@/components/dashboard/TopHeader';
import TrendChart from '@/components/dashboard/TrendChart';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Stats = {
    orders_today: number;
    pending_payment: number;
    waiting_verification: number;
    available_vehicles: number;
    in_use_vehicles: number;
    available_drivers: number;
    on_duty_drivers: number;
};

type RecentOrder = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    customer: { user: { name: string } };
    vehicle: { brand: string; model: string; category: { name: string } };
};

type Props = {
    stats: Stats;
    recentOrders: RecentOrder[];
};

export default function AdminDashboard({ stats, recentOrders }: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string } } };

    const kpiCards = [
        { 
            label: 'Total Active Rentals', 
            value: stats.in_use_vehicles, 
            icon: <Car className="h-6 w-6" />, 
            trendValue: '+8.6%', 
            trendType: 'up' as const, 
            trendLabel: 'this week' 
        },
        { 
            label: 'Revenue (Month-to-Date)', 
            value: '$48,750', // Mock data to match design
            icon: <span className="text-xl font-bold">$</span>, 
            trendValue: '+12.6%', 
            trendType: 'up' as const, 
            trendLabel: 'vs last month' 
        },
        { 
            label: 'Available Vehicles', 
            value: stats.available_vehicles, 
            icon: <CarFront className="h-6 w-6" />, 
            trendValue: '+5.3%', 
            trendType: 'up' as const, 
            trendLabel: 'this week' 
        },
        { 
            label: 'Maintenance Alerts', 
            value: '7', // Mock data
            icon: <AlertTriangle className="h-6 w-6" />, 
            trendValue: '+2', 
            trendType: 'neutral' as const, 
            trendLabel: 'since yesterday' 
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            <div className="flex flex-col gap-6">
                <TopHeader userName={auth.user?.name || 'Admin'} />

                {/* KPI Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card) => (
                        <KpiCard key={card.label} {...card} />
                    ))}
                </div>

                {/* Middle Section: Chart and Quick Insight */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <TrendChart />
                    </div>
                    <div>
                        <QuickInsight />
                    </div>
                </div>

                {/* Recent Bookings */}
                <RecentBookingsTable 
                    orders={recentOrders} 
                    viewAllUrl={admin.orders.index.url()} 
                />
            </div>
        </AdminLayout>
    );
}
