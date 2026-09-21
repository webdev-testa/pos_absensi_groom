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
import { AV_COLORS, getInitials } from "@/utils/helpers";
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
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 px-5 border-b border-border flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-heading text-[15px] font-bold text-foreground">Daftar Gaji Staf</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{filteredData.length} data staf klinik</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px] bg-card border-border rounded-xl h-10 text-sm text-foreground shadow-xs">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              {monthsList.map(m => (
                <SelectItem key={m.val} value={m.val}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={exportExcel} variant="outline" className="bg-card border-border text-muted-foreground hover:text-foreground hover:bg-surface-soft rounded-xl h-10 text-sm cursor-pointer shadow-xs">
            <Download className="w-4 h-4 mr-1.5" />
            Export Excel
          </Button>

          <Button 
            onClick={() => generateMutation.mutate()} 
            disabled={generateMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-xl h-10 text-sm font-semibold cursor-pointer shadow-xs"
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
        <TableHeader className="bg-surface-soft">
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider h-10 px-4">Staf Klinik</TableHead>
            <TableHead className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider h-10 px-4">Posisi</TableHead>
            <TableHead className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider h-10 px-4">Gaji Pokok</TableHead>
            <TableHead className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider h-10 px-4">Insentif</TableHead>
            <TableHead className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider h-10 px-4">Kasbon</TableHead>
            <TableHead className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider h-10 px-4">Gaji Bersih</TableHead>
            <TableHead className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider h-10 px-4">Status</TableHead>
            <TableHead className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider h-10 px-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
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
                  className={`border-b border-border/60 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-surface-soft/60'}`}
                >
                  <TableCell className="p-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-[34px] h-[34px] rounded-full font-heading font-bold text-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                        <AvatarFallback className="bg-transparent">{getInitials(item.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-[13.5px] text-foreground">{item.user.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{item.user.emp_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[13px] text-muted-foreground">
                    {item.user.dept || '—'}
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-foreground tabular-nums">
                    {fmtCurrency(item.basicSalary)}
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                    {item.incentives > 0 ? `+${fmtCurrency(item.incentives)}` : 'Rp 0'}
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-brand-orange font-semibold tabular-nums">
                    {item.kasbonDeduction > 0 ? `-${fmtCurrency(item.kasbonDeduction)}` : 'Rp 0'}
                  </TableCell>
                  <TableCell className="p-3.5 px-4 text-[12.5px] font-mono font-bold text-foreground tabular-nums">
                    {fmtCurrency(item.netSalary)}
                  </TableCell>
                  <TableCell className="p-3.5 px-4">
                    {item.status === 'paid' && (
                      <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold text-[11.5px] px-2.5 py-0.5 rounded-full hover:bg-emerald-50 shadow-none">
                        ● Terbayar
                      </Badge>
                    )}
                    {item.status === 'draft' && (
                      <Badge className="bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60 font-semibold text-[11.5px] px-2.5 py-0.5 rounded-full hover:bg-blue-50 shadow-none">
                        ● Draft
                      </Badge>
                    )}
                    {item.status === 'not_generated' && (
                      <Badge className="bg-surface-soft text-muted-foreground border border-border font-semibold text-[11.5px] px-2.5 py-0.5 rounded-full hover:bg-surface-soft shadow-none">
                        ○ Belum Dibuat
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="p-3.5 px-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button 
                        onClick={() => openIncentiveModal(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-surface-soft transition-all cursor-pointer shadow-xs"
                      >
                        Insentif
                      </button>
                      {item.status === 'draft' && (
                        <button 
                          onClick={() => markPaidMutation.mutate(item)}
                          disabled={markPaidMutation.isPending}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold border-none bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                        >
                          Bayar
                        </button>
                      )}
                      {item.status !== 'not_generated' && (
                        <button 
                          onClick={() => handlePrint(item)}
                          className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-surface-soft transition-all cursor-pointer shadow-xs"
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
