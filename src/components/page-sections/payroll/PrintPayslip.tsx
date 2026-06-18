import { fmtCurrency } from "@/lib/utils";
import type { PayrollItem } from "@/types/payroll";

interface PrintPayslipProps {
  printItem: PayrollItem;
  selectedPeriodLabel: string;
}

export function PrintPayslip({ printItem, selectedPeriodLabel }: PrintPayslipProps) {
  return (
    <div id="print-payslip" className="hidden">
      <div className="max-w-xl mx-auto bg-white p-8 border border-[#E0DDD7] rounded-[16px] font-sans flex flex-col gap-6 text-[#1A1814]">
        {/* Slip Header */}
        <div className="border-b-2 border-[#1A1814] pb-4 flex justify-between items-end">
          <div>
            <h2 className="font-['Syne'] text-[24px] font-bold tracking-tight text-[#1A1814]">SLIP GAJI KARYAWAN</h2>
            <p className="text-[12.5px] text-[#6B6760] mt-1">Klinik Hewan Dr. Meow / HadiR System</p>
          </div>
          <div className="text-right text-[12px] font-mono">
            <div>Periode: {selectedPeriodLabel}</div>
            <div className="text-gray-400 mt-1">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Employee & Admin Meta Info */}
        <div className="grid grid-cols-2 gap-4 text-[13.5px] border-b border-[#E0DDD7] pb-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex"><span className="w-24 text-[#6B6760]">ID Karyawan</span><span className="font-mono">: {printItem.user.emp_id}</span></div>
            <div className="flex"><span className="w-24 text-[#6B6760]">Nama</span><span className="font-medium">: {printItem.user.name}</span></div>
            <div className="flex"><span className="w-24 text-[#6B6760]">Divisi</span><span>: {printItem.user.dept || '—'}</span></div>
          </div>
          <div className="flex flex-col gap-1.5 text-right">
            <div><span className="text-[#6B6760]">Kehadiran Bulan Ini:</span> <strong className="font-mono">{printItem.presentDays} Hari</strong></div>
            <div><span className="text-[#6B6760]">Status Pembayaran:</span> <strong className="text-[#2A7A4B]">{printItem.status === 'paid' ? 'TERBAYAR (PAID)' : 'DRAFT'}</strong></div>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-2 gap-8 py-2">
          
          {/* Income */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11.5px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono border-b border-[#E0DDD7] pb-1.5">Penerimaan (Earnings)</h4>
            <div className="flex flex-col text-[13.5px] gap-2">
              <div className="flex justify-between">
                <span className="text-[#6B6760]">Gaji Pokok</span>
                <span className="font-mono">{fmtCurrency(printItem.basicSalary)}</span>
              </div>
              <div className="flex justify-between text-[#2A7A4B] font-medium">
                <span>Insentif / Tambahan</span>
                <span className="font-mono">+{fmtCurrency(printItem.incentives)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11.5px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono border-b border-[#E0DDD7] pb-1.5">Potongan (Deductions)</h4>
            <div className="flex flex-col text-[13.5px] gap-2">
              <div className="flex justify-between text-[#C84B2F] font-medium">
                <span>Potongan Kasbon</span>
                <span className="font-mono">-{fmtCurrency(printItem.kasbonDeduction)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Calculation */}
        <div className="border-t-2 border-[#1A1814] pt-4 flex justify-between items-center bg-[#F5EDE0] -mx-8 px-8 py-4">
          <span className="font-bold text-[14.5px]">GAJI BERSIH DITERIMA (NET SALARY)</span>
          <span className="font-['Syne'] text-[22px] font-bold text-[#C84B2F] font-mono">
            {fmtCurrency(printItem.netSalary)}
          </span>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center text-[13px] pt-12">
          <div className="flex flex-col gap-12">
            <div className="text-[#6B6760]">Tanda Tangan Penerima,</div>
            <div className="font-medium underline decoration-dotted decoration-1 underline-offset-4">{printItem.user.name}</div>
          </div>
          <div className="flex flex-col gap-12">
            <div className="text-[#6B6760]">Dr. Meow Management / Admin,</div>
            <div className="font-medium underline decoration-dotted decoration-1 underline-offset-4">Administrator</div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10.5px] text-[#A8A49E] border-t border-dashed border-[#E0DDD7] pt-4 mt-6">
          Ini adalah slip gaji resmi yang diterbitkan secara elektronik oleh HadiR System. Dokumen ini sah dan tidak memerlukan tanda tangan basah jika disetujui.
        </div>
      </div>
    </div>
  );
}
