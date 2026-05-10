import { TrendingUp, Calendar, Car } from 'lucide-react';

export default function QuickInsight() {
    return (
        <div className="flex flex-col justify-between rounded-[20px] bg-surface-gray p-6 shadow-rental h-full">
            <h2 className="mb-4 font-bold text-navy-blue">Quick Insight</h2>
            
            <div className="mb-6 flex gap-4 rounded-[16px] bg-green-50 p-4 border border-pale-green">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-200 text-success-green">
                    <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-bold text-green-800">Great job!</p>
                    <p className="text-sm text-success-green mt-1 leading-relaxed">
                        Revenue is up <span className="font-bold">12.6%</span> compared to last month.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-white text-navy-blue">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-gray">Best Performing Month</p>
                        <p className="font-bold text-navy-blue">March 2025</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-white text-navy-blue">
                        <Car className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-gray">Highest Rentals</p>
                        <p className="font-bold text-navy-blue">151 Rentals</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
