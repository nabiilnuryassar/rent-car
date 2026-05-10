import { TrendingUp, TrendingDown } from 'lucide-react';
import type {ReactNode} from 'react';

type KpiCardProps = {
    label: string;
    value: string | number;
    icon: ReactNode;
    trendValue: string;
    trendType: 'up' | 'down' | 'neutral';
    trendLabel: string;
};

export default function KpiCard({ label, value, icon, trendValue, trendType, trendLabel }: KpiCardProps) {
    return (
        <div className="flex flex-col justify-between rounded-[20px] bg-surface-gray p-6 shadow-rental">
            <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-white text-navy-blue">
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-gray">{label}</p>
                    <p className="mt-1 text-3xl font-extrabold text-navy-blue">{value}</p>
                </div>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                {trendType === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                {trendType === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                
                <span className={trendType === 'up' ? 'text-green-600' : trendType === 'down' ? 'text-red-600' : 'text-slate-gray'}>
                    {trendValue}
                </span>
                <span className="text-slate-gray">{trendLabel}</span>
            </div>
        </div>
    );
}
