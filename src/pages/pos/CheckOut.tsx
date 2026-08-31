import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePosStore } from '@/data/pos-store'
import { CheckOutForm } from '@/components/pos/CheckOutForm'
import { PosPaymentModal } from '@/components/pos/PosPaymentModal'
import { WaTemplateModal } from '@/components/pos/WaTemplateModal'
import { StrukPdf } from '@/components/pos/StrukPdf'
import { formatTanggalPendek, formatRupiah, calculateBilling } from '@/utils/pos.utils'
import type { Booking, Transaction, BillingCalculation } from '@/types/pos'
import type { PaymentSuccessResult } from '@/components/pos/PosPaymentModal'
import {
  Search,
  ArrowLeft,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

export default function CheckOut() {
  const store = usePosStore()
  const today = new Date().toISOString().split('T')[0]

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Payment & Modal states
  const [pendingCheckoutData, setPendingCheckoutData] = useState<{
    checkoutDate: string
    extraCharges: { keterangan: string; jumlah: number }[]
    pelunasanAmount: number
    metodeBayar: string
  } | null>(null)

  const [completedBooking, setCompletedBooking] = useState<
    (Booking & { billing?: BillingCalculation }) | null
  >(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isWaModalOpen, setIsWaModalOpen] = useState(false)
  const [isStrukOpen, setIsStrukOpen] = useState(false)

  // Active bookings list
  const activeBookings = useMemo(() => {
    return store.getFullBookings().filter(b => b.status === 'aktif')
  }, [store.bookings, store.cats, store.owners, store.transactions])

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return activeBookings
    const q = searchQuery.toLowerCase()
    return activeBookings.filter(
      b =>
        b.cat?.nama.toLowerCase().includes(q) ||
        b.owner?.nama.toLowerCase().includes(q) ||
        b.owner?.no_wa.includes(q)
    )
  }, [activeBookings, searchQuery])

  // Execute actual database changes
  const executeCheckout = (
    bookingToCheckout: Booking,
    checkoutDate: string,
    extraCharges: { keterangan: string; jumlah: number }[],
    pelunasanAmount: number,
    paymentDetails?: PaymentSuccessResult
  ) => {
    const nowIso = new Date().toISOString()
    const newTxList: Transaction[] = []

    // 1. Insert Extra Charges Transactions
    for (const item of extraCharges) {
      const tx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        booking_id: bookingToCheckout.id,
        tipe: 'biaya_tambahan',
        jumlah: item.jumlah,
        keterangan: item.keterangan,
        created_at: nowIso,
      }
      store.addTransaction(tx)
      newTxList.push(tx)
    }

    // 2. Insert Pelunasan Transaction if > 0
    if (pelunasanAmount > 0) {
      const method = paymentDetails?.method || 'QRIS'
      const pelunasanTx: Transaction = {
        id: `tx-${Date.now()}-pelunasan`,
        booking_id: bookingToCheckout.id,
        tipe: 'pelunasan',
        jumlah: pelunasanAmount,
        metode_bayar: method,
        uang_diterima: paymentDetails?.cashTendered,
        kembalian: paymentDetails?.change,
        keterangan: paymentDetails?.referenceNote
          ? `Pelunasan Checkout via ${method} (${paymentDetails.referenceNote})`
          : `Pelunasan Checkout via ${method}`,
        created_at: nowIso,
      }
      store.addTransaction(pelunasanTx)
      newTxList.push(pelunasanTx)
    }

    // 3. Update Booking to 'selesai'
    store.updateBooking(bookingToCheckout.id, {
      status: 'selesai',
      tanggal_keluar_aktual: checkoutDate,
    })

    // Calculate final billing for modal and receipt
    const updatedBooking: Booking = {
      ...bookingToCheckout,
      status: 'selesai',
      tanggal_keluar_aktual: checkoutDate,
      transactions: [
        ...(bookingToCheckout.transactions || []),
        ...newTxList,
      ],
    }
    const finalBilling = calculateBilling(updatedBooking, checkoutDate)

    setCompletedBooking({
      ...updatedBooking,
      billing: finalBilling,
    })

    return updatedBooking
  }

  // Handle Checkout Confirmation from Form
  const handleConfirmCheckout = (data: {
    checkoutDate: string
    extraCharges: { keterangan: string; jumlah: number }[]
    pelunasanAmount: number
    metodeBayar: string
  }) => {
    if (!selectedBooking) return

    setPendingCheckoutData(data)

    if (data.pelunasanAmount > 0) {
      setIsPaymentModalOpen(true)
    } else {
      executeCheckout(
        selectedBooking,
        data.checkoutDate,
        data.extraCharges,
        data.pelunasanAmount
      )
      toast.success(`Check-Out untuk ${selectedBooking.cat?.nama} berhasil!`, {
        description: 'Status penitipan telah ditutup.',
      })
      setSelectedBooking(null)
      setIsStrukOpen(true)
    }
  }

  // Handle Payment Modal Success
  const handlePaymentSuccess = (result: PaymentSuccessResult) => {
    if (!selectedBooking || !pendingCheckoutData) return

    executeCheckout(
      selectedBooking,
      pendingCheckoutData.checkoutDate,
      pendingCheckoutData.extraCharges,
      pendingCheckoutData.pelunasanAmount,
      result
    )
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
                Penjemputan & Pelunasan
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-ink tracking-tight">
                Check-Out Penitipan 🏁
              </h1>
            </div>
          </div>

          <div className="text-xs font-medium text-ink-muted bg-surface-soft px-3 py-1.5 rounded-xl border border-hairline">
            {activeBookings.length} Kucing Masih Menginap
          </div>
        </div>

        {/* IF A BOOKING IS SELECTED -> SHOW CHECKOUT FORM */}
        {selectedBooking ? (
          <CheckOutForm
            booking={selectedBooking}
            onCancel={() => setSelectedBooking(null)}
            onConfirmCheckout={handleConfirmCheckout}
            onPrintPreview={b => {
              setCompletedBooking(b)
              setIsStrukOpen(true)
            }}
          />
        ) : (
          /* LIST OF ACTIVE BOOKINGS FOR CHECKOUT */
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <Input
                type="text"
                placeholder="Cari anabul atau nama owner yang akan di-checkout..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9.5 h-11 text-xs sm:text-sm bg-white border-border rounded-xl shadow-xs"
              />
            </div>

            {filteredBookings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-hairline-strong">
                <div className="text-3xl mb-2">🐾</div>
                <h3 className="text-sm font-bold text-ink">
                  Tidak ada tamu menginap yang sesuai
                </h3>
                <p className="text-xs text-ink-muted mt-1">
                  Semua kucing telah di-checkout atau gunakan kata kunci lain.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredBookings.map(booking => {
                  const cat = booking.cat
                  const owner = booking.owner
                  const billing = calculateBilling(booking)
                  const isCheckoutToday =
                    booking.tanggal_keluar_estimasi === today

                  return (
                    <Card
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`p-4 bg-white hover:bg-surface-soft border transition-all cursor-pointer rounded-2xl flex flex-col justify-between group ${
                        isCheckoutToday
                          ? 'border-rose-300 ring-2 ring-rose-100'
                          : 'border-border hover:border-brand-orange/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-mono font-medium text-ink-muted bg-surface-soft px-2 py-0.5 rounded-md">
                            Paket {booking.paket}
                          </span>
                          {isCheckoutToday ? (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                              🔔 Jadwal Hari Ini
                            </span>
                          ) : (
                            <span className="text-[11px] text-ink-muted flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-ink-subtle" />
                              s/d {formatTanggalPendek(booking.tanggal_keluar_estimasi)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-soft border border-hairline shrink-0">
                            {cat?.foto_url ? (
                              <img
                                src={cat.foto_url}
                                alt={cat.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl bg-amber-50">
                                🐾
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-ink group-hover:text-brand-orange transition-colors truncate">
                              {cat?.nama}
                            </h3>
                            <div className="text-xs text-ink-muted truncate">
                              {cat?.ras || 'Domestik'} • {cat?.jenis_kelamin}
                            </div>
                            <div className="text-xs text-primary font-medium mt-1 truncate flex items-center gap-1">
                              <span>{owner?.nama}</span>
                              <span className="text-ink-subtle">•</span>
                              <span className="font-mono text-[11px] text-ink-muted">
                                {owner?.no_wa}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Billing Preview Footer */}
                      <div className="pt-3 border-t border-hairline flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-ink-muted uppercase font-mono">
                            Estimasi Sisa
                          </div>
                          <div className="font-mono font-bold text-sm text-primary">
                            Rp {formatRupiah(billing.sisa_bayar)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="text-xs h-8 px-3 bg-primary hover:bg-primary-hover text-white font-medium cursor-pointer"
                        >
                          Proses Check-Out <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* POS PAYMENT MODAL FOR CHECKOUT PELUNASAN */}
        {selectedBooking && pendingCheckoutData && (
          <PosPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false)
              setPendingCheckoutData(null)
              setSelectedBooking(null)
            }}
            totalAmount={pendingCheckoutData.pelunasanAmount}
            title="Pelunasan Tagihan Check-Out"
            customerName={selectedBooking.owner?.nama || 'Pelanggan'}
            catName={selectedBooking.cat?.nama || 'Kucing'}
            itemSummary={`Pelunasan ${selectedBooking.paket} (${selectedBooking.cat?.nama})`}
            pengaturan={store.pengaturan}
            initialMethod={(pendingCheckoutData.metodeBayar as any) || 'QRIS'}
            onPaymentSuccess={handlePaymentSuccess}
            onPrintReceipt={() => setIsStrukOpen(true)}
            onOpenWaTemplate={() => setIsWaModalOpen(true)}
          />
        )}

        {/* WA TEMPLATE MODAL */}
        <WaTemplateModal
          isOpen={isWaModalOpen}
          onClose={() => setIsWaModalOpen(false)}
          type="checkout"
          data={completedBooking}
          namaUsaha={store.pengaturan.nama_usaha}
        />

        {/* STRUK PDF PRINT PREVIEW */}
        <StrukPdf
          isOpen={isStrukOpen}
          onClose={() => setIsStrukOpen(false)}
          booking={completedBooking}
          pengaturan={store.pengaturan}
        />
      </div>
    </AdminLayout>
  )
}
