import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckOutForm } from '@/components/pos/CheckOutForm'
import { PosPaymentModal } from '@/components/pos/PosPaymentModal'
import { WaTemplateModal } from '@/components/pos/WaTemplateModal'
import { StrukPdf } from '@/components/pos/StrukPdf'
import { formatTanggalPendek, formatRupiah, calculateBilling } from '@/utils/pos.utils'
import { posService, type ExecuteCheckoutPayload } from '@/services/posService'
import type { Booking, Transaction, BillingCalculation, Pengaturan } from '@/types/pos'
import type { PaymentSuccessResult } from '@/components/pos/PosPaymentModal'
import {
  Search,
  ArrowLeft,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_PENGATURAN: Pengaturan = {
  id: 1,
  nama_usaha: 'Dr. Meow Cat Hotel & Care',
  no_wa_usaha: '081234567890',
  alamat_usaha: 'Jl. Ahmad Yani No. 45, Jakarta Selatan',
  nama_bank: 'BCA (Bank Central Asia)',
  no_rekening: '8735091234',
  atas_nama_rekening: 'Dr. Meow Cat Clinic',
  qris_nmid: 'ID1020304050607',
}

export default function CheckOut() {
  const queryClient = useQueryClient()
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

  // Queries
  const { data: allBookings = [] } = useQuery<Booking[]>({
    queryKey: ['pos_bookings'],
    queryFn: () => posService.fetchBookings(),
    staleTime: 1000 * 30,
  })

  const { data: pengaturan = DEFAULT_PENGATURAN } = useQuery<Pengaturan>({
    queryKey: ['pos_pengaturan'],
    queryFn: () => posService.fetchPengaturan(),
    staleTime: 1000 * 60 * 5,
  })

  // Active bookings list
  const activeBookings = useMemo(() => {
    return allBookings.filter(b => b.status === 'aktif')
  }, [allBookings])

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

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (payload: {
      bookingToCheckout: Booking
      checkoutDate: string
      extraCharges: { keterangan: string; jumlah: number }[]
      pelunasanAmount: number
      paymentDetails?: PaymentSuccessResult
    }) => {
      const { bookingToCheckout, checkoutDate, extraCharges, pelunasanAmount, paymentDetails } = payload
      const executePayload: ExecuteCheckoutPayload = {
        bookingId: bookingToCheckout.id,
        checkoutDate,
        extraCharges,
        pelunasanAmount,
        paymentDetails,
      }

      await posService.executeCheckout(executePayload)

      // Build local representation for instant receipt generation
      const nowIso = new Date().toISOString()
      const newTransactions: Transaction[] = [
        ...(bookingToCheckout.transactions || []),
      ]

      for (const item of extraCharges) {
        newTransactions.push({
          id: `tx-extra-${Date.now()}`,
          booking_id: bookingToCheckout.id,
          tipe: 'biaya_tambahan',
          jumlah: item.jumlah,
          keterangan: item.keterangan,
          created_at: nowIso,
        })
      }

      if (pelunasanAmount > 0) {
        const method = paymentDetails?.method || 'QRIS'
        newTransactions.push({
          id: `tx-pelunasan-${Date.now()}`,
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
        })
      }

      const updatedBooking: Booking = {
        ...bookingToCheckout,
        status: 'selesai',
        tanggal_keluar_aktual: checkoutDate,
        transactions: newTransactions,
      }

      const finalBilling = calculateBilling(updatedBooking, checkoutDate)

      return {
        ...updatedBooking,
        billing: finalBilling,
      }
    },
    onSuccess: (finalData) => {
      setCompletedBooking(finalData)
      queryClient.invalidateQueries({ queryKey: ['pos_bookings'] })
      queryClient.invalidateQueries({ queryKey: ['pos_booking', finalData.id] })
      toast.success(`Check-Out untuk ${finalData.cat?.nama || 'Kucing'} berhasil!`, {
        description: 'Status penitipan telah ditutup dan disimpan ke database.',
      })
      setSelectedBooking(null)
      setPendingCheckoutData(null)
      setIsPaymentModalOpen(false)
      setIsStrukOpen(true)
    },
    onError: (err: any) => {
      console.error('Checkout error:', err)
      toast.error(err.message || 'Gagal memproses check-out')
    },
  })

  // Execute actual database changes
  const executeCheckout = (
    bookingToCheckout: Booking,
    checkoutDate: string,
    extraCharges: { keterangan: string; jumlah: number }[],
    pelunasanAmount: number,
    paymentDetails?: PaymentSuccessResult
  ) => {
    if (checkoutMutation.isPending) return
    checkoutMutation.mutate({
      bookingToCheckout,
      checkoutDate,
      extraCharges,
      pelunasanAmount: Math.max(0, pelunasanAmount),
      paymentDetails,
    })
  }

  // Handle Checkout Confirmation from Form
  const handleConfirmCheckout = (data: {
    checkoutDate: string
    extraCharges: { keterangan: string; jumlah: number }[]
    pelunasanAmount: number
    metodeBayar: string
  }) => {
    if (!selectedBooking) return

    if (data.pelunasanAmount < 0) {
      toast.error('Nominal pelunasan tidak boleh bernilai negatif!')
      return
    }

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
    }
  }

  // Handle Payment Modal Success
  const handlePaymentSuccess = (result: PaymentSuccessResult) => {
    if (!selectedBooking || !pendingCheckoutData || checkoutMutation.isPending) return

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
      <div className="font-sans text-foreground space-y-6 pb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <Link to="/admin/pos">
              <Button
                variant="outline"
                size="sm"
                aria-label="Kembali ke Dashboard Kucing"
                title="Kembali ke Dashboard Kucing"
                className="h-10 w-10 p-0 rounded-xl border-border hover:bg-surface-soft cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                <Sparkles className="w-3.5 h-3.5" />
                Penjemputan & Pelunasan
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight">
                Check-Out Penitipan 🏁
              </h1>
            </div>
          </div>

          <div className="text-xs font-medium text-muted-foreground bg-surface-soft px-3 py-1.5 rounded-xl border border-border">
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
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari anabul atau nama owner yang akan di-checkout..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9.5 h-11 text-xs sm:text-sm bg-card border-border rounded-xl shadow-xs"
              />
            </div>

            {filteredBookings.length === 0 ? (
              <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border">
                <div className="text-3xl mb-2">🐾</div>
                <h3 className="text-sm font-bold text-foreground">
                  Tidak ada tamu menginap yang sesuai
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
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
                      className={`p-4 bg-card hover:bg-surface-soft border transition-all cursor-pointer rounded-2xl flex flex-col justify-between group ${
                        isCheckoutToday
                          ? 'border-rose-300 dark:border-rose-800/60 ring-2 ring-rose-100 dark:ring-rose-950/40'
                          : 'border-border hover:border-brand-orange/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-mono font-medium text-muted-foreground bg-surface-soft px-2 py-0.5 rounded-md">
                            Paket {booking.paket}
                          </span>
                          {isCheckoutToday ? (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60 px-2 py-0.5 rounded-full">
                              🔔 Jadwal Hari Ini
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground/60" />
                              s/d {formatTanggalPendek(booking.tanggal_keluar_estimasi)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-soft border border-border shrink-0">
                            {cat?.foto_url ? (
                              <img
                                src={cat.foto_url}
                                alt={cat.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl bg-amber-500/10">
                                🐾
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-brand-orange transition-colors truncate">
                              {cat?.nama}
                            </h3>
                            <div className="text-xs text-muted-foreground truncate">
                              {cat?.ras || 'Domestik'} • {cat?.jenis_kelamin}
                            </div>
                            <div className="text-xs text-primary font-medium mt-1 truncate flex items-center gap-1">
                              <span>{owner?.nama}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {owner?.no_wa}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Billing Preview Footer */}
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase font-mono">
                            Estimasi Sisa
                          </div>
                          <div className="font-mono font-bold text-sm text-primary tabular-nums">
                            Rp {formatRupiah(billing.sisa_bayar)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="text-xs h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer rounded-xl shadow-xs"
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
            pengaturan={pengaturan}
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
          namaUsaha={pengaturan.nama_usaha}
        />

        {/* STRUK PDF PRINT PREVIEW */}
        <StrukPdf
          isOpen={isStrukOpen}
          onClose={() => setIsStrukOpen(false)}
          booking={completedBooking}
          pengaturan={pengaturan}
        />
      </div>
    </AdminLayout>
  )
}
