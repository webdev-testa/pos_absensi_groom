import { useDashboard } from '@/hooks/useDashboard';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardHeader } from '@/components/page-sections/dashboard/DashboardHeader';
import { AlertBanner } from '@/components/page-sections/dashboard/AlertBanner';
import { StatCards } from '@/components/page-sections/dashboard/StatCards';
import { TodayAttendance } from '@/components/page-sections/dashboard/TodayAttendance';
import { AttentionNeeded } from '@/components/page-sections/dashboard/AttentionNeeded';
import { KasbonOverview } from '@/components/page-sections/dashboard/KasbonOverview';
import { PayrollStatus } from '@/components/page-sections/dashboard/PayrollStatus';
import { RecentActivities } from '@/components/page-sections/dashboard/RecentActivities';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const {
    liveTime,
    todayLabel,
    currentMonth,
    isInitialLoading,
    activeEmployeesCount,
    attendanceTodayStats,
    kasbonStats,
    payrollStats,
    pastKasbonAlert,
    monthlyMetrics,
    attentionItems,
    activities,
  } = useDashboard();

  if (isInitialLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[500px] bg-[#F5F2ED] -m-10 lg:-m-12 p-10 lg:p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#C84B2F]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="font-sans text-[#1A1814] -m-10 lg:-m-12 p-10 lg:p-12 min-h-[calc(100vh-1px)]" style={{ backgroundColor: '#F5F2ED' }}>
        
        {/* HEADER */}
        <DashboardHeader
          todayLabel={todayLabel}
          liveTime={liveTime}
        />

        {/* ALERT BANNER */}
        <AlertBanner pastKasbonAlert={pastKasbonAlert} />

        {/* STAT CARDS */}
        <StatCards
          attendanceTodayStats={attendanceTodayStats}
          activeEmployeesCount={activeEmployeesCount}
          kasbonStats={kasbonStats}
          payrollStats={payrollStats}
        />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <TodayAttendance
            todayLabel={todayLabel}
            attendanceTodayStats={attendanceTodayStats}
            activeEmployeesCount={activeEmployeesCount}
            monthlyMetrics={monthlyMetrics}
          />
          <AttentionNeeded attentionItems={attentionItems} />
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <KasbonOverview kasbonStats={kasbonStats} />
          <PayrollStatus payrollStats={payrollStats} currentMonth={currentMonth} />
          <RecentActivities activities={activities} />
        </div>

      </div>
    </AdminLayout>
  );
}