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
    <Link to="/admin/kasbon" className="flex items-center gap-3 bg-[#F5EDE0] border border-[#e8c99a] rounded-[16px] px-5 py-3.5 mb-7 hover:border-[#B87333] transition-all group">
      <div className="w-8 h-8 rounded-full bg-[#B87333] flex items-center justify-center shrink-0 text-white font-bold text-[15px]">!</div>
      <div className="flex-1">
        <div className="text-[13.5px] font-semibold text-[#B87333]">{pastKasbonAlert.pastCount} kasbon belum dipotong dari bulan lalu</div>
        <div className="text-[12.5px] text-[#8a5c1a] mt-0.5">
          {pastKasbonAlert.uniqueNames} · Total {fmtCurrency(pastKasbonAlert.pastTotal)} — akan otomatis dipotong saat payroll
        </div>
      </div>
      <ChevronRight className="text-[#B87333] w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
