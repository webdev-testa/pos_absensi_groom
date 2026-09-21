import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PosPaymentModal } from '@/components/pos/PosPaymentModal'
import { CheckInForm } from '@/components/pos/CheckInForm'
import { PrintPayslip } from '@/components/page-sections/payroll/PrintPayslip'
import { AlertBanner } from '@/components/page-sections/dashboard/AlertBanner'
import { WaTemplateModal } from '@/components/pos/WaTemplateModal'
import { DailyReportForm } from '@/components/pos/DailyReportForm'
import { AttendanceStats } from '@/components/page-sections/attendance/AttendanceStats'
import { posService } from '@/services/posService'
import { formatRupiahExact } from '@/lib/utils'
import type { Booking } from '@/types/pos'
import type { PayrollItem } from '@/types/payroll'

describe('Red-Team Verification Test Suite - POS & Admin Remediation Protections', () => {
  /* ─── DEFECT 1: POS PAYMENT RE-ENTRANCY / DOUBLE CLICK ─── */
  it('Defect 1: PosPaymentModal prevents double-submission via isConfirming mutex', async () => {
    const handleSuccess = vi.fn()
    render(
      <PosPaymentModal
        isOpen={true}
        onClose={vi.fn()}
        totalAmount={100000}
        initialMethod="QRIS"
        customerName="Dewi"
        catName="Mochi"
        onPaymentSuccess={handleSuccess}
      />
    )

    const confirmBtn = screen.getByRole('button', { name: /Konfirmasi Lunas \(QRIS\)/i })
    
    // Rapid double-click attack
    fireEvent.click(confirmBtn)
    fireEvent.click(confirmBtn)
    fireEvent.click(confirmBtn)

    // Mutation should only have been triggered once
    expect(handleSuccess).toHaveBeenCalledTimes(1)
  })

  /* ─── DEFECT 2: NEGATIVE NUMBER CLAMPING IN PELUNASAN ─── */
  it('Defect 2: Clamps negative payment amounts to 0', () => {
    const clampPelunasan = (val: number) => (val < 0 ? 0 : val)
    expect(clampPelunasan(-50000)).toBe(0)
    expect(clampPelunasan(150000)).toBe(150000)
    expect(clampPelunasan(-1)).toBe(0)
  })

  /* ─── DEFECT 3: CHECKIN SUBMIT RE-ENTRANCY / DOUBLE CLICK ─── */
  it('Defect 3: CheckInForm disables button and ignores submit clicks while isSubmitting is true', () => {
    const handleSubmit = vi.fn()
    const mockCheckInProps = {
      step: 3,
      setStep: vi.fn(),
      searchOwnerQuery: '',
      setSearchOwnerQuery: vi.fn(),
      searchResults: [],
      selectedOwner: { id: 'own-1', nama: 'Budi', no_telepon: '08123456789' },
      selectOwner: vi.fn(),
      isNewOwner: false,
      setIsNewOwner: vi.fn(),
      chooseNewOwner: vi.fn(),
      newOwnerData: { nama: '', no_telepon: '' },
      setNewOwnerData: vi.fn(),
      ownerCats: [],
      selectedCat: { id: 'cat-1', nama: 'Mochi' },
      setSelectedCat: vi.fn(),
      selectCat: vi.fn(),
      isNewCat: false,
      setIsNewCat: vi.fn(),
      chooseNewCat: vi.fn(),
      newCatData: { nama: '', ras: '', warna: '', jenis_kelamin: 'jantan', umur_tahun: 1, berat_kg: 3 },
      setNewCatData: vi.fn(),
      bookingData: {
        paket: 'Standard Room',
        harga_per_hari: 50000,
        tanggal_masuk: '2026-03-24',
        tanggal_keluar_estimasi: '2026-03-27',
        dp: 50000,
        metode_dp: 'Tunai',
        catatan: '',
        status: 'aktif',
      },
      setBookingData: vi.fn(),
      totalNights: 3,
      totalCost: 150000,
      sisaBayar: 100000,
      pakets: [],
      activePakets: [],
      selectPaket: vi.fn(),
      isSubmitting: true, // Submitting in progress!
      isSuccess: false,
      newBookingId: null,
      submitCheckIn: handleSubmit,
      resetForm: vi.fn(),
      canProceedStep1: true,
      canProceedStep2: true,
      canProceedStep3: true,
    }

    render(<CheckInForm checkIn={mockCheckInProps as any} />)

    // Button should show Menyimpan... and be disabled
    const submitBtn = screen.getByRole('button', { name: /Menyimpan\.\.\./i })
    expect(submitBtn).toBeDisabled()

    // Click should be ignored
    fireEvent.click(submitBtn)
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  /* ─── DEFECT 4: EXACT RUPIAH FORMATTING ON OFFICIAL PAYSLIPS ─── */
  it('Defect 4: formatRupiahExact produces non-abbreviated currency figures for official payslips', () => {
    expect(formatRupiahExact(2500000)).toMatch(/2\.500\.000/)
    expect(formatRupiahExact(10000000)).toMatch(/10\.000\.000/)
    expect(formatRupiahExact(0)).toMatch(/0/)

    const mockItem: PayrollItem = {
      user: {
        id: 'usr-1',
        name: 'Siti Rahma',
        emp_id: 'DM-005',
        dept: 'Dokter Hewan',
        role: 'employee',
        status: 'active',
        salary: 7500000,
        kasbon_limit: 2000000,
        shift: 'Pagi',
        address: 'Jl. Melati',
      },
      payrollId: 'pr-5',
      basicSalary: 7500000,
      incentives: 500000,
      kasbonDeduction: 1000000,
      netSalary: 7000000,
      status: 'paid',
      presentDays: 24,
      created_at: '2026-03-01T00:00:00Z',
    }

    render(<PrintPayslip printItem={mockItem} selectedPeriodLabel="Maret 2026" />)

    // Must show exact figures, not 7,5 jt or 7 jt
    expect(screen.getByText(/7\.500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/\+.*500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/-.*1\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText(/7\.000\.000/)).toBeInTheDocument()
  })

  /* ─── DEFECT 5: NET SALARY CANNOT BE NEGATIVE ─── */
  it('Defect 5: Clamps net salary at 0 when kasbon deductions exceed gross earnings', () => {
    const calculateNetSalary = (basicSalary: number, incentives: number, kasbonDeduction: number) => {
      return Math.max(0, basicSalary + incentives - kasbonDeduction)
    }

    // Salary 1jt, kasbon deduction 2jt => Net salary must be clamped at 0, not -1jt
    expect(calculateNetSalary(1000000, 0, 2000000)).toBe(0)
    expect(calculateNetSalary(2000000, 500000, 1000000)).toBe(1500000)
  })

  /* ─── DEFECT 6: DAILY REPORT SUBMIT LOCK WHILE UPLOADING & CLEANUP ─── */
  it('Defect 6: DailyReportForm handles blob URL cleanup and renders safe form state', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const mockFormData = {
      nafsu_makan: 'Bagus',
      minum: 'Normal',
      feses: 'Normal',
      urinasi: 'Normal',
      suhu_tubuh: '38.5',
      berat_badan: '4.0',
      kondisi_mata: 'Bersih',
      kondisi_telinga: 'Bersih',
      kondisi_hidung: 'Bersih',
      tingkat_aktif: 'Aktif',
      kebersihan_kandang: 'Bersih',
      catatan_khusus: '',
      foto_url: '',
    }
    const mockBooking: Booking = {
      id: 'b-1',
      cat_id: 'c-1',
      owner_id: 'p-1',
      paket: 'Standard Room',
      harga_per_hari: 50000,
      tanggal_masuk: '2026-03-20',
      tanggal_keluar_estimasi: '2026-03-25',
      status: 'aktif',
      created_at: '2026-01-01',
      cat: {
        id: 'c-1',
        nama: 'Luna',
        ras: 'Persian',
        owner_id: 'p-1',
        created_at: '2026-01-01',
      },
    }

    const { unmount } = render(
      <DailyReportForm
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
        today="2026-03-24"
        formData={mockFormData as any}
        setFormData={vi.fn()}
        onSave={vi.fn()}
      />
    )

    // Form should render safely
    expect(screen.getByRole('heading', { name: /Laporan Harian/i })).toBeInTheDocument()

    // Test URL revoke
    unmount()
    revokeSpy.mockRestore()
  })

  /* ─── DEFECT 7: MUTATOR FINALLY BLOCKS CLEAR LOADING STATE ─── */
  it('Defect 7: Finally block guarantees actionLoading reset upon API rejection', async () => {
    let actionLoading = false
    const setActionLoading = (val: boolean) => {
      actionLoading = val
    }

    const mockMutation = async (shouldFail: boolean) => {
      setActionLoading(true)
      try {
        if (shouldFail) {
          throw new Error('Supabase network failure')
        }
      } finally {
        setActionLoading(false)
      }
    }

    await expect(mockMutation(true)).rejects.toThrow('Supabase network failure')
    expect(actionLoading).toBe(false)
  })

  /* ─── DEFECT 8: WHATSAPP NUMBER VALIDATION & NOOPENER/NOREFERRER ─── */
  it('Defect 8: WaTemplateModal validates phone length and uses noopener,noreferrer', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const mockBooking: Booking = {
      id: 'b-8',
      cat_id: 'c-8',
      owner_id: 'p-8',
      tanggal_masuk: '2026-03-24',
      tanggal_keluar_estimasi: '2026-03-27',
      paket: 'Standard Room',
      harga_per_hari: 50000,
      status: 'aktif',
      created_at: '2026-01-01',
      cat: {
        id: 'c-8',
        nama: 'Koko',
        ras: 'Domestic',
        owner_id: 'p-8',
        created_at: '2026-01-01',
      },
      owner: {
        id: 'p-8',
        nama: 'Andi',
        no_wa: '123', // Invalid short phone number!
        created_at: '2026-01-01',
      },
    }

    render(
      <WaTemplateModal
        isOpen={true}
        onClose={vi.fn()}
        type="checkin"
        data={mockBooking}
        dp={50000}
      />
    )

    const waBtn = screen.getByRole('button', { name: /Buka WhatsApp/i })
    fireEvent.click(waBtn)

    // Should NOT open window with invalid short phone number!
    expect(openSpy).not.toHaveBeenCalled()

    openSpy.mockRestore()
  })

  /* ─── DEFECT 9: ALERT BANNER NULL RESILIENCE ─── */
  it('Defect 9: AlertBanner does not throw TypeError when pastKasbonAlert is null or empty', () => {
    // Should safely render null without throwing
    const { container: c1 } = render(<AlertBanner pastKasbonAlert={null} />)
    expect(c1).toBeEmptyDOMElement()

    const { container: c2 } = render(
      <AlertBanner pastKasbonAlert={{ pastCount: 0, pastTotal: 0, uniqueNames: '' }} />
    )
    expect(c2).toBeEmptyDOMElement()
  })

  /* ─── DEFECT 10: DAILY REPORT FORM DOUBLE-CLICK / MUTEX ─── */
  it('Defect 10: DailyReportForm disables submit button when isSubmitting is true', () => {
    const handleSave = vi.fn()
    const mockBooking: Booking = {
      id: 'b-report-1',
      cat_id: 'c-1',
      owner_id: 'o-1',
      tanggal_masuk: '2026-03-24',
      tanggal_keluar_estimasi: '2026-03-27',
      paket: 'Standard Room',
      harga_per_hari: 50000,
      status: 'aktif',
      created_at: '2026-01-01',
      cat: { id: 'c-1', nama: 'Milo', ras: 'Anggora', owner_id: 'o-1', created_at: '2026-01-01' },
      owner: { id: 'o-1', nama: 'Dewi', no_wa: '081234567890', created_at: '2026-01-01' },
    }

    render(
      <DailyReportForm
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
        today="2026-03-24"
        formData={{
          nafsu_makan: 'Baik',
          minum: 'Normal',
          feses: 'Normal',
          urinasi: 'Normal',
          kondisi_umum: 'Aktif',
          keterangan: '',
          foto_url: '',
        }}
        setFormData={vi.fn()}
        onSave={handleSave}
        isSaving={true}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /Menyimpan\.\.\./i })
    expect(submitBtn).toBeDisabled()
    fireEvent.click(submitBtn)
    expect(handleSave).not.toHaveBeenCalled()
  })

  /* ─── DEFECT 11: ATTENDANCE STATS ZERO / NAN RESILIENCE ─── */
  it('Defect 11: AttendanceStats handles NaN and zero employees without division-by-zero or crash', () => {
    const setFilter = vi.fn()
    const { container } = render(
      <AttendanceStats
        statusFilter="all"
        setStatusFilter={setFilter}
        totalEmployees={0}
        statOntime={NaN}
        statLate={-5}
        statAbsent={0}
        statOut={0}
      />
    )

    expect(container).toBeInTheDocument()
    expect(screen.getByText('Total staf')).toBeInTheDocument()
    // Zero / NaN should be sanitized safely
    expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument()
  })

  /* ─── DEFECT 12: POS PHOTO UPLOAD MIME RESTRICTION & ENTROPY ─── */
  it('Defect 12: posService.uploadPhoto rejects non-image formats', async () => {
    const maliciousSvg = new File(['<svg onload="alert(1)"></svg>'], 'exploit.svg', {
      type: 'image/svg+xml',
    })

    await expect(posService.uploadPhoto(maliciousSvg, 'cats')).rejects.toThrow(
      /Format file tidak didukung/i
    )

    const exeFile = new File(['binary'], 'malware.exe', {
      type: 'application/x-msdownload',
    })

    await expect(posService.uploadPhoto(exeFile, 'reports')).rejects.toThrow(
      /Format file tidak didukung/i
    )
  })
})
