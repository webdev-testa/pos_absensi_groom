import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QRCodeSVG } from 'qrcode.react'
import {
  QrCode,
  Banknote,
  Building,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  MessageCircle,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'
import { formatRupiah, copyToClipboard } from '@/utils/pos.utils'
import type { Pengaturan } from '@/types/pos'
import { toast } from 'sonner'

export type PaymentMethod = 'QRIS' | 'Tunai' | 'Transfer'

export interface PaymentSuccessResult {
  method: PaymentMethod
  amountPaid: number
  cashTendered?: number
  change?: number
  referenceNote?: string
}

interface PosPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  title?: string
  customerName?: string
  catName?: string
  itemSummary?: string
  pengaturan?: Pengaturan
  initialMethod?: PaymentMethod
  onPaymentSuccess: (result: PaymentSuccessResult) => void
  onPrintReceipt?: () => void
  onOpenWaTemplate?: () => void
}

export function PosPaymentModal({
  isOpen,
  onClose,
  totalAmount,
  title = 'Pembayaran Kasir POS',
  customerName = 'Pelanggan',
  catName = 'Kucing',
  itemSummary = 'Penitipan Kucing',
  pengaturan = {
    id: 1,
    nama_usaha: 'Dr. Meow Cat Hotel & Care',
    no_wa_usaha: '081234567890',
    alamat_usaha: 'Jl. Ahmad Yani No. 45, Jakarta Selatan',
    nama_bank: 'BCA (Bank Central Asia)',
    no_rekening: '8735091234',
    atas_nama_rekening: 'Dr. Meow Cat Clinic',
    qris_nmid: 'ID1020304050607',
  },
  initialMethod = 'QRIS',
  onPaymentSuccess,
  onPrintReceipt,
  onOpenWaTemplate,
}: PosPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(initialMethod)
  const [cashTendered, setCashTendered] = useState<number | ''>(totalAmount)
  const [transferRef, setTransferRef] = useState('')
  const [copiedBank, setCopiedBank] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successDetails, setSuccessDetails] = useState<PaymentSuccessResult | null>(null)
  const [isSimulatingQris, setIsSimulatingQris] = useState(false)
  const [qrisTimer, setQrisTimer] = useState(300) // 5 minutes countdown

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(initialMethod)
      setCashTendered(totalAmount)
      setTransferRef('')
      setCopiedBank(false)
      setIsSuccess(false)
      setSuccessDetails(null)
      setQrisTimer(300)
    }
  }, [isOpen, totalAmount, initialMethod])

  // QRIS Countdown Timer
  useEffect(() => {
    if (!isOpen || isSuccess || selectedMethod !== 'QRIS') return
    const interval = setInterval(() => {
      setQrisTimer(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [isOpen, isSuccess, selectedMethod])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate Cash Change
  const numericCash = Number(cashTendered) || 0
  const cashChange = numericCash - totalAmount
  const isCashSufficient = numericCash >= totalAmount

  // QRIS Dynamic Payload Generator
  const qrisPayload = useMemo(() => {
    const nmid = pengaturan.qris_nmid || 'ID1020304050607'
    const invoiceId = `INV-${Date.now().toString().slice(-6)}`
    // Standard dynamic QRIS format string mock
    return `00020101021226${nmid.length}${nmid}52045999530336054${totalAmount.toString().length}${totalAmount}5802ID59${(pengaturan.nama_usaha || 'DR MEOW').length}${pengaturan.nama_usaha || 'DR MEOW'}6007JAKARTA62${invoiceId.length + 4}01${invoiceId.length}${invoiceId}6304`
  }, [pengaturan.qris_nmid, pengaturan.nama_usaha, totalAmount])

  // Copy Bank Account Number
  const handleCopyBank = async () => {
    const acc = pengaturan.no_rekening || '8735091234'
    const ok = await copyToClipboard(acc)
    if (ok) {
      setCopiedBank(true)
      toast.success('Nomor rekening disalin ke clipboard!')
      setTimeout(() => setCopiedBank(false), 2500)
    }
  }

  // Confirm Payment
  const handleConfirmPayment = (method: PaymentMethod) => {
    let result: PaymentSuccessResult

    if (method === 'Tunai') {
      if (!isCashSufficient) {
        toast.error('Uang tunai yang diterima kurang dari total tagihan!')
        return
      }
      result = {
        method: 'Tunai',
        amountPaid: totalAmount,
        cashTendered: numericCash,
        change: Math.max(0, cashChange),
      }
    } else if (method === 'Transfer') {
      result = {
        method: 'Transfer',
        amountPaid: totalAmount,
        referenceNote: transferRef.trim() || undefined,
      }
    } else {
      // QRIS
      result = {
        method: 'QRIS',
        amountPaid: totalAmount,
      }
    }

    setSuccessDetails(result)
    setIsSuccess(true)
    onPaymentSuccess(result)
    toast.success(`Pembayaran ${method} sebesar Rp ${formatRupiah(totalAmount)} berhasil diterima!`, {
      description: 'Transaksi telah tercatat dan status pembayaran lunas.',
    })
  }

  // Simulate Instant QRIS Check
  const handleSimulateQrisCheck = () => {
    setIsSimulatingQris(true)
    setTimeout(() => {
      setIsSimulatingQris(false)
      handleConfirmPayment('QRIS')
    }, 900)
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-w-[calc(100%-2rem)] bg-white border border-border shadow-2xl p-6 sm:p-7 rounded-2xl max-h-[92vh] overflow-y-auto">
        {!isSuccess ? (
          <div className="space-y-5">
            {/* Header */}
            <DialogHeader className="text-left pb-3 border-b border-border/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kasir Pembayaran POS
                </div>
                <span className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  {title}
                </span>
              </div>
              <DialogTitle className="text-lg font-heading font-bold text-ink flex items-center justify-between pt-1">
                <span>Rincian Tagihan Kasir</span>
                <span className="text-xl font-mono text-emerald-600 font-extrabold">
                  Rp {formatRupiah(totalAmount)}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-muted flex items-center gap-2 pt-0.5">
                <span>Owner: <strong>{customerName}</strong></span>
                <span>•</span>
                <span>Anabul: <strong>{catName}</strong></span>
                <span>•</span>
                <span className="truncate max-w-[180px]">{itemSummary}</span>
              </DialogDescription>
            </DialogHeader>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Pilih Metode Pembayaran:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('QRIS')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedMethod === 'QRIS'
                      ? 'border-brand-orange bg-amber-50/60 shadow-xs'
                      : 'border-hairline bg-surface-soft hover:bg-white'
                  }`}
                >
                  <QrCode
                    className={`w-5 h-5 mb-1 ${
                      selectedMethod === 'QRIS' ? 'text-brand-orange' : 'text-ink-muted'
                    }`}
                  />
                  <span className="text-xs font-bold text-ink">QRIS</span>
                  <span className="text-[10px] text-ink-muted">Scan e-Wallet/Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod('Tunai')
                    setCashTendered(totalAmount)
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedMethod === 'Tunai'
                      ? 'border-brand-orange bg-amber-50/60 shadow-xs'
                      : 'border-hairline bg-surface-soft hover:bg-white'
                  }`}
                >
                  <Banknote
                    className={`w-5 h-5 mb-1 ${
                      selectedMethod === 'Tunai' ? 'text-emerald-600' : 'text-ink-muted'
                    }`}
                  />
                  <span className="text-xs font-bold text-ink">Tunai / Cash</span>
                  <span className="text-[10px] text-ink-muted">Hitung Kembalian</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('Transfer')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedMethod === 'Transfer'
                      ? 'border-brand-orange bg-amber-50/60 shadow-xs'
                      : 'border-hairline bg-surface-soft hover:bg-white'
                  }`}
                >
                  <Building
                    className={`w-5 h-5 mb-1 ${
                      selectedMethod === 'Transfer' ? 'text-blue-600' : 'text-ink-muted'
                    }`}
                  />
                  <span className="text-xs font-bold text-ink">Transfer Bank</span>
                  <span className="text-[10px] text-ink-muted">BCA / Mandiri / BRI</span>
                </button>
              </div>
            </div>

            {/* TAB 1: QRIS SCREEN */}
            {selectedMethod === 'QRIS' && (
              <div className="space-y-4 pt-1 animate-in fade-in-50 duration-200">
                <div className="p-5 bg-[#FAF8F5] border border-border rounded-2xl flex flex-col items-center text-center shadow-inner">
                  {/* QRIS Header Banner */}
                  <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-dashed border-border/80">
                    <div className="flex items-center gap-1.5 font-heading font-extrabold text-sm text-red-600 tracking-wider">
                      <span>QRIS</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">
                        GPN
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-ink">
                        {pengaturan.nama_usaha || 'Dr. Meow Cat Hotel'}
                      </div>
                      <div className="text-[10px] font-mono text-ink-muted">
                        NMID: {pengaturan.qris_nmid || 'ID1020304050607'}
                      </div>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-4 bg-white rounded-2xl border-2 border-hairline shadow-md inline-block relative group">
                    <QRCodeSVG
                      value={qrisPayload}
                      size={190}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: '/favicon.svg',
                        x: undefined,
                        y: undefined,
                        height: 32,
                        width: 32,
                        excavate: true,
                      }}
                    />
                  </div>

                  {/* Amount Pill */}
                  <div className="mt-3.5 mb-1">
                    <div className="text-[11px] uppercase tracking-wider font-mono text-ink-muted font-semibold">
                      Total Nominal Pembayaran
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-primary">
                      Rp {formatRupiah(totalAmount)}
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mt-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>QR Berlaku: {formatTimer(qrisTimer)}</span>
                  </div>

                  <p className="text-[11px] text-ink-muted max-w-sm mt-3 leading-relaxed">
                    Scan menggunakan aplikasi <strong>BCA Mobile, Livin Mandiri, GoPay, OVO, ShopeePay, Dana</strong>, atau m-Banking lainnya.
                  </p>
                </div>

                {/* QRIS Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSimulateQrisCheck}
                    disabled={isSimulatingQris}
                    className="flex-1 text-xs h-10 border-hairline hover:bg-surface-soft cursor-pointer gap-1.5"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isSimulatingQris ? 'animate-spin' : ''}`}
                    />
                    {isSimulatingQris ? 'Mengecek...' : 'Cek Status QRIS'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleConfirmPayment('QRIS')}
                    className="flex-1 text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Konfirmasi Lunas (QRIS)
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: TUNAI / CASH CALCULATOR */}
            {selectedMethod === 'Tunai' && (
              <div className="space-y-4 pt-1 animate-in fade-in-50 duration-200">
                <div className="p-5 bg-[#FAF8F5] border border-border rounded-2xl space-y-4">
                  {/* Total Bill Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-hairline">
                    <span className="text-xs font-semibold text-ink-muted">
                      Total Tagihan:
                    </span>
                    <span className="text-xl font-mono font-bold text-primary">
                      Rp {formatRupiah(totalAmount)}
                    </span>
                  </div>

                  {/* Cash Input */}
                  <div>
                    <label
                      htmlFor="cash-tendered-input"
                      className="block text-xs font-semibold text-ink mb-1.5"
                    >
                      Uang Tunai Diterima (Rp) *
                    </label>
                    <Input
                      id="cash-tendered-input"
                      type="number"
                      value={cashTendered}
                      onChange={e =>
                        setCashTendered(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className="h-12 text-base font-mono font-bold text-primary pl-4 bg-white border-2 border-hairline focus-visible:border-primary rounded-xl"
                      autoFocus
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="block text-[11px] text-ink-muted mb-1.5 font-medium">
                      Pilihan Uang Cepat:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCashTendered(totalAmount)}
                        className="text-xs h-8 bg-white border-hairline hover:bg-amber-50 hover:border-brand-orange cursor-pointer font-mono font-semibold text-brand-orange"
                      >
                        Uang Pas (Rp {formatRupiah(totalAmount)})
                      </Button>
                      {[50000, 100000, 200000, 500000].map(amt => (
                        <Button
                          key={amt}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCashTendered(amt)}
                          className="text-xs h-8 bg-white border-hairline hover:bg-surface-soft cursor-pointer font-mono"
                        >
                          Rp {formatRupiah(amt)}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCashTendered(prev => (Number(prev) || 0) + 50000)
                        }
                        className="text-xs h-8 bg-white border-hairline hover:bg-surface-soft cursor-pointer font-mono text-emerald-700"
                      >
                        +50.000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCashTendered(prev => (Number(prev) || 0) + 100000)
                        }
                        className="text-xs h-8 bg-white border-hairline hover:bg-surface-soft cursor-pointer font-mono text-emerald-700"
                      >
                        +100.000
                      </Button>
                    </div>
                  </div>

                  {/* Change Calculation Box */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCashSufficient
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCashSufficient ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold">
                          {isCashSufficient
                            ? cashChange === 0
                              ? 'Uang Pas'
                              : 'Uang Kembalian'
                            : 'Uang Masih Kurang'}
                        </div>
                        <div className="text-[10px] opacity-80">
                          {isCashSufficient
                            ? 'Siap cetak struk dan serahkan kembalian'
                            : 'Nominal tunai belum mencukupi'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-lg font-extrabold">
                      {isCashSufficient
                        ? `Rp ${formatRupiah(Math.max(0, cashChange))}`
                        : `- Rp ${formatRupiah(Math.abs(cashChange))}`}
                    </div>
                  </div>
                </div>

                {/* Cash Confirm Button */}
                <Button
                  type="button"
                  disabled={!isCashSufficient}
                  onClick={() => handleConfirmPayment('Tunai')}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-xs cursor-pointer gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Pembayaran Tunai & Selesai
                </Button>
              </div>
            )}

            {/* TAB 3: TRANSFER BANK SCREEN */}
            {selectedMethod === 'Transfer' && (
              <div className="space-y-4 pt-1 animate-in fade-in-50 duration-200">
                <div className="p-5 bg-[#FAF8F5] border border-border rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-hairline">
                    <span className="text-xs font-semibold text-ink-muted">
                      Total yang Harus Ditransfer:
                    </span>
                    <span className="text-xl font-mono font-bold text-primary">
                      Rp {formatRupiah(totalAmount)}
                    </span>
                  </div>

                  {/* Bank Account Details Card */}
                  <div className="p-4 bg-white rounded-xl border border-hairline shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="font-heading font-bold text-sm text-ink">
                          {pengaturan.nama_bank || 'Bank Central Asia (BCA)'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                        Transfer Manual
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-surface-soft rounded-lg border border-hairline">
                      <div>
                        <div className="text-[10px] text-ink-muted uppercase font-mono">
                          Nomor Rekening
                        </div>
                        <div className="text-base font-mono font-bold text-primary tracking-wider">
                          {pengaturan.no_rekening || '8735091234'}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyBank}
                        className="text-xs h-8 border-hairline bg-white hover:bg-blue-50 gap-1 cursor-pointer"
                      >
                        {copiedBank ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-ink-muted" />
                            <span>Salin</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-xs text-ink-muted">
                      Atas Nama: <strong className="text-ink">{pengaturan.atas_nama_rekening || 'Dr. Meow Cat Clinic'}</strong>
                    </div>
                  </div>

                  {/* Optional Reference Input */}
                  <div>
                    <label
                      htmlFor="transfer-ref-input"
                      className="block text-xs font-semibold text-ink mb-1"
                    >
                      Catatan / No. Referensi Transfer (Opsional)
                    </label>
                    <Input
                      id="transfer-ref-input"
                      type="text"
                      placeholder="Contoh: TF BCA a/n Budi Santoso"
                      value={transferRef}
                      onChange={e => setTransferRef(e.target.value)}
                      className="h-10 text-xs sm:text-sm bg-white"
                    />
                  </div>
                </div>

                {/* Transfer Confirm Button */}
                <Button
                  type="button"
                  onClick={() => handleConfirmPayment('Transfer')}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Transfer Diterima & Selesai
                </Button>
              </div>
            )}

            {/* Modal Cancel Button */}
            <div className="pt-2 border-t border-border/60 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs h-9 text-ink-muted hover:text-ink cursor-pointer"
              >
                Batal / Tutup Kasir
              </Button>
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS SCREEN */
          <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs text-2xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✓ Transaksi Berhasil
              </span>
              <h2 className="text-xl font-heading font-extrabold text-ink mt-2">
                Pembayaran Lunas!
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Uang telah berhasil diterima melalui metode{' '}
                <strong className="text-primary font-bold">
                  {successDetails?.method}
                </strong>
                .
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-[#FAF8F5] border border-hairline rounded-2xl text-left text-xs font-sans space-y-2 max-w-sm mx-auto shadow-inner">
              <div className="flex justify-between text-ink-muted">
                <span>Pelanggan / Anabul:</span>
                <span className="font-semibold text-ink">
                  {customerName} ({catName})
                </span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Metode Bayar:</span>
                <span className="font-mono font-bold text-primary">
                  {successDetails?.method}
                </span>
              </div>
              <div className="flex justify-between text-ink font-bold pt-1.5 border-t border-hairline text-sm">
                <span>Total Bayar:</span>
                <span className="font-mono text-emerald-700">
                  Rp {formatRupiah(totalAmount)}
                </span>
              </div>

              {successDetails?.method === 'Tunai' && (
                <>
                  <div className="flex justify-between text-ink-muted pt-1 border-t border-dashed border-hairline">
                    <span>Uang Diterima:</span>
                    <span className="font-mono">
                      Rp {formatRupiah(successDetails.cashTendered || totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Kembalian:</span>
                    <span className="font-mono">
                      Rp {formatRupiah(successDetails.change || 0)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons: Print Struk, WA Template, and Finish */}
            <div className="space-y-2.5 max-w-sm mx-auto pt-1">
              <div className="grid grid-cols-2 gap-2">
                {onPrintReceipt && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onPrintReceipt}
                    className="h-10 text-xs border-hairline font-medium hover:bg-surface-soft cursor-pointer gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-primary" />
                    Cetak Struk
                  </Button>
                )}

                {onOpenWaTemplate && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenWaTemplate}
                    className="h-10 text-xs border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer gap-1.5 font-medium"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Kirim WA
                  </Button>
                )}
              </div>

              <Button
                type="button"
                onClick={onClose}
                className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl cursor-pointer gap-1.5"
              >
                Selesai & Tutup Kasir <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
