import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fmtCurrency } from '@/lib/utils';

interface AlertBannerProps {
  pastKasbonAlert: {
    pastCount: number;
    pastTotal: number;
    uniqueNames: string;
  };
}

export function AlertBanner({ pastKasbonAlert }: AlertBannerProps) {
  if (pastKasbonAlert.pastCount === 0) return null;

  return (
    <Link to="/admin/kasbon" className="flex items-center gap-3.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-5 py-3.5 mb-7 hover:border-[#F59E0B] transition-all group shadow-xs">
      <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0 text-white font-bold text-[14px]">!</div>
      <div className="flex-1">
        <div className="text-[13.5px] font-bold text-[#92400E]">{pastKasbonAlert.pastCount} kasbon belum dipotong dari bulan lalu</div>
        <div className="text-[12.5px] text-[#B45309] mt-0.5">
          {pastKasbonAlert.uniqueNames} · Total <span className="font-mono font-semibold">{fmtCurrency(pastKasbonAlert.pastTotal)}</span> — akan otomatis dipotong saat payroll
        </div>
      </div>
      <ChevronRight className="text-[#92400E] w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
