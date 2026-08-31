import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fmtCurrency } from '@/lib/utils';

interface StatCardsProps {
  attendanceTodayStats: {
    countPresent: number;
    countOntime: number;
    countLate: number;
    countOut: number;
    countAbsent: number;
  };
  activeEmployeesCount: number;
  kasbonStats: {
    totalKasbonAmt: number;
    countTransactions: number;
    unpaidKasbonAmt: number;
    deductedKasbonAmt: number;
  };
  payrollStats: {
    totalPayrollPaid: number;
    countPaidSlips: number;
    estimatedSalary: number;
    isGenerated: boolean;
    allPaid: boolean;
  };
}

export function StatCards({
  attendanceTodayStats,
  activeEmployeesCount,
  kasbonStats,
  payrollStats,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      <Link to="/admin/absensi" className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:-translate-y-[1px] hover:shadow-sm transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Hadir hari ini</div>
        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-[#10B981] tabular-nums">
          {attendanceTodayStats.countPresent}
        </div>
        <div className="text-[12.5px] text-muted-foreground mt-2">dari {activeEmployeesCount} staf klinik</div>
        {attendanceTodayStats.countAbsent > 0 ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
            {attendanceTodayStats.countAbsent} belum absen
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
            Semua hadir
          </div>
        )}
      </Link>

      <Link to="/admin/kasbon" className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:-translate-y-[1px] hover:shadow-sm transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Kasbon bulan ini</div>
        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-[#FF5600] tabular-nums">
          {fmtCurrency(kasbonStats.totalKasbonAmt)}
        </div>
        <div className="text-[12.5px] text-muted-foreground mt-2">{kasbonStats.countTransactions} pengajuan</div>
        {kasbonStats.unpaidKasbonAmt > 0 ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
            {fmtCurrency(kasbonStats.unpaidKasbonAmt)} belum potong
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
            Semua terpotong
          </div>
        )}
      </Link>

      <Link to="/admin/payroll" className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:-translate-y-[1px] hover:shadow-sm transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Gaji dibayarkan</div>
        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-foreground tabular-nums">
          {payrollStats.isGenerated ? fmtCurrency(payrollStats.totalPayrollPaid) : fmtCurrency(payrollStats.estimatedSalary)}
        </div>
        <div className="text-[12.5px] text-muted-foreground mt-2">estimasi bulan ini</div>
        {!payrollStats.isGenerated ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
            Payroll belum dibuat
          </div>
        ) : payrollStats.allPaid ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
            Payroll selesai (Paid)
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60">
            Payroll Draft
          </div>
        )}
      </Link>

      <Link to="/admin/karyawan" className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:-translate-y-[1px] hover:shadow-sm transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Total karyawan</div>
        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-foreground tabular-nums">
          {activeEmployeesCount}
        </div>
        <div className="text-[12.5px] text-muted-foreground mt-2">staf aktif</div>
        <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
          Semua terdaftar
        </div>
      </Link>
    </div>
  );
}
