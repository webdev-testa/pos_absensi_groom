import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { useCheckIn } from '@/hooks/pos/useCheckIn'
import { CheckInForm } from '@/components/pos/CheckInForm'
import { WaTemplateModal } from '@/components/pos/WaTemplateModal'
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react'

export default function CheckIn() {
  const checkIn = useCheckIn()
  const { createdBooking, isModalOpen, setIsModalOpen, resetForm, pengaturan } =
    checkIn

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
        <CheckInForm checkIn={checkIn} />

        {/* SUCCESS WA TEMPLATE MODAL */}
        <WaTemplateModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            resetForm()
          }}
          type="checkin"
          data={createdBooking}
          dp={createdBooking?.transactions?.[0]?.jumlah || 0}
          namaUsaha={pengaturan.nama_usaha}
        />
      </div>
    </AdminLayout>
  )
}
