import { Link } from 'react-router-dom';
import { fmtCurrency } from '@/lib/utils';

interface PayrollStatusProps {
  payrollStats: {
    totalPayrollPaid: number;
    countPaidSlips: number;
    estimatedSalary: number;
    isGenerated: boolean;
    allPaid: boolean;
  };
  currentMonth: {
    period: string;
    monthStart: string;
    monthEnd: string;
  };
}

export function PayrollStatus({ payrollStats, currentMonth }: PayrollStatusProps) {
  return (
    <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
        <div>
          <div className="font-['Syne'] text-[14.5px] font-semibold">Status payroll</div>
          <div className="text-[12px] text-[#A8A49E] mt-0.5">{currentMonth.period} · Akhir Bulan</div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11px] font-medium whitespace-nowrap ${
          payrollStats.isGenerated 
            ? payrollStats.allPaid 
              ? 'bg-[#E2F0E8] text-[#2A7A4B]' 
              : 'bg-[#F5EDE0] text-[#B87333]'
            : 'bg-[#EDEAE4] text-[#A8A49E]'
        }`}>
          {payrollStats.isGenerated ? payrollStats.allPaid ? 'Paid' : 'Draft' : 'Belum Dibuat'}
        </span>
      </div>
      <div className="p-5">
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-[#E2F0E8] text-[#2A7A4B]">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <div className="text-[13px] text-[#6B6760] line-through">Data absensi lengkap</div>
            <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">OK</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-[#E2F0E8] text-[#2A7A4B]">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <div className="text-[13px] text-[#6B6760] line-through">Kasbon tercatat semua</div>
            <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">OK</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold ${
              payrollStats.isGenerated ? 'bg-[#E2F0E8] text-[#2A7A4B]' : 'bg-[#F5EDE0] text-[#B87333]'
            }`}>
              {payrollStats.isGenerated ? (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ) : '→'}
            </div>
            <div className={`text-[13px] ${payrollStats.isGenerated ? 'text-[#6B6760] line-through' : 'text-[#1A1814] font-medium'}`}>Generate slip gaji</div>
            <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">Draft</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold ${
              payrollStats.allPaid ? 'bg-[#E2F0E8] text-[#2A7A4B]' : 'bg-[#EDEAE4] text-[#A8A49E]'
            }`}>
              {payrollStats.allPaid ? (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ) : '4'}
            </div>
            <div className={`text-[13px] ${payrollStats.allPaid ? 'text-[#6B6760] line-through' : 'text-[#A8A49E]'}`}>Kirim ke karyawan</div>
            <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">Lunas</div>
          </div>
        </div>
        <Link to="/admin/payroll" className="bg-[#1A1814] rounded-[10px] p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#2a2620] transition-colors group block">
          <div className="text-[13px] text-white/70">
            <strong className="text-white block text-[14px] font-['Syne'] mb-0.5">
              {payrollStats.isGenerated ? 'Buka Payroll →' : 'Generate sekarang →'}
            </strong>
            Estimasi total {payrollStats.isGenerated ? fmtCurrency(payrollStats.totalPayrollPaid) : fmtCurrency(payrollStats.estimatedSalary)}
          </div>
          <div className="text-white/40 text-[20px] group-hover:text-white/80 transition-colors">⚡</div>
        </Link>
      </div>
    </div>
  );
}
