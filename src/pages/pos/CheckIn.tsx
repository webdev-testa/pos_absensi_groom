import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { useCheckIn } from '@/hooks/pos/useCheckIn'
import { CheckInForm } from '@/components/pos/CheckInForm'
import { PosPaymentModal } from '@/components/pos/PosPaymentModal'
import { WaTemplateModal } from '@/components/pos/WaTemplateModal'
import { StrukPdf } from '@/components/pos/StrukPdf'
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { PaymentSuccessResult } from '@/components/pos/PosPaymentModal'

export default function CheckIn() {
  const checkIn = useCheckIn()
  const {
    createdBooking,
    resetForm,
    pengaturan,
    bookingData,
    selectedOwner,
    newOwnerData,
    selectedCat,
    newCatData,
    submitCheckIn,
  } = checkIn

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isWaModalOpen, setIsWaModalOpen] = useState(false)
  const [isStrukOpen, setIsStrukOpen] = useState(false)

  const customerName = selectedOwner?.nama || newOwnerData.nama || 'Pelanggan'
  const catName = selectedCat?.nama || newCatData.nama || 'Kucing'

  // Triggered when clicking submit button in CheckInForm Step 3
  const handleInitiateCheckIn = () => {
    if (bookingData.dp > 0) {
      setIsPaymentModalOpen(true)
    } else {
      submitCheckIn()
      toast.success(`Check-In untuk ${catName} berhasil disimpan!`, {
        description: 'Tamu anabul siap menginap.',
      })
      setIsStrukOpen(true)
    }
  }

  // Triggered when payment is confirmed in PosPaymentModal
  const handlePaymentSuccess = (result: PaymentSuccessResult) => {
    submitCheckIn(result)
  }

  return (
    <AdminLayout>
      <div className="font-sans text-ink space-y-6 pb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <Link to="/admin/pos">
              <Button
                variant="outline"
                size="sm"
                aria-label="Kembali ke Dashboard Kucing"
                title="Kembali ke Dashboard Kucing"
                className="h-9 w-9 p-0 rounded-xl border-hairline hover:bg-surface-soft cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-ink" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                <Sparkles className="w-3.5 h-3.5" />
                Registrasi Tamu Anabul
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-ink tracking-tight">
                Check-In Kucing Baru 🐾
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetForm}
            className="text-xs h-9 gap-1.5 border-hairline hover:bg-surface-soft cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Form
          </Button>
        </div>

        {/* MULTI-STEP FORM */}
        <CheckInForm
          checkIn={checkIn}
          onInitiateCheckIn={handleInitiateCheckIn}
        />

        {/* POS PAYMENT MODAL (QRIS, Tunai, Transfer) FOR DP */}
        <PosPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            if (createdBooking) {
              resetForm()
            }
          }}
          totalAmount={bookingData.dp}
          title="Pembayaran DP Check-In"
          customerName={customerName}
          catName={catName}
          itemSummary={`DP Paket ${bookingData.paket}`}
          pengaturan={pengaturan}
          initialMethod="QRIS"
          onPaymentSuccess={handlePaymentSuccess}
          onPrintReceipt={() => setIsStrukOpen(true)}
          onOpenWaTemplate={() => setIsWaModalOpen(true)}
        />

        {/* PRINTABLE RECEIPT / STRUK PDF */}
        <StrukPdf
          isOpen={isStrukOpen}
          onClose={() => setIsStrukOpen(false)}
          booking={createdBooking}
          pengaturan={pengaturan}
        />

        {/* SUCCESS WA TEMPLATE MODAL */}
        <WaTemplateModal
          isOpen={isWaModalOpen}
          onClose={() => {
            setIsWaModalOpen(false)
          }}
          type="checkin"
          data={createdBooking}
          dp={createdBooking?.transactions?.[0]?.jumlah || bookingData.dp || 0}
          namaUsaha={pengaturan.nama_usaha}
        />
      </div>
    </AdminLayout>
  )
}
