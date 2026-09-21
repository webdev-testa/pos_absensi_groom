import { Dialog, DialogContent, DialogFooter, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserX, CheckCircle } from 'lucide-react'

interface ConfirmToggleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  confirmData: { id: string; name: string; newStatus: 'active' | 'inactive' } | null
  onConfirm: () => void
  isPending: boolean
}

export function ConfirmToggleDialog({
  open,
  onOpenChange,
  confirmData,
  onConfirm,
  isPending,
}: ConfirmToggleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 border-border bg-card rounded-2xl overflow-hidden gap-0 shadow-lg">
        <DialogTitle className="sr-only">
          {confirmData?.newStatus === 'inactive' ? 'Konfirmasi Nonaktifkan Karyawan' : 'Konfirmasi Aktifkan Karyawan'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Konfirmasi perubahan status karyawan
        </DialogDescription>
        <div className="p-7 px-6 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            {confirmData?.newStatus === 'inactive' ? (
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>
          <div className="font-heading text-lg font-bold text-foreground mb-2">
            {confirmData?.newStatus === 'inactive' ? `Nonaktifkan ${confirmData?.name}?` : `Aktifkan ${confirmData?.name}?`}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {confirmData?.newStatus === 'inactive'
              ? 'Data karyawan akan diarsipkan. Riwayat absensi dan kasbon tetap tersimpan. Karyawan tidak bisa login atau absen.'
              : 'Karyawan akan diaktifkan kembali dan bisa melakukan absensi mulai hari ini.'}
          </div>
        </div>
        <DialogFooter className="p-6 pt-0 sm:justify-end gap-2 bg-transparent border-none">
          <Button 
            variant="ghost" 
            className="rounded-xl text-muted-foreground hover:text-foreground" 
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button 
            className={`rounded-xl border-none text-white font-semibold ${
              confirmData?.newStatus === 'inactive'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Memproses...' : confirmData?.newStatus === 'inactive' ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
