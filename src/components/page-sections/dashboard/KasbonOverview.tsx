import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { fmtCurrency } from '@/lib/utils';

interface KasbonOverviewProps {
  kasbonStats: {
    totalKasbonAmt: number;
    countTransactions: number;
    unpaidKasbonAmt: number;
    deductedKasbonAmt: number;
  };
}

export function KasbonOverview({ kasbonStats }: KasbonOverviewProps) {
  return (
    <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
        <div>
          <div className="font-['Syne'] text-[14.5px] font-semibold">Kasbon Bulan Ini</div>
          <div className="text-[12px] text-[#A8A49E] mt-0.5">Pengambilan bulan ini</div>
        </div>
        <Link to="/admin/kasbon" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Log →</Link>
      </div>
      <div className="p-5">
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] text-[#C84B2F]">
            {fmtCurrency(kasbonStats.totalKasbonAmt)}
          </div>
          <div className="text-[13px] text-[#A8A49E]">total</div>
        </div>
        <div className="text-[12.5px] text-[#6B6760] mb-4">{kasbonStats.countTransactions} pengambilan aktif</div>
        <Progress 
          value={kasbonStats.totalKasbonAmt > 0 ? Math.round((kasbonStats.unpaidKasbonAmt / kasbonStats.totalKasbonAmt) * 100) : 0} 
          indicatorClassName="bg-gradient-to-r from-[#C84B2F] to-[#e06040]"
          className="h-2 rounded-[4px] mb-4"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F5F2ED] rounded-[10px] p-3">
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.7px] font-mono mb-1">Belum dipotong</div>
            <div className="font-['Syne'] text-[18px] font-bold tracking-[-0.5px] text-[#C84B2F]">{fmtCurrency(kasbonStats.unpaidKasbonAmt)}</div>
          </div>
          <div className="bg-[#F5F2ED] rounded-[10px] p-3">
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.7px] font-mono mb-1">Sudah dipotong</div>
            <div className="font-['Syne'] text-[18px] font-bold tracking-[-0.5px] text-[#2A7A4B]">{fmtCurrency(kasbonStats.deductedKasbonAmt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
