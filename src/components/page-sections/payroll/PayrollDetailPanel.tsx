import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Printer } from "lucide-react";
import { fmtCurrency } from "@/lib/utils";
import { initials } from "@/components/layout/AdminLayout";
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
      <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-10 text-center text-[#A8A49E] flex flex-col items-center gap-3">
        <FileText className="w-10 h-10 stroke-[1.2] text-[#A8A49E]" />
        <div>
          <div className="font-semibold text-[13.5px] text-[#6B6760] mb-0.5">Detail Slip Gaji</div>
          <div className="text-[12.5px]">Pilih salah satu karyawan di tabel untuk menampilkan rincian dan mencetak slip gaji.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden flex flex-col">
      {/* HERO DETAIL */}
      <div className="bg-[#1A1814] p-5 text-white flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="w-[52px] h-[52px] rounded-full font-['Syne'] font-bold text-[18px] flex items-center justify-center shrink-0 bg-[#F5EDE0] text-[#B87333]">
            <AvatarFallback className="bg-transparent">{initials(selectedItem.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-['Syne'] text-[17px] font-bold leading-tight">{selectedItem.user.name}</div>
            <div className="text-[12px] text-white/40 font-mono mt-1">{selectedItem.user.emp_id} · {selectedItem.user.dept || 'No Dept'}</div>
          </div>
          <div className="ml-auto">
            {selectedItem.status === 'paid' && <Badge className="bg-[#2A7A4B]/20 text-[#4ade80] border-none text-[11px] px-2 shadow-none font-medium rounded-full">Lunas</Badge>}
            {selectedItem.status === 'draft' && <Badge className="bg-[#B87333]/20 text-[#F5EDE0] border-none text-[11px] px-2 shadow-none font-medium rounded-full">Draft</Badge>}
            {selectedItem.status === 'not_generated' && <Badge className="bg-white/10 text-white/40 border-none text-[11px] px-2 shadow-none font-medium rounded-full">Belum Ada</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0.5 bg-white/15 rounded-lg overflow-hidden border border-white/5">
          <div className="bg-white/5 p-2.5 text-center">
            <div className="font-['Syne'] text-[15px] font-bold text-white">{selectedItem.presentDays} hari</div>
            <div className="text-[9.5px] text-white/35 uppercase tracking-[0.5px] font-mono mt-0.5">Kehadiran</div>
          </div>
          <div className="bg-white/5 p-2.5 text-center">
            <div className="font-['Syne'] text-[15px] font-bold text-white">{fmtCurrency(selectedItem.kasbonDeduction)}</div>
            <div className="text-[9.5px] text-white/35 uppercase tracking-[0.5px] font-mono mt-0.5">Kasbon</div>
          </div>
          <div className="bg-white/5 p-2.5 text-center">
            <div className="font-['Syne'] text-[15px] font-bold text-white">{fmtCurrency(selectedItem.basicSalary)}</div>
            <div className="text-[9.5px] text-white/35 uppercase tracking-[0.5px] font-mono mt-0.5">Gaji Pokok</div>
          </div>
        </div>
      </div>

      {/* DETAIL BODY */}
      <div className="p-5 flex flex-col gap-5">
        <div>
          <h4 className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Rincian Slip Gaji ({selectedPeriodLabel})</h4>
          <div className="flex flex-col text-[13px] border-b border-[#E0DDD7] pb-2">
            <div className="flex justify-between py-1.5">
              <span className="text-[#6B6760]">Gaji Pokok</span>
              <span className="font-medium font-mono">{fmtCurrency(selectedItem.basicSalary)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-[#2A7A4B]">
              <span>Insentif / Tambahan</span>
              <span className="font-medium font-mono">+{fmtCurrency(selectedItem.incentives)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-[#C84B2F]">
              <span>Potongan Kasbon</span>
              <span className="font-medium font-mono">-{fmtCurrency(selectedItem.kasbonDeduction)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 text-[14.5px] font-bold text-[#1A1814]">
            <span>Gaji Bersih Diterima</span>
            <span className="font-mono text-[#C84B2F]">{fmtCurrency(selectedItem.netSalary)}</span>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Info Karyawan</h4>
          <div className="flex flex-col text-[13px]">
            <div className="flex justify-between py-1 border-b border-dashed border-[#E0DDD7]">
              <span className="text-[#6B6760]">Role Status</span>
              <span className="font-medium capitalize">{selectedItem.user.role || 'Employee'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-[#E0DDD7]">
              <span className="text-[#6B6760]">Status Karyawan</span>
              <span className="font-medium capitalize">{selectedItem.user.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-[#E0DDD7]">
              <span className="text-[#6B6760]">Bergabung Sejak</span>
              <span className="font-medium">
                {selectedItem.user.created_at ? new Date(selectedItem.user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ATTENDANCE & KASBON PROGRESS BARS */}
        <div>
          <h4 className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-3">Persentase Bulan Ini</h4>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[12px] text-[#6B6760]">
                <span>Kehadiran (Target 26 hari)</span>
                <span className="font-mono">{Math.round((selectedItem.presentDays / 26) * 100)}%</span>
              </div>
              <Progress 
                value={Math.min(Math.round((selectedItem.presentDays / 26) * 100), 100)} 
                indicatorClassName="bg-[#2A7A4B]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[12px] text-[#6B6760]">
                <span>Limit Kasbon Terpakai</span>
                <span className="font-mono">
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
                  ? 'bg-[#C84B2F]' 
                  : 'bg-[#B87333]'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL ACTIONS */}
      <div className="p-4 bg-[#EDEAE4] border-t border-[#E0DDD7] flex gap-2">
        <Button 
          onClick={() => openIncentiveModal(selectedItem)}
          variant="outline" 
          className="flex-1 bg-white border-[#E0DDD7] hover:border-[#CBC8C2] text-[#6B6760] hover:text-[#1A1814] h-[36px] text-[12.5px] rounded-[10px]"
        >
          Edit Insentif
        </Button>
        
        {selectedItem.status !== 'not_generated' && (
          <Button 
            onClick={() => handlePrint(selectedItem)}
            className="flex-1 bg-[#1A1814] hover:bg-[#2a2620] text-white border-none h-[36px] text-[12.5px] rounded-[10px]"
          >
            <Printer className="w-4.5 h-4.5 mr-1" />
            Cetak Slip Gaji
          </Button>
        )}
      </div>
    </div>
  );
}
