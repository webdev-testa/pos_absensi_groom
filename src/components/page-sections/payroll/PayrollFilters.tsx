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
        <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A49E]" />
        <Input 
          className="pl-[34px] bg-white border-[#E0DDD7] rounded-[10px] text-[13px] h-[38px] placeholder:text-[#A8A49E] focus-visible:ring-0 focus-visible:border-[#CBC8C2]" 
          placeholder="Cari nama atau ID..." 
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
      </div>

      <Select value={deptFilter} onValueChange={setDeptFilter}>
        <SelectTrigger className="w-[160px] bg-white border-[#E0DDD7] rounded-[10px] h-[38px] text-[13px]">
          <SelectValue placeholder="Semua Divisi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua divisi</SelectItem>
          {departments.map(d => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-[3px] bg-white border border-[#E0DDD7] rounded-[10px] p-[3px]">
        <button 
          onClick={() => setStatusFilter('all')} 
          className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] font-medium border-none cursor-pointer transition-all ${statusFilter === 'all' ? 'bg-[#1A1814] text-white' : 'bg-transparent text-[#6B6760] hover:text-[#1A1814]'}`}
        >
          Semua
        </button>
        <button 
          onClick={() => setStatusFilter('draft')} 
          className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] font-medium border-none cursor-pointer transition-all ${statusFilter === 'draft' ? 'bg-[#1A1814] text-white' : 'bg-transparent text-[#6B6760] hover:text-[#1A1814]'}`}
        >
          Draft
        </button>
        <button 
          onClick={() => setStatusFilter('paid')} 
          className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] font-medium border-none cursor-pointer transition-all ${statusFilter === 'paid' ? 'bg-[#1A1814] text-white' : 'bg-transparent text-[#6B6760] hover:text-[#1A1814]'}`}
        >
          Terbayar
        </button>
        <button 
          onClick={() => setStatusFilter('not_generated')} 
          className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] font-medium border-none cursor-pointer transition-all ${statusFilter === 'not_generated' ? 'bg-[#1A1814] text-white' : 'bg-transparent text-[#6B6760] hover:text-[#1A1814]'}`}
        >
          Belum Dibuat
        </button>
      </div>

      {/* Finalize Mass Action */}
      {mappedPayrollData.some(item => item.status === 'draft') && (
        <Button 
          onClick={() => markAllPaidMutation.mutate()} 
          disabled={markAllPaidMutation.isPending}
          className="ml-auto bg-[#2A7A4B] hover:bg-[#1f5d37] text-white border-none rounded-[10px] h-[38px] text-[13px] font-medium"
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
