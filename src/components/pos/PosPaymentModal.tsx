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

  const [isConfirming, setIsConfirming] = useState(false)

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
      setIsConfirming(false)
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
    if (isConfirming) return
    setIsConfirming(true)

    let result: PaymentSuccessResult

    if (method === 'Tunai') {
      if (!isCashSufficient) {
        setIsConfirming(false)
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
    setIsConfirming(false)
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
      <DialogContent className="sm:max-w-xl max-w-[calc(100%-2rem)] bg-card text-foreground border border-border shadow-2xl p-6 sm:p-7 rounded-2xl max-h-[92vh] overflow-y-auto">
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
              <DialogTitle className="text-lg font-heading font-bold text-foreground flex items-center justify-between pt-1">
                <span>Rincian Tagihan Kasir</span>
                <span className="text-xl font-mono text-emerald-600 dark:text-emerald-400 font-extrabold tabular-nums">
                  Rp {formatRupiah(totalAmount)}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 pt-0.5">
                <span>Owner: <strong>{customerName}</strong></span>
                <span>•</span>
                <span>Anabul: <strong>{catName}</strong></span>
                <span>•</span>
                <span className="truncate max-w-[180px]">{itemSummary}</span>
              </DialogDescription>
            </DialogHeader>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Pilih Metode Pembayaran:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('QRIS')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedMethod === 'QRIS'
                      ? 'border-brand-orange bg-amber-50/60 dark:bg-amber-950/40 shadow-xs'
                      : 'border-border bg-surface-soft hover:bg-card'
                  }`}
                >
                  <QrCode
                    className={`w-5 h-5 mb-1 ${
                      selectedMethod === 'QRIS' ? 'text-brand-orange' : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-xs font-bold text-foreground">QRIS</span>
                  <span className="text-[10px] text-muted-foreground">Scan e-Wallet/Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod('Tunai')
                    setCashTendered(totalAmount)
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedMethod === 'Tunai'
                      ? 'border-brand-orange bg-amber-50/60 dark:bg-amber-950/40 shadow-xs'
                      : 'border-border bg-surface-soft hover:bg-card'
                  }`}
                >
                  <Banknote
                    className={`w-5 h-5 mb-1 ${
                      selectedMethod === 'Tunai' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-xs font-bold text-foreground">Tunai / Cash</span>
                  <span className="text-[10px] text-muted-foreground">Hitung Kembalian</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('Transfer')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedMethod === 'Transfer'
                      ? 'border-brand-orange bg-amber-50/60 dark:bg-amber-950/40 shadow-xs'
                      : 'border-border bg-surface-soft hover:bg-card'
                  }`}
                >
                  <Building
                    className={`w-5 h-5 mb-1 ${
                      selectedMethod === 'Transfer' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-xs font-bold text-foreground">Transfer Bank</span>
                  <span className="text-[10px] text-muted-foreground">BCA / Mandiri / BRI</span>
                </button>
              </div>
            </div>

            {/* TAB 1: QRIS SCREEN */}
            {selectedMethod === 'QRIS' && (
              <div className="space-y-4 pt-1 animate-in fade-in-50 duration-200">
                <div className="p-5 bg-surface-soft border border-border rounded-2xl flex flex-col items-center text-center shadow-inner">
                  {/* QRIS Header Banner */}
                  <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-dashed border-border/80">
                    <div className="flex items-center gap-1.5 font-heading font-extrabold text-sm text-red-600 tracking-wider">
                      <span>QRIS</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">
                        GPN
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-foreground">
                        {pengaturan.nama_usaha || 'Dr. Meow Cat Hotel'}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        NMID: {pengaturan.qris_nmid || 'ID1020304050607'}
                      </div>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-4 bg-white rounded-2xl border-2 border-border shadow-md inline-block relative group">
                    {pengaturan.qris_image_url ? (
                      <div className="w-[190px] h-[190px] flex items-center justify-center overflow-hidden rounded-lg">
                        <img
                          src={pengaturan.qris_image_url}
                          alt="QRIS Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
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
                    )}
                  </div>

                  {/* Amount Pill */}
                  <div className="mt-3.5 mb-1">
                    <div className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                      Total Nominal Pembayaran
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-foreground tabular-nums">
                      Rp {formatRupiah(totalAmount)}
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/60 mt-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>QR Berlaku: {formatTimer(qrisTimer)}</span>
                  </div>

                  <p className="text-[11px] text-muted-foreground max-w-sm mt-3 leading-relaxed">
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
                    className="flex-1 text-xs h-10 border-border hover:bg-surface-soft cursor-pointer gap-1.5 rounded-xl"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isSimulatingQris ? 'animate-spin' : ''}`}
                    />
                    {isSimulatingQris ? 'Mengecek...' : 'Cek Status QRIS'}
                  </Button>
                  <Button
                    type="button"
                    disabled={isConfirming || isSimulatingQris}
                    onClick={() => handleConfirmPayment('QRIS')}
                    className="flex-1 text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer gap-1.5 rounded-xl disabled:opacity-50"
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
                <div className="p-5 bg-surface-soft border border-border rounded-2xl space-y-4">
                  {/* Total Bill Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Total Tagihan:
                    </span>
                    <span className="text-xl font-mono font-bold text-foreground tabular-nums">
                      Rp {formatRupiah(totalAmount)}
                    </span>
                  </div>

                  {/* Cash Input */}
                  <div>
                    <label
                      htmlFor="cash-tendered-input"
                      className="block text-xs font-semibold text-foreground mb-1.5"
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
                      className="h-12 text-base font-mono font-bold text-foreground pl-4 bg-card border border-input focus-visible:ring-ring/40 rounded-xl tabular-nums"
                      autoFocus
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="block text-[11px] text-muted-foreground mb-1.5 font-medium">
                      Pilihan Uang Cepat:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCashTendered(totalAmount)}
                        className="text-xs h-8 bg-card border-border hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-brand-orange cursor-pointer font-mono font-semibold text-brand-orange rounded-lg tabular-nums"
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
                          className="text-xs h-8 bg-card border-border hover:bg-surface-soft cursor-pointer font-mono rounded-lg tabular-nums"
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
                        className="text-xs h-8 bg-card border-border hover:bg-surface-soft cursor-pointer font-mono text-emerald-600 dark:text-emerald-400 rounded-lg tabular-nums"
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
                        className="text-xs h-8 bg-card border-border hover:bg-surface-soft cursor-pointer font-mono text-emerald-600 dark:text-emerald-400 rounded-lg tabular-nums"
                      >
                        +100.000
                      </Button>
                    </div>
                  </div>

                  {/* Change Calculation Box */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCashSufficient
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCashSufficient ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
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
                    <div className="text-right font-mono text-lg font-extrabold tabular-nums">
                      {isCashSufficient
                        ? `Rp ${formatRupiah(Math.max(0, cashChange))}`
                        : `- Rp ${formatRupiah(Math.abs(cashChange))}`}
                    </div>
                  </div>
                </div>

                {/* Cash Confirm Button */}
                <Button
                  type="button"
                  disabled={!isCashSufficient || isConfirming}
                  onClick={() => handleConfirmPayment('Tunai')}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-xs cursor-pointer gap-2 rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Pembayaran Tunai & Selesai
                </Button>
              </div>
            )}

            {/* TAB 3: TRANSFER BANK SCREEN */}
            {selectedMethod === 'Transfer' && (
              <div className="space-y-4 pt-1 animate-in fade-in-50 duration-200">
                <div className="p-5 bg-surface-soft border border-border rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Total yang Harus Ditransfer:
                    </span>
                    <span className="text-xl font-mono font-bold text-foreground tabular-nums">
                      Rp {formatRupiah(totalAmount)}
                    </span>
                  </div>

                  {/* Bank Account Details Card */}
                  <div className="p-4 bg-card rounded-xl border border-border shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-heading font-bold text-sm text-foreground">
                          {pengaturan.nama_bank || 'Bank Central Asia (BCA)'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-800/60">
                        Transfer Manual
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-surface-soft rounded-lg border border-border">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-mono">
                          Nomor Rekening
                        </div>
                        <div className="text-base font-mono font-bold text-foreground tracking-wider tabular-nums">
                          {pengaturan.no_rekening || '8735091234'}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyBank}
                        className="text-xs h-8 border-border bg-card hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1 cursor-pointer rounded-lg"
                      >
                        {copiedBank ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Salin</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Atas Nama: <strong className="text-foreground">{pengaturan.atas_nama_rekening || 'Dr. Meow Cat Clinic'}</strong>
                    </div>
                  </div>

                  {/* Optional Reference Input */}
                  <div>
                    <label
                      htmlFor="transfer-ref-input"
                      className="block text-xs font-semibold text-foreground mb-1"
                    >
                      Catatan / No. Referensi Transfer (Opsional)
                    </label>
                    <Input
                      id="transfer-ref-input"
                      type="text"
                      placeholder="Contoh: TF BCA a/n Budi Santoso"
                      value={transferRef}
                      onChange={e => setTransferRef(e.target.value)}
                      className="h-10 text-xs sm:text-sm bg-card border-input rounded-xl"
                    />
                  </div>
                </div>

                {/* Transfer Confirm Button */}
                <Button
                  type="button"
                  disabled={isConfirming}
                  onClick={() => handleConfirmPayment('Transfer')}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer gap-2 rounded-xl disabled:opacity-50"
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
                className="text-xs h-9 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
              >
                Batal / Tutup Kasir
              </Button>
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS SCREEN */
          <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs text-2xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                ✓ Transaksi Berhasil
              </span>
              <h2 className="text-xl font-heading font-extrabold text-foreground mt-2">
                Pembayaran Lunas!
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Uang telah berhasil diterima melalui metode{' '}
                <strong className="text-foreground font-bold">
                  {successDetails?.method}
                </strong>
                .
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-surface-soft border border-border rounded-2xl text-left text-xs font-sans space-y-2 max-w-sm mx-auto shadow-inner">
              <div className="flex justify-between text-muted-foreground">
                <span>Pelanggan / Anabul:</span>
                <span className="font-semibold text-foreground">
                  {customerName} ({catName})
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Metode Bayar:</span>
                <span className="font-mono font-bold text-foreground">
                  {successDetails?.method}
                </span>
              </div>
              <div className="flex justify-between text-foreground font-bold pt-1.5 border-t border-border text-sm">
                <span>Total Bayar:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  Rp {formatRupiah(totalAmount)}
                </span>
              </div>

              {successDetails?.method === 'Tunai' && (
                <>
                  <div className="flex justify-between text-muted-foreground pt-1 border-t border-dashed border-border">
                    <span>Uang Diterima:</span>
                    <span className="font-mono tabular-nums">
                      Rp {formatRupiah(successDetails.cashTendered || totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-semibold">
                    <span>Kembalian:</span>
                    <span className="font-mono tabular-nums">
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
                    className="h-10 text-xs border-border font-medium hover:bg-surface-soft cursor-pointer gap-1.5 rounded-xl"
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
                    className="h-10 text-xs border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer gap-1.5 font-medium rounded-xl"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Kirim WA
                  </Button>
                )}
              </div>

              <Button
                type="button"
                onClick={onClose}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl cursor-pointer gap-1.5 shadow-xs"
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
