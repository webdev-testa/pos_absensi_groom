import { Link } from 'react-router-dom';
import { initials } from '@/components/layout/AdminLayout';
import { avColors } from '@/utils/helpers';

interface AttentionNeededProps {
  attentionItems: {
    name: string;
    reason: string;
    badge: string;
    type: 'red' | 'amber' | 'purple' | 'blue' | string;
    link: string;
  }[];
}

export function AttentionNeeded({ attentionItems }: AttentionNeededProps) {

  return (
    <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
        <div>
          <div className="font-['Syne'] text-[14.5px] font-semibold">Perlu perhatian</div>
          <div className="text-[12px] text-[#A8A49E] mt-0.5">Anomali & tindakan yang tertunda</div>
        </div>
        <Link to="/admin/karyawan" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Lihat semua →</Link>
      </div>
      <div className="py-1.5">
        {attentionItems.length === 0 ? (
          <div className="text-center py-12 text-[#A8A49E] text-[13px]">
            Semua aman. Tidak ada tindakan tertunda hari ini!
          </div>
        ) : (
          attentionItems.map((a, i) => {
            const c = avColors[i % avColors.length];
            const badgeBg = a.type === 'red' ? '#F5E8E4' : a.type === 'amber' ? '#F5EDE0' : a.type === 'purple' ? '#EDE8F5' : '#E0EDF5';
            const badgeFg = a.type === 'red' ? '#C84B2F' : a.type === 'amber' ? '#B87333' : a.type === 'purple' ? '#6B4F9E' : '#1A6FAA';
            return (
              <Link to={a.link} key={i} className="flex items-center gap-3 px-5 py-[11px] border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] transition-colors cursor-pointer block">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-bold font-['Syne'] shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                    {initials(a.name)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-[#1A1814]">{a.name}</div>
                    <div className="text-[12px] text-[#A8A49E] mt-px">{a.reason}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11px] font-medium whitespace-nowrap" style={{ backgroundColor: badgeBg, color: badgeFg }}>
                      {a.badge}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
