import { Search, Bell } from 'lucide-react';

type TopHeaderProps = {
    userName: string;
};

export default function TopHeader({ userName }: TopHeaderProps) {
    return (
        <div className="flex items-center justify-between rounded-[20px] bg-surface-gray p-6 shadow-rental">
            <div>
                <p className="text-sm text-slate-gray">Welcome back!</p>
                <h1 className="font-serif text-3xl font-extrabold text-navy-blue">
                    Good Morning, {userName}
                </h1>
            </div>

            <div className="flex items-center gap-6">
                {/* Removed Search Bar and Notifications per user request */}

                {/* Profile */}
                <div className="flex items-center gap-3 border-l border-slate-gray/20 pl-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-blue text-surface-gray font-bold">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-tight">{userName}</p>
                        <p className="text-[10px] text-slate-gray uppercase tracking-wider">Super Administrator</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
