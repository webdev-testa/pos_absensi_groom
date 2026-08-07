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
      <Link to="/admin/absensi" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Hadir hari ini</div>
        <div className="font-['Syne'] text-[34px] font-bold tracking-[-1px] leading-none text-[#2A7A4B]">
          {attendanceTodayStats.countPresent}
        </div>
        <div className="text-[12.5px] text-[#A8A49E] mt-2">dari {activeEmployeesCount} karyawan</div>
        {attendanceTodayStats.countAbsent > 0 ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">
            {attendanceTodayStats.countAbsent} belum absen
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">
            Semua hadir
          </div>
        )}
      </Link>

      <Link to="/admin/kasbon" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Kasbon bulan ini</div>
        <div className="font-['Syne'] text-[34px] font-bold tracking-[-1px] leading-none text-[#C84B2F]">
          {fmtCurrency(kasbonStats.totalKasbonAmt)}
        </div>
        <div className="text-[12.5px] text-[#A8A49E] mt-2">{kasbonStats.countTransactions} transaksi</div>
        {kasbonStats.unpaidKasbonAmt > 0 ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">
            {fmtCurrency(kasbonStats.unpaidKasbonAmt)} belum dipotong
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">
            Semua terpotong
          </div>
        )}
      </Link>

      <Link to="/admin/payroll" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Gaji dibayarkan</div>
        <div className="font-['Syne'] text-[34px] font-bold tracking-[-1px] leading-none text-[#1A1814]">
          {payrollStats.isGenerated ? fmtCurrency(payrollStats.totalPayrollPaid) : fmtCurrency(payrollStats.estimatedSalary)}
        </div>
        <div className="text-[12.5px] text-[#A8A49E] mt-2">estimasi bulan ini</div>
        {!payrollStats.isGenerated ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">
            Payroll belum digenerate
          </div>
        ) : payrollStats.allPaid ? (
          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">
            Payroll selesai (Paid)
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">
            Payroll Draft
          </div>
        )}
      </Link>

      <Link to="/admin/karyawan" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
        <div className="stat-title mb-2.5">Total karyawan</div>
        <div className="font-['Syne'] text-[34px] font-bold tracking-[-1px] leading-none text-[#1A1814]">
          {activeEmployeesCount}
        </div>
        <div className="text-[12.5px] text-[#A8A49E] mt-2">aktif bulan ini</div>
        <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">
          Semua terdaftar
        </div>
      </Link>
    </div>
  );
}
