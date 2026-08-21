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
      <DialogContent className="sm:max-w-[460px] p-0 border-border bg-card rounded-2xl overflow-hidden gap-0 shadow-xl">
        <form onSubmit={onSubmit}>
          <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
            <DialogTitle className="font-heading text-lg font-bold text-foreground mb-0.5">Tambah Kasbon</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Catat pengambilan gaji di muka karyawan secara manual
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Karyawan *</label>
              <Select value={selectedUserId} onValueChange={onSelectedUserIdChange}>
                <SelectTrigger className="rounded-xl border-border h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Pilih karyawan..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.emp_id})
                    </SelectItem>
                  ))}
                  {employees.length === 0 && (
                    <div className="p-2 text-center text-xs text-muted-foreground">Tidak ada karyawan aktif</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedEmpLimitInfo && (
              <div className="p-3.5 bg-surface-soft border border-border rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Limit Kasbon:</span>
                  <span className="font-semibold text-foreground font-mono">Rp {selectedEmpLimitInfo.limit.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Terpakai Bulan Ini:</span>
                  <span className="font-semibold text-foreground font-mono">Rp {selectedEmpLimitInfo.used.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-1.5 mt-1">
                  <span className="text-muted-foreground font-medium">Sisa Limit:</span>
                  <span className={`font-bold font-mono ${selectedEmpLimitInfo.remaining <= 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    Rp {selectedEmpLimitInfo.remaining.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="kasbon-amount" className="text-xs text-muted-foreground font-medium">Jumlah (Rp) *</label>
                <Input 
                  id="kasbon-amount"
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
                  className="rounded-xl border-border h-10 text-xs sm:text-sm font-mono" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="kasbon-date" className="text-xs text-muted-foreground font-medium">Tanggal *</label>
                <Input 
                  id="kasbon-date"
                  type="date" 
                  required 
                  value={dateInput}
                  onChange={e => onDateInputChange(e.target.value)}
                  className="rounded-xl border-border h-10 text-xs sm:text-sm font-mono" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Kategori *</label>
              <Select value={categoryInput} onValueChange={onCategoryInputChange}>
                <SelectTrigger className="rounded-xl border-border h-10 text-xs sm:text-sm">
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
              <label htmlFor="kasbon-reason" className="text-xs text-muted-foreground font-medium">Alasan / catatan</label>
              <Input 
                id="kasbon-reason"
                type="text" 
                placeholder="Keperluan darurat, biaya sekolah, dll..." 
                value={reasonInput}
                onChange={e => onReasonInputChange(e.target.value)}
                className="rounded-xl border-border h-10 text-xs sm:text-sm" 
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-3 bg-card border-t border-border gap-2 sm:justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              className="rounded-xl text-muted-foreground hover:text-foreground h-10 px-5" 
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" />
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
