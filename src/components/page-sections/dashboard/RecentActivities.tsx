import { Link } from 'react-router-dom';

interface RecentActivitiesProps {
  activities: {
    icon: string;
    label: string;
    isLate?: boolean;
    name: string;
    amountStr?: string;
    time: string;
    color: string;
    rawTime: number;
  }[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
        <div>
          <div className="font-['Syne'] text-[14.5px] font-semibold">Aktivitas terkini</div>
          <div className="text-[12px] text-[#A8A49E] mt-0.5">Hari ini</div>
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px] text-[#2A7A4B] font-medium">
          <div className="w-2 h-2 rounded-full bg-[#2A7A4B] animate-pulse"></div>Live
        </div>
      </div>
      <div>
        {activities.length === 0 ? (
          <div className="text-center py-16 text-[#A8A49E] text-[13px]">
            Belum ada aktivitas tercatat hari ini.
          </div>
        ) : (
          activities.map((a, i) => (
            <Link to="/admin/absensi" key={i} className="flex items-center gap-3 px-5 py-[11px] border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] transition-colors cursor-pointer block">
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[16px]" style={{ backgroundColor: a.color }}>
                  {a.icon}
                </div>
                <div className="flex-1 text-[13px] text-[#1A1814]">
                  {a.icon === '💰' ? (
                    <>
                      <strong className="font-medium text-[#1A1814]">{a.name}</strong> ajukan kasbon {a.amountStr}
                    </>
                  ) : (
                    <>
                      <strong className="font-medium text-[#1A1814]">{a.name}</strong> {a.icon === '📍' && a.color === '#EDEAE4' ? 'clock-out' : `clock-in ${a.isLate ? 'terlambat' : ''}`}
                    </>
                  )}
                </div>
                <div className="text-[11.5px] text-[#A8A49E] font-mono whitespace-nowrap">{a.time}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
