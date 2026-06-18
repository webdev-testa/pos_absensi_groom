import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Plus, Loader2 } from "lucide-react";
import { fmtCurrency } from "@/lib/utils";
import { AV_COLORS, initials } from "@/components/layout/AdminLayout";
import type { PayrollItem } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PayrollTableProps {
  filteredData: PayrollItem[];
  selectedUserId: string | null;
  setSelectedUserId: (userId: string) => void;
  openIncentiveModal: (item: PayrollItem) => void;
  markPaidMutation: {
    mutate: (item: PayrollItem) => void;
    isPending: boolean;
  };
  handlePrint: (item: PayrollItem) => void;
  
  // Three top controls
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  monthsList: { val: string; label: string }[];
  exportExcel: () => void;
  generateMutation: {
    mutate: () => void;
    isPending: boolean;
  };
}

export function PayrollTable({
  filteredData,
  selectedUserId,
  setSelectedUserId,
  openIncentiveModal,
  markPaidMutation,
  handlePrint,
  selectedPeriod,
  setSelectedPeriod,
  monthsList,
  exportExcel,
  generateMutation,
}: PayrollTableProps) {
  return (
    <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
      <div className="p-[16px_20px] border-b border-[#E0DDD7] flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-['Syne'] text-[15px] font-bold text-[#1A1814]">Daftar Gaji Karyawan</h3>
          <p className="text-[12px] text-[#A8A49E] mt-0.5">{filteredData.length} data karyawan ditampilkan</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px] bg-white border-[#E0DDD7] rounded-[10px] h-[38px] text-[13px]">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              {monthsList.map(m => (
                <SelectItem key={m.val} value={m.val}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={exportExcel} variant="outline" className="bg-white border-[#E0DDD7] text-[#6B6760] hover:text-[#1A1814] hover:border-[#CBC8C2] rounded-[10px] h-[38px] text-[13px]">
            <Download className="w-4 h-4 mr-1.5" />
            Export Excel
          </Button>

          <Button 
            onClick={() => generateMutation.mutate()} 
            disabled={generateMutation.isPending}
            className="bg-[#C84B2F] hover:bg-[#b03d24] text-white border-none rounded-[10px] h-[38px] text-[13px] font-medium"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-1.5" />
            )}
            Generate Payroll
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader className="bg-[#EDEAE4]">
          <TableRow className="border-b border-[#E0DDD7] hover:bg-transparent">
            <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Karyawan</TableHead>
            <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Divisi</TableHead>
            <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Gaji Pokok</TableHead>
            <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Insentif</TableHead>
            <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Kasbon</TableHead>
            <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Gaji Bersih</TableHead>
            <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Status</TableHead>
            <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-[#A8A49E] text-[13px]">
                Tidak ada data payroll yang cocok.
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item, idx) => {
              const isSelected = selectedUserId === item.user.id;
              const c = AV_COLORS[idx % AV_COLORS.length];
              return (
                <TableRow 
                  key={item.user.id} 
                  onClick={() => setSelectedUserId(item.user.id)}
                  className={`border-b border-[#E0DDD7] cursor-pointer transition-colors ${isSelected ? 'bg-[#F0F7F3]' : 'hover:bg-[#FAFAF8]'}`}
                >
                  <TableCell className="p-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-[34px] h-[34px] rounded-full font-['Syne'] font-bold text-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                        <AvatarFallback className="bg-transparent">{initials(item.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-[13.5px] text-[#1A1814]">{item.user.name}</div>
                        <div className="text-[11px] text-[#A8A49E] font-mono">{item.user.emp_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[13px] text-[#6B6760]">
                    {item.user.dept || '—'}
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-[#1A1814]">
                    {fmtCurrency(item.basicSalary)}
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-[#2A7A4B] font-medium">
                    {item.incentives > 0 ? `+${fmtCurrency(item.incentives)}` : 'Rp 0'}
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-[#C84B2F]">
                    {item.kasbonDeduction > 0 ? `-${fmtCurrency(item.kasbonDeduction)}` : 'Rp 0'}
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[12.5px] font-mono font-semibold text-[#1A1814]">
                    {fmtCurrency(item.netSalary)}
                  </TableCell>
                  <TableCell className="p-3.5 px-4">
                    {item.status === 'paid' && (
                      <Badge className="bg-[#E2F0E8] text-[#2A7A4B] border-none font-medium text-[11px] px-2 py-0.5 rounded-full hover:bg-[#E2F0E8] shadow-none">
                        ● Terbayar
                      </Badge>
                    )}
                    {item.status === 'draft' && (
                      <Badge className="bg-[#F5EDE0] text-[#B87333] border-none font-medium text-[11px] px-2 py-0.5 rounded-full hover:bg-[#F5EDE0] shadow-none">
                        ● Draft
                      </Badge>
                    )}
                    {item.status === 'not_generated' && (
                      <Badge className="bg-[#EDEAE4] text-[#A8A49E] border-none font-medium text-[11px] px-2 py-0.5 rounded-full hover:bg-[#EDEAE4] shadow-none">
                        ○ Belum Dibuat
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="p-3.5 px-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button 
                        onClick={() => openIncentiveModal(item)}
                        className="px-2.5 py-1 rounded-[7px] text-[12px] font-medium border border-[#E0DDD7] bg-white text-[#6B6760] hover:border-[#CBC8C2] hover:text-[#1A1814] transition-all cursor-pointer"
                      >
                        Insentif
                      </button>
                      {item.status === 'draft' && (
                        <button 
                          onClick={() => markPaidMutation.mutate(item)}
                          disabled={markPaidMutation.isPending}
                          className="px-2.5 py-1 rounded-[7px] text-[12px] font-medium border-none bg-[#2A7A4B] text-white hover:bg-[#1f5d37] transition-all cursor-pointer"
                        >
                          Bayar
                        </button>
                      )}
                      {item.status !== 'not_generated' && (
                        <button 
                          onClick={() => handlePrint(item)}
                          className="p-1 rounded-[7px] border border-[#E0DDD7] bg-white text-[#6B6760] hover:border-[#CBC8C2] hover:text-[#1A1814] transition-all cursor-pointer"
                          title="Cetak Slip Gaji"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
