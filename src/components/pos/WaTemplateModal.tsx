import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink, MessageCircle, Sparkles, Camera } from 'lucide-react'
import { toast } from 'sonner'
import {
  generateCheckinTemplate,
  generateDailyReportTemplate,
  generateCheckoutTemplate,
  copyToClipboard,
} from '@/utils/pos.utils'
import type { Booking, DailyReport, BillingCalculation } from '@/types/pos'

interface WaTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'checkin' | 'daily_report' | 'checkout'
  data?: (Booking & { billing?: BillingCalculation }) | null
  report?: DailyReport | null
  dp?: number
  namaUsaha?: string
}

export function WaTemplateModal({
  isOpen,
  onClose,
  type,
  data,
  report,
  dp = 0,
  namaUsaha = 'Dr. Meow Cat Hotel',
}: WaTemplateModalProps) {
  const [copied, setCopied] = useState(false)

  const messageText = useMemo(() => {
    if (!data) return ''

    if (type === 'checkin') {
      const actualDp =
        dp ||
        data.transactions
          ?.filter(t => t.tipe === 'dp')
          .reduce((sum, t) => sum + t.jumlah, 0) ||
        0
      return generateCheckinTemplate(data, actualDp, namaUsaha)
    }

    if (type === 'daily_report' && report) {
      return generateDailyReportTemplate(data, report)
    }

    if (type === 'checkout' && data.billing) {
      return generateCheckoutTemplate(data, data.billing, namaUsaha)
    }

    return ''
  }, [type, data, report, dp, namaUsaha])

  const ownerWa = data?.owner?.no_wa || ''
  const cleanWa = ownerWa.replace(/\D/g, '')
  const formattedWaForLink = cleanWa.startsWith('0')
    ? `62${cleanWa.slice(1)}`
    : cleanWa

  const handleCopy = async () => {
    if (!messageText) return
    const success = await copyToClipboard(messageText)
    if (success) {
      setCopied(true)
      toast.success('Pesan WhatsApp berhasil disalin!', {
        description: 'Buka WhatsApp dan paste pesan ke owner kucing.',
      })
      setTimeout(() => setCopied(false), 2500)
    } else {
      toast.error('Gagal menyalin pesan.')
    }
  }

  const handleOpenWhatsApp = () => {
    if (!formattedWaForLink) {
      handleCopy()
      return
    }
    const encoded = encodeURIComponent(messageText)
    const url = `https://wa.me/${formattedWaForLink}?text=${encoded}`
    window.open(url, '_blank')
  }

  if (!data) return null

  const modalTitles = {
    checkin: 'Pesan Konfirmasi Check-In',
    daily_report: 'Pesan Laporan Harian (Daily Report)',
    checkout: 'Pesan Struk Checkout & Penjemputan',
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-w-[calc(100%-2rem)] bg-card text-foreground border border-border shadow-2xl p-6 sm:p-7 rounded-2xl">
        <DialogHeader className="space-y-1 text-left pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
            <Sparkles className="w-3.5 h-3.5" />
            Template WhatsApp Otomatis
          </div>
          <DialogTitle className="text-xl font-heading font-bold text-foreground">
            {modalTitles[type]}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Salin atau kirim langsung ke nomor WhatsApp pemilik kucing.
          </DialogDescription>
        </DialogHeader>

        {/* Owner Info Pill */}
        <div className="flex items-center justify-between p-3 bg-surface-soft border border-border rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {data.owner?.nama?.charAt(0) || 'O'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">
                {data.owner?.nama || 'Owner'}
              </div>
              <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" />
                {ownerWa || 'No WA tidak tersedia'}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-medium bg-brand-accent/15 text-brand-accent px-2.5 py-1 rounded-md">
              🐱 {data.cat?.nama}
            </span>
          </div>
        </div>

        {/* Message Content Area */}
        <div className="relative">
          <textarea
            readOnly
            value={messageText}
            rows={12}
            className="w-full text-xs font-mono text-foreground bg-surface-soft border border-border rounded-xl p-3.5 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary shadow-inner selection:bg-brand-accent/30"
          />
          {type === 'daily_report' && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 font-sans">
              <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Tips:</strong> Jangan lupa lampirkan foto kucing terbaru saat mengirim ke WhatsApp owner!
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-border text-muted-foreground hover:text-foreground text-xs h-10 px-4 cursor-pointer rounded-xl"
          >
            Tutup
          </Button>
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial items-center gap-1.5 text-xs h-10 px-4 border-border font-medium hover:bg-surface-soft cursor-pointer rounded-xl"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Pesan</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-initial items-center gap-1.5 text-xs h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs cursor-pointer rounded-xl"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Buka WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
