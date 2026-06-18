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
    <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
        <div>
          <div className="font-['Syne'] text-[14.5px] font-semibold">Kehadiran hari ini</div>
          <div className="text-[12px] text-[#A8A49E] mt-0.5">{todayLabel}</div>
        </div>
        <Link to="/admin/absensi" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Detail →</Link>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-6 mb-5">
          <div className="relative w-[100px] h-[100px] shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#EDEAE4" strokeWidth="10"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#2A7A4B" strokeWidth="10" strokeDasharray={`${dashPresent} 251`} strokeLinecap="round"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#C84B2F" strokeWidth="10" strokeDasharray={`${dashAbsent} 251`} strokeDashoffset={`-${dashPresent}`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-['Syne'] text-[24px] font-bold leading-none">{attendanceTodayStats.countPresent}</div>
              <div className="text-[10px] text-[#A8A49E] uppercase tracking-[0.5px] font-mono mt-1">hadir</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#2A7A4B]"></div>Tepat waktu</div>
              <div className="font-mono text-[13px] font-medium">{attendanceTodayStats.countOntime}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#B87333]"></div>Terlambat</div>
              <div className="font-mono text-[13px] font-medium">{attendanceTodayStats.countLate}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#C84B2F]"></div>Tidak hadir</div>
              <div className="font-mono text-[13px] font-medium">{attendanceTodayStats.countAbsent}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#A8A49E]"></div>Sudah pulang</div>
              <div className="font-mono text-[13px] font-medium">{attendanceTodayStats.countOut}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="text-[12px] text-[#6B6760] w-[110px]">Kehadiran bulan ini</div>
            <Progress 
              value={monthlyMetrics.monthlyAttendancePct} 
              indicatorClassName="bg-[#2A7A4B]"
              className="flex-1 h-1.5 rounded-[3px]"
            />
            <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">{monthlyMetrics.monthlyAttendancePct}%</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-[12px] text-[#6B6760] w-[110px]">Tepat waktu</div>
            <Progress 
              value={monthlyMetrics.monthlyOntimePct} 
              indicatorClassName="bg-[#1A6FAA]"
              className="flex-1 h-1.5 rounded-[3px]"
            />
            <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">{monthlyMetrics.monthlyOntimePct}%</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-[12px] text-[#6B6760] w-[110px]">Keterlambatan</div>
            <Progress 
              value={monthlyMetrics.monthlyLatePct} 
              indicatorClassName="bg-[#B87333]"
              className="flex-1 h-1.5 rounded-[3px]"
            />
            <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">{monthlyMetrics.monthlyLatePct}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
