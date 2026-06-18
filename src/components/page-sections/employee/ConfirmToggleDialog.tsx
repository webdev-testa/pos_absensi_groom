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
      <DialogContent className="sm:max-w-[400px] p-0 border-[#C8E8F5] rounded-[16px] overflow-hidden gap-0">
        <DialogTitle className="sr-only">
          {confirmData?.newStatus === 'inactive' ? 'Konfirmasi Nonaktifkan Karyawan' : 'Konfirmasi Aktifkan Karyawan'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Konfirmasi perubahan status karyawan
        </DialogDescription>
        <div className="p-7 px-6 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            {confirmData?.newStatus === 'inactive' ? (
              <div className="w-14 h-14 bg-[#F5E8E4] rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-[#F5A940]" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-[#E2F0E8] rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#3AAD7A]" />
              </div>
            )}
          </div>
          <div className="font-['Syne'] text-[18px] font-bold text-[#1A3A4A] mb-2">
            {confirmData?.newStatus === 'inactive' ? `Nonaktifkan ${confirmData?.name}?` : `Aktifkan ${confirmData?.name}?`}
          </div>
          <div className="text-[13.5px] text-[#4A7A8A] leading-relaxed">
            {confirmData?.newStatus === 'inactive'
              ? 'Data karyawan akan diarsipkan. Riwayat absensi dan kasbon tetap tersimpan. Karyawan tidak bisa login atau absen.'
              : 'Karyawan akan diaktifkan kembali dan bisa melakukan absensi mulai hari ini.'}
          </div>
        </div>
        <DialogFooter className="p-6 pt-0 sm:justify-end gap-2">
          <Button 
            variant="ghost" 
            className="rounded-[10px] text-[#4A7A8A]" 
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button 
            className="rounded-[10px] border-none text-white font-medium"
            style={{ backgroundColor: confirmData?.newStatus === 'inactive' ? '#F5A940' : '#3AAD7A' }}
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
