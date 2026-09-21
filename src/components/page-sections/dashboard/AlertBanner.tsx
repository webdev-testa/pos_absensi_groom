import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fmtCurrency } from '@/lib/utils';

interface AlertBannerProps {
  pastKasbonAlert?: {
    pastCount: number;
    pastTotal: number;
    uniqueNames: string;
  } | null;
}

export function AlertBanner({ pastKasbonAlert }: AlertBannerProps) {
  if (!pastKasbonAlert || pastKasbonAlert.pastCount === 0) return null;

  return (
    <Link to="/admin/kasbon" className="flex items-center gap-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-5 py-3.5 mb-7 hover:border-amber-400 dark:hover:border-amber-600 transition-all group shadow-xs">
      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 text-white font-bold text-[14px]">!</div>
      <div className="flex-1">
        <div className="text-[13.5px] font-bold text-amber-900 dark:text-amber-200">{pastKasbonAlert.pastCount} kasbon belum dipotong dari bulan lalu</div>
        <div className="text-[12.5px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
          {pastKasbonAlert.uniqueNames} · Total <span className="font-mono font-semibold">{fmtCurrency(pastKasbonAlert.pastTotal)}</span> — akan otomatis dipotong saat payroll
        </div>
      </div>
      <ChevronRight className="text-amber-800 dark:text-amber-400 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
