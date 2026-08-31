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
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-heading text-[14.5px] font-bold text-foreground">Status Payroll</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">{currentMonth.period} · Akhir Bulan</div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
          payrollStats.isGenerated 
            ? payrollStats.allPaid 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60' 
              : 'bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
            : 'bg-surface-soft text-muted-foreground border border-border'
        }`}>
          {payrollStats.isGenerated ? payrollStats.allPaid ? '● Lunas' : '● Draft' : '○ Belum Dibuat'}
        </span>
      </div>
      <div className="p-5">
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <div className="text-[13px] text-muted-foreground line-through">Data absensi lengkap</div>
            <div className="ml-auto text-[11.5px] text-muted-foreground font-mono">OK</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <div className="text-[13px] text-muted-foreground line-through">Kasbon tercatat semua</div>
            <div className="ml-auto text-[11.5px] text-muted-foreground font-mono">OK</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold ${
              payrollStats.isGenerated 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60' 
                : 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
            }`}>
              {payrollStats.isGenerated ? (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ) : '→'}
            </div>
            <div className={`text-[13px] ${payrollStats.isGenerated ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>Generate slip gaji</div>
            <div className="ml-auto text-[11.5px] text-muted-foreground font-mono">Draft</div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold ${
              payrollStats.allPaid 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60' 
                : 'bg-surface-soft text-muted-foreground border border-border'
            }`}>
              {payrollStats.allPaid ? (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ) : '4'}
            </div>
            <div className={`text-[13px] ${payrollStats.allPaid ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>Pembayaran staf</div>
            <div className="ml-auto text-[11.5px] text-muted-foreground font-mono">Lunas</div>
          </div>
        </div>
        <Link to="/admin/payroll" className="bg-surface-dark dark:bg-surface-dark-elevated text-white rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-all group block shadow-xs border border-white/10">
          <div className="text-[13px] text-white/70">
            <strong className="text-white block text-[14px] font-heading font-bold mb-0.5">
              {payrollStats.isGenerated ? 'Buka Payroll →' : 'Generate sekarang →'}
            </strong>
            Estimasi total <span className="font-mono font-semibold tabular-nums">{payrollStats.isGenerated ? fmtCurrency(payrollStats.totalPayrollPaid) : fmtCurrency(payrollStats.estimatedSalary)}</span>
          </div>
          <div className="text-white/40 text-[20px] group-hover:text-white/90 transition-colors">⚡</div>
        </Link>
      </div>
    </div>
  );
}
