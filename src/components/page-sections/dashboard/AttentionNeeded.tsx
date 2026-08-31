import { Link } from 'react-router-dom';
import { AV_COLORS, getInitials } from '@/utils/helpers';

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
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-heading text-[14.5px] font-bold text-foreground">Perlu perhatian</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">Anomali & tindakan yang tertunda</div>
        </div>
        <Link to="/admin/karyawan" className="text-[12.5px] text-[#3B82F6] font-medium hover:underline whitespace-nowrap">Lihat semua →</Link>
      </div>
      <div className="py-1.5">
        {attentionItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-[13px]">
            Semua aman. Tidak ada tindakan tertunda hari ini!
          </div>
        ) : (
          attentionItems.map((a, i) => {
            const c = AV_COLORS[i % AV_COLORS.length];
            const badgeClasses = 
              a.type === 'red' ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60' :
              a.type === 'amber' ? 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60' :
              a.type === 'purple' ? 'bg-purple-50 text-purple-900 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60' :
              'bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60';

            return (
              <Link to={a.link} key={i} className="flex items-center gap-3 px-5 py-[11px] border-b border-border/60 last:border-b-0 hover:bg-surface-soft/60 transition-colors cursor-pointer block">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-bold font-heading shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                    {getInitials(a.name)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-foreground">{a.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-px">{a.reason}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${badgeClasses}`}>
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
