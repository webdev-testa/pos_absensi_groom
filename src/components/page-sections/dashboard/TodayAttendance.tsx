import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface TodayAttendanceProps {
  todayLabel: string;
  attendanceTodayStats: {
    countPresent: number;
    countOntime: number;
    countLate: number;
    countOut: number;
    countAbsent: number;
  };
  activeEmployeesCount: number;
  monthlyMetrics: {
    monthlyAttendancePct: number;
    monthlyOntimePct: number;
    monthlyLatePct: number;
  };
}

export function TodayAttendance({
  todayLabel,
  attendanceTodayStats,
  activeEmployeesCount,
  monthlyMetrics,
}: TodayAttendanceProps) {
  const totalActive = activeEmployeesCount || 1;
  const dashPresent = (attendanceTodayStats.countPresent / totalActive) * 251;
  const dashAbsent = (attendanceTodayStats.countAbsent / totalActive) * 251;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-heading text-[14.5px] font-bold text-foreground">Kehadiran hari ini</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">{todayLabel}</div>
        </div>
        <Link to="/admin/absensi" className="text-[12.5px] text-[#3B82F6] font-medium hover:underline whitespace-nowrap">Detail →</Link>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-6 mb-5">
          <div className="relative w-[100px] h-[100px] shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F3EFE9" strokeWidth="10"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="10" strokeDasharray={`${dashPresent} 251`} strokeLinecap="round"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="10" strokeDasharray={`${dashAbsent} 251`} strokeDashoffset={`-${dashPresent}`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-heading text-[24px] font-bold leading-none text-foreground">{attendanceTodayStats.countPresent}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mt-1">hadir</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] text-foreground"><div className="w-2 h-2 rounded-full shrink-0 bg-[#10B981]"></div>Tepat waktu</div>
              <div className="font-mono text-[13px] font-medium text-foreground">{attendanceTodayStats.countOntime}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] text-foreground"><div className="w-2 h-2 rounded-full shrink-0 bg-[#F59E0B]"></div>Terlambat</div>
              <div className="font-mono text-[13px] font-medium text-foreground">{attendanceTodayStats.countLate}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] text-foreground"><div className="w-2 h-2 rounded-full shrink-0 bg-[#EF4444]"></div>Tidak hadir</div>
              <div className="font-mono text-[13px] font-medium text-foreground">{attendanceTodayStats.countAbsent}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] text-foreground"><div className="w-2 h-2 rounded-full shrink-0 bg-muted-foreground/60"></div>Sudah pulang</div>
              <div className="font-mono text-[13px] font-medium text-foreground">{attendanceTodayStats.countOut}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="text-[12px] text-muted-foreground w-[110px]">Kehadiran bulan ini</div>
            <Progress 
              value={monthlyMetrics.monthlyAttendancePct} 
              indicatorClassName="bg-[#10B981]"
              className="flex-1 h-1.5 rounded-full bg-surface-soft"
            />
            <div className="font-mono text-[11.5px] text-muted-foreground w-[30px] text-right">{monthlyMetrics.monthlyAttendancePct}%</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-[12px] text-muted-foreground w-[110px]">Tepat waktu</div>
            <Progress 
              value={monthlyMetrics.monthlyOntimePct} 
              indicatorClassName="bg-[#3B82F6]"
              className="flex-1 h-1.5 rounded-full bg-surface-soft"
            />
            <div className="font-mono text-[11.5px] text-muted-foreground w-[30px] text-right">{monthlyMetrics.monthlyOntimePct}%</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-[12px] text-muted-foreground w-[110px]">Keterlambatan</div>
            <Progress 
              value={monthlyMetrics.monthlyLatePct} 
              indicatorClassName="bg-[#F59E0B]"
              className="flex-1 h-1.5 rounded-full bg-surface-soft"
            />
            <div className="font-mono text-[11.5px] text-muted-foreground w-[30px] text-right">{monthlyMetrics.monthlyLatePct}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
