import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Printer } from "lucide-react";
import { fmtCurrency } from "@/lib/utils";
import { getInitials } from "@/utils/helpers";
import type { PayrollItem } from "@/types/payroll";

interface PayrollDetailPanelProps {
  selectedItem: PayrollItem | null;
  selectedPeriodLabel: string;
  openIncentiveModal: (item: PayrollItem) => void;
  handlePrint: (item: PayrollItem) => void;
}

export function PayrollDetailPanel({
  selectedItem,
  selectedPeriodLabel,
  openIncentiveModal,
  handlePrint,
}: PayrollDetailPanelProps) {
  if (!selectedItem) {
    return (
      <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground flex flex-col items-center gap-3 shadow-xs">
        <FileText className="w-10 h-10 stroke-[1.2] text-muted-foreground/50" />
        <div>
          <div className="font-semibold text-[13.5px] text-foreground mb-0.5">Detail Slip Gaji</div>
          <div className="text-[12.5px] text-muted-foreground">Pilih salah satu staf klinik di tabel untuk menampilkan rincian dan mencetak slip gaji.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-xs">
      {/* HERO DETAIL */}
      <div className="bg-surface-dark dark:bg-surface-dark-elevated text-white p-5 border-b border-white/10 flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="w-[52px] h-[52px] rounded-full font-heading font-bold text-[18px] flex items-center justify-center shrink-0 bg-amber-100 text-amber-900">
            <AvatarFallback className="bg-transparent text-amber-900 font-bold">{getInitials(selectedItem.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-heading text-[17px] font-bold leading-tight">{selectedItem.user.name}</div>
            <div className="text-[12px] text-white/60 font-mono mt-0.5">{selectedItem.user.emp_id} · {selectedItem.user.dept || 'No Dept'}</div>
          </div>
          <div className="ml-auto">
            {selectedItem.status === 'paid' && <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] px-2.5 shadow-none font-semibold rounded-full">Lunas</Badge>}
            {selectedItem.status === 'draft' && <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] px-2.5 shadow-none font-semibold rounded-full">Draft</Badge>}
            {selectedItem.status === 'not_generated' && <Badge className="bg-white/10 text-white/60 border border-white/20 text-[11px] px-2.5 shadow-none font-semibold rounded-full">Belum Dibuat</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-white/10 rounded-xl overflow-hidden border border-white/10 p-1">
          <div className="bg-white/5 p-2 text-center rounded-lg">
            <div className="font-mono text-[15px] font-bold text-white tabular-nums">{selectedItem.presentDays} hari</div>
            <div className="text-[10px] text-white/60 uppercase tracking-wider font-mono mt-0.5">Kehadiran</div>
          </div>
          <div className="bg-white/5 p-2 text-center rounded-lg">
            <div className="font-mono text-[13px] font-bold text-brand-orange tabular-nums">{fmtCurrency(selectedItem.kasbonDeduction)}</div>
            <div className="text-[10px] text-white/60 uppercase tracking-wider font-mono mt-0.5">Kasbon</div>
          </div>
          <div className="bg-white/5 p-2 text-center rounded-lg">
            <div className="font-mono text-[13px] font-bold text-white tabular-nums">{fmtCurrency(selectedItem.basicSalary)}</div>
            <div className="text-[10px] text-white/60 uppercase tracking-wider font-mono mt-0.5">Gaji Pokok</div>
          </div>
        </div>
      </div>

      {/* DETAIL BODY */}
      <div className="p-5 flex flex-col gap-5">
        <div>
          <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-2.5">Rincian Slip Gaji ({selectedPeriodLabel})</h4>
          <div className="flex flex-col text-[13px] border-b border-border/60 pb-2">
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Gaji Pokok</span>
              <span className="font-medium font-mono text-foreground">{fmtCurrency(selectedItem.basicSalary)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-[#10B981]">
              <span>Insentif / Tambahan</span>
              <span className="font-semibold font-mono">+{fmtCurrency(selectedItem.incentives)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-[#FF5600]">
              <span>Potongan Kasbon</span>
              <span className="font-semibold font-mono">-{fmtCurrency(selectedItem.kasbonDeduction)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 text-[14.5px] font-bold text-foreground">
            <span>Gaji Bersih Diterima</span>
            <span className="font-mono text-foreground">{fmtCurrency(selectedItem.netSalary)}</span>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-2">Info Staf Klinik</h4>
          <div className="flex flex-col text-[13px]">
            <div className="flex justify-between py-1.5 border-b border-dashed border-border/60">
              <span className="text-muted-foreground">Hak Akses</span>
              <span className="font-semibold capitalize text-foreground">{selectedItem.user.role || 'Staff'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dashed border-border/60">
              <span className="text-muted-foreground">Status Keaktifan</span>
              <span className="font-semibold capitalize text-foreground">{selectedItem.user.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dashed border-border/60">
              <span className="text-muted-foreground">Bergabung Sejak</span>
              <span className="font-medium text-foreground">
                {selectedItem.user.created_at ? new Date(selectedItem.user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ATTENDANCE & KASBON PROGRESS BARS */}
        <div>
          <h4 className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-3">Persentase Bulan Ini</h4>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>Kehadiran (Target 26 hari)</span>
                <span className="font-mono text-foreground font-semibold">{Math.round((selectedItem.presentDays / 26) * 100)}%</span>
              </div>
              <Progress 
                value={Math.min(Math.round((selectedItem.presentDays / 26) * 100), 100)} 
                indicatorClassName="bg-[#10B981]"
                className="h-1.5 rounded-full bg-surface-soft"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>Limit Kasbon Terpakai</span>
                <span className="font-mono text-foreground font-semibold">
                  {selectedItem.user.kasbon_limit > 0 ? Math.round((selectedItem.kasbonDeduction / selectedItem.user.kasbon_limit) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={Math.min(
                  selectedItem.user.kasbon_limit > 0 
                    ? Math.round((selectedItem.kasbonDeduction / selectedItem.user.kasbon_limit) * 100) 
                    : 0, 
                  100
                )} 
                indicatorClassName={(selectedItem.user.kasbon_limit > 0 ? (selectedItem.kasbonDeduction / selectedItem.user.kasbon_limit) : 0) > 0.8 
                  ? 'bg-[#EF4444]' 
                  : 'bg-[#F59E0B]'}
                className="h-1.5 rounded-full bg-surface-soft"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL ACTIONS */}
      <div className="p-4 bg-surface-soft border-t border-border flex gap-2">
        <Button 
          onClick={() => openIncentiveModal(selectedItem)}
          variant="outline" 
          className="flex-1 bg-card border-border hover:border-[#C8C2B8] text-muted-foreground hover:text-foreground h-[36px] text-[12.5px] rounded-lg font-semibold cursor-pointer shadow-xs"
        >
          Edit Insentif
        </Button>
        
        {selectedItem.status !== 'not_generated' && (
          <Button 
            onClick={() => handlePrint(selectedItem)}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-none h-[36px] text-[12.5px] rounded-lg font-semibold cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak Slip Gaji
          </Button>
        )}
      </div>
    </div>
  );
}
