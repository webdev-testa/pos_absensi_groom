import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, CheckCircle2 } from "lucide-react";
import type { PayrollItem } from "@/types/payroll";

interface PayrollFiltersProps {
  searchQ: string;
  setSearchQ: (q: string) => void;
  deptFilter: string;
  setDeptFilter: (dept: string) => void;
  departments: string[];
  statusFilter: 'all' | 'draft' | 'paid' | 'not_generated';
  setStatusFilter: (status: 'all' | 'draft' | 'paid' | 'not_generated') => void;
  mappedPayrollData: PayrollItem[];
  markAllPaidMutation: {
    mutate: () => void;
    isPending: boolean;
  };
}

export function PayrollFilters({
  searchQ,
  setSearchQ,
  deptFilter,
  setDeptFilter,
  departments,
  statusFilter,
  setStatusFilter,
  mappedPayrollData,
  markAllPaidMutation,
}: PayrollFiltersProps) {
  return (
    <div className="flex items-center gap-[10px] flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <Input 
          className="pl-[34px] bg-card border-border rounded-xl text-sm h-10 text-foreground placeholder:text-muted-foreground/50 shadow-xs" 
          placeholder="Cari nama atau ID staf..." 
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
      </div>

      <Select value={deptFilter} onValueChange={setDeptFilter}>
        <SelectTrigger className="w-[160px] bg-card border-border rounded-xl h-10 text-sm text-foreground shadow-xs">
          <SelectValue placeholder="Semua Divisi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua divisi</SelectItem>
          {departments.map(d => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-[3px] bg-card border border-border rounded-xl p-[3px] shadow-xs">
        {(['all', 'draft', 'paid', 'not_generated'] as const).map(s => (
          <button
            key={s}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs transition-all font-sans border-none cursor-pointer ${
              statusFilter === s 
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs' 
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-soft'
            }`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'Semua' : s === 'draft' ? 'Draft' : s === 'paid' ? 'Terbayar' : 'Belum Dibuat'}
          </button>
        ))}
      </div>

      {mappedPayrollData.some(d => d.status === 'draft') && (
        <Button 
          onClick={() => markAllPaidMutation.mutate()}
          disabled={markAllPaidMutation.isPending}
          className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl h-10 text-sm font-semibold cursor-pointer shadow-xs"
        >
          {markAllPaidMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
          )}
          Tandai Semua Lunas
        </Button>
      )}
    </div>
  );
}
