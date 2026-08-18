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
      <Link to="/admin/absensi" className="bg-card border border-border rounded-xl p-5 hover:border-[#C8C2B8] hover:-translate-y-[1px] hover:shadow-sm transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Hadir hari ini</div>
        <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-[#10B981]">
          {attendanceTodayStats.countPresent}
        </div>
        <div className="text-[12.5px] text-muted-foreground mt-2">dari {activeEmployeesCount} staf klinik</div>
        {attendanceTodayStats.countAbsent > 0 ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            {attendanceTodayStats.countAbsent} belum absen
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-[#E6F7F0] text-[#065F46] border border-[#A7F3D0]">
            Semua hadir
          </div>
        )}
      </Link>

      <Link to="/admin/kasbon" className="bg-card border border-border rounded-xl p-5 hover:border-[#C8C2B8] hover:-translate-y-[1px] hover:shadow-sm transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Kasbon bulan ini</div>
        <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-[#FF5600]">
          {fmtCurrency(kasbonStats.totalKasbonAmt)}
        </div>
        <div className="text-[12.5px] text-muted-foreground mt-2">{kasbonStats.countTransactions} pengajuan</div>
        {kasbonStats.unpaidKasbonAmt > 0 ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            {fmtCurrency(kasbonStats.unpaidKasbonAmt)} belum potong
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-[#E6F7F0] text-[#065F46] border border-[#A7F3D0]">
            Semua terpotong
          </div>
        )}
      </Link>

      <Link to="/admin/payroll" className="bg-card border border-border rounded-xl p-5 hover:border-[#C8C2B8] hover:-translate-y-[1px] hover:shadow-sm transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Gaji dibayarkan</div>
        <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-foreground">
          {payrollStats.isGenerated ? fmtCurrency(payrollStats.totalPayrollPaid) : fmtCurrency(payrollStats.estimatedSalary)}
        </div>
        <div className="text-[12.5px] text-muted-foreground mt-2">estimasi bulan ini</div>
        {!payrollStats.isGenerated ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            Payroll belum dibuat
          </div>
        ) : payrollStats.allPaid ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-[#E6F7F0] text-[#065F46] border border-[#A7F3D0]">
            Payroll selesai (Paid)
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
            Payroll Draft
          </div>
        )}
      </Link>

      <Link to="/admin/karyawan" className="bg-card border border-border rounded-xl p-5 hover:border-[#C8C2B8] hover:-translate-y-[1px] hover:shadow-sm transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Total karyawan</div>
        <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-foreground">
          {activeEmployeesCount}
        </div>
        <div className="text-[12.5px] text-muted-foreground mt-2">staf aktif</div>
        <div className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2.5 font-semibold bg-[#E6F7F0] text-[#065F46] border border-[#A7F3D0]">
          Semua terdaftar
        </div>
      </Link>
    </div>
  );
}
