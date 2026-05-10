import { Link } from '@inertiajs/react';
import { ArrowRight, MoreVertical, Calendar } from 'lucide-react';
import Badge from '../ui/Badge';

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
    orders: RecentOrder[];
    viewAllUrl: string;
};

// Map status from backend to the colors defined in our Badge component
const getStatusColor = (status: string) => {
    switch (status) {
        case 'ongoing':
        case 'completed':
            return 'green';
        case 'pending_payment':
        case 'waiting_verification':
            return 'yellow';
        case 'waiting_overtime_payment':
            return 'red';
        case 'ready_to_dispatch':
            return 'blue';
        default:
            return 'gray';
    }
};

const formatStatusText = (status: string) => {
    switch (status) {
        case 'ongoing': return 'Rented';
        case 'pending_payment': return 'Pending';
        case 'waiting_verification': return 'Pending';
        case 'waiting_overtime_payment': return 'Overdue';
        case 'completed': return 'Returned';
        default: return status.replace(/_/g, ' ');
    }
};

export default function RecentBookingsTable({ orders, viewAllUrl }: Props) {
    return (
        <div className="rounded-[20px] bg-surface-gray shadow-rental overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5">
                <h2 className="font-bold text-navy-blue">Recent Bookings</h2>
                <Link href={viewAllUrl} className="flex items-center gap-1 text-sm font-medium text-navy-blue hover:underline">
                    <span>View all bookings</span>
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-y border-slate-gray/20 bg-surface-gray text-left text-[11px] font-bold uppercase tracking-wider text-slate-gray">
                            <th className="px-6 py-3">Booking ID</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Vehicle Model</th>
                            <th className="px-6 py-3">Date Range</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-gray">No recent bookings.</td></tr>
                        )}
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-slate-gray/20/30 hover:bg-base-white/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs font-medium text-navy-blue">
                                    {order.order_number}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-base-white font-bold text-navy-blue text-xs">
                                            {order.customer.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-navy-blue">{order.customer.user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-navy-blue">
                                    {order.vehicle.brand} {order.vehicle.model}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-gray">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={getStatusColor(order.status)}>
                                        {formatStatusText(order.status)}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="rounded-full p-1.5 text-slate-gray hover:bg-slate-gray/20/50 hover:text-navy-blue transition-colors">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
