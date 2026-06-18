import type { FormEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { ActiveEmployeeOption } from '@/types/kasbon'

interface KasbonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: FormEvent) => void
  employees: ActiveEmployeeOption[]
  selectedUserId: string
  onSelectedUserIdChange: (val: string) => void
  amountInput: string
  onAmountInputChange: (val: string) => void
  dateInput: string
  onDateInputChange: (val: string) => void
  categoryInput: string
  onCategoryInputChange: (val: string) => void
  reasonInput: string
  onReasonInputChange: (val: string) => void
  isPending: boolean
  selectedEmpLimitInfo?: { limit: number; used: number; remaining: number } | null
}

export function KasbonFormDialog({
  open,
  onOpenChange,
  onSubmit,
  employees,
  selectedUserId,
  onSelectedUserIdChange,
  amountInput,
  onAmountInputChange,
  dateInput,
  onDateInputChange,
  categoryInput,
  onCategoryInputChange,
  reasonInput,
  onReasonInputChange,
  isPending,
  selectedEmpLimitInfo,
}: KasbonFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 border-[#C8E8F5] rounded-[16px] overflow-hidden gap-0">
        <form onSubmit={onSubmit}>
          <DialogHeader className="p-8 pb-6 bg-white">
            <DialogTitle className="font-['Syne'] text-[20px] font-bold text-[#1A3A4A] mb-1">Tambah Kasbon</DialogTitle>
            <DialogDescription className="text-[13px] text-[#4A7A8A]">
              Catat pengambilan gaji di muka karyawan secara manual
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 pt-0 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Karyawan</label>
              <Select value={selectedUserId} onValueChange={onSelectedUserIdChange}>
                <SelectTrigger className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]">
                  <SelectValue placeholder="Pilih karyawan..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.emp_id})
                    </SelectItem>
                  ))}
                  {employees.length === 0 && (
                    <div className="p-2 text-center text-xs text-[#8ABAC8]">Tidak ada karyawan aktif</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedEmpLimitInfo && (
              <div className="p-3 bg-[#F0FAFF] border border-[#C8E8F5] rounded-[10px] text-[12.5px] space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#4A7A8A]">Limit Kasbon:</span>
                  <span className="font-semibold text-[#1A3A4A] font-mono">Rp {selectedEmpLimitInfo.limit.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#4A7A8A]">Terpakai Bulan Ini:</span>
                  <span className="font-semibold text-[#1A3A4A] font-mono">Rp {selectedEmpLimitInfo.used.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#C8E8F5] pt-1.5 mt-1">
                  <span className="text-[#4A7A8A] font-medium">Sisa Limit:</span>
                  <span className={`font-bold font-mono ${selectedEmpLimitInfo.remaining <= 0 ? 'text-[#C84B2F]' : 'text-[#3AAD7A]'}`}>
                    Rp {selectedEmpLimitInfo.remaining.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Jumlah (Rp)</label>
                <Input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="200.000" 
                  required 
                  value={amountInput}
                  onChange={e => {
                    const rawVal = e.target.value.replace(/\D/g, '');
                    const formatted = rawVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    onAmountInputChange(formatted);
                  }}
                  className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px] font-mono" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Tanggal</label>
                <Input 
                  type="date" 
                  required 
                  value={dateInput}
                  onChange={e => onDateInputChange(e.target.value)}
                  className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Kategori</label>
              <Select value={categoryInput} onValueChange={onCategoryInputChange}>
                <SelectTrigger className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                  <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                  <SelectItem value="Kebutuhan rumah">Kebutuhan rumah</SelectItem>
                  <SelectItem value="Transportasi">Transportasi</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Alasan / catatan</label>
              <Input 
                type="text" 
                placeholder="Keperluan darurat, biaya sekolah, dll..." 
                value={reasonInput}
                onChange={e => onReasonInputChange(e.target.value)}
                className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]" 
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 bg-white gap-2.5 sm:justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              className="rounded-[10px] text-[#4A7A8A] hover:text-[#1A3A4A] h-[42px] px-6" 
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="rounded-[10px] bg-[#F5A940] hover:bg-[#e09833] text-white h-[42px] px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
