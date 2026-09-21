import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PosPaymentModal } from '../PosPaymentModal'

describe('src/components/pos/PosPaymentModal.tsx - Component Tests', () => {
  const defaultPengaturan = {
    id: 1,
    nama_usaha: 'Dr. Meow Cat Hotel & Clinic',
    no_wa_usaha: '081234567890',
    alamat_usaha: 'Jl. Ahmad Yani No. 45',
    nama_bank: 'BCA (Bank Central Asia)',
    no_rekening: '8735091234',
    atas_nama_rekening: 'Dr. Meow Cat Clinic',
    qris_nmid: 'ID1020304050607',
  }

  it('renders payment modal header, total amount, and method selectors', () => {
    render(
      <PosPaymentModal
        isOpen={true}
        onClose={vi.fn()}
        totalAmount={150000}
        customerName="Dewi"
        catName="Mochi"
        pengaturan={defaultPengaturan}
        onPaymentSuccess={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: /Rincian Tagihan Kasir/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Rp 150.000/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /^QRIS/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tunai \/ Cash/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Transfer Bank/i })).toBeInTheDocument()
  })

  it('calculates cash change when selecting Tunai and inputting tendered cash', () => {
    const handleSuccess = vi.fn()

    render(
      <PosPaymentModal
        isOpen={true}
        onClose={vi.fn()}
        totalAmount={150000}
        initialMethod="Tunai"
        customerName="Dewi"
        catName="Mochi"
        pengaturan={defaultPengaturan}
        onPaymentSuccess={handleSuccess}
      />
    )

    // Switch to Tunai if needed or find cash input
    const tunaiTab = screen.getByRole('button', { name: /Tunai \/ Cash/i })
    fireEvent.click(tunaiTab)

    // Find input for cash tendered
    const cashInput = screen.getByDisplayValue('150000')
    fireEvent.change(cashInput, { target: { value: '200000' } })

    // Change should show Uang Kembalian and Rp 50.000
    expect(screen.getByText(/Uang Kembalian/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Rp 50.000/i).length).toBeGreaterThanOrEqual(1)

    // Submit payment
    const bayarBtn = screen.getByRole('button', { name: /Konfirmasi Pembayaran Tunai & Selesai/i })
    fireEvent.click(bayarBtn)

    expect(handleSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'Tunai',
        amountPaid: 150000,
        cashTendered: 200000,
        change: 50000,
      })
    )
  })

  it('shows bank transfer details and reference note input when Transfer is selected', () => {
    const handleSuccess = vi.fn()

    render(
      <PosPaymentModal
        isOpen={true}
        onClose={vi.fn()}
        totalAmount={100000}
        initialMethod="Transfer"
        customerName="Dewi"
        catName="Mochi"
        pengaturan={defaultPengaturan}
        onPaymentSuccess={handleSuccess}
      />
    )

    expect(screen.getByText(/8735091234/i)).toBeInTheDocument()
    expect(screen.getByText(/BCA \(Bank Central Asia\)/i)).toBeInTheDocument()

    const confirmTransferBtn = screen.getByRole('button', { name: /Konfirmasi Transfer Diterima & Selesai/i })
    fireEvent.click(confirmTransferBtn)

    expect(handleSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'Transfer',
        amountPaid: 100000,
      })
    )
  })
})
