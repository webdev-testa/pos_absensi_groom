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
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-heading text-[14.5px] font-bold text-foreground">Aktivitas terkini</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">Hari ini</div>
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px] text-[#10B981] font-semibold">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>Live
        </div>
      </div>
      <div>
        {activities.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-[13px]">
            Belum ada aktivitas tercatat hari ini.
          </div>
        ) : (
          activities.map((a, i) => (
            <Link to="/admin/absensi" key={i} className="flex items-center gap-3 px-5 py-[11px] border-b border-border/60 last:border-b-0 hover:bg-surface-soft/60 transition-colors cursor-pointer block">
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[16px] border border-border/40" style={{ backgroundColor: a.color }}>
                  {a.icon}
                </div>
                <div className="flex-1 text-[13px] text-foreground">
                  {a.icon === '💰' ? (
                    <>
                      <strong className="font-semibold text-foreground">{a.name}</strong> ajukan kasbon <span className="font-mono font-semibold text-[#FF5600]">{a.amountStr}</span>
                    </>
                  ) : (
                    <>
                      <strong className="font-semibold text-foreground">{a.name}</strong> {a.icon === '📍' && a.color === '#EDEAE4' ? 'clock-out' : `clock-in ${a.isLate ? 'terlambat' : 'tepat waktu'}`}
                    </>
                  )}
                </div>
                <div className="text-[11.5px] text-muted-foreground font-mono whitespace-nowrap">{a.time}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
