import type { ChangeEvent, FormEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { EmployeeFormData } from '@/types'

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEdit: boolean
  form: EmployeeFormData
  onChange: (field: keyof EmployeeFormData) => (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSelectChange: (field: keyof EmployeeFormData, val: string) => void
  onSubmit: (ev: FormEvent) => void
  isPending: boolean
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  isEdit,
  form,
  onChange,
  onSelectChange,
  onSubmit,
  isPending,
}: EmployeeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 border-[#C8E8F5] rounded-[16px] overflow-hidden gap-0">
        <form onSubmit={onSubmit}>
          <DialogHeader className="p-6 pb-4 border-b border-[#C8E8F5] bg-white sticky top-0 z-10">
            <DialogTitle className="font-['Syne'] text-[18px] font-bold text-[#1A3A4A]">
              {isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}
            </DialogTitle>
            <DialogDescription className="hidden">Employee form details</DialogDescription>
          </DialogHeader>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Account section — email always, password only for new employees */}
            <div className="mb-5 last:mb-0">
              <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-3">Akun login</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Email *</label>
                  <Input 
                    type="email" 
                    placeholder="nama@drmeow.com" 
                    value={form.email} 
                    onChange={onChange('email')} 
                    required 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
                {!isEdit && (
                  <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                    <label className="text-[12px] text-[#4A7A8A] font-medium">Password *</label>
                    <Input 
                      type="password" 
                      placeholder="Min. 6 karakter" 
                      value={form.password} 
                      onChange={onChange('password')} 
                      required 
                      minLength={6} 
                      className="rounded-[10px] border-[#C8E8F5]" 
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-5 last:mb-0">
              <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-3">Data pribadi</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Nama lengkap</label>
                  <Input 
                    type="text" 
                    placeholder="Nama karyawan" 
                    value={form.name} 
                    onChange={onChange('name')} 
                    required 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">ID Karyawan</label>
                  <Input 
                    type="text" 
                    placeholder="EMP-001" 
                    value={form.emp_id} 
                    onChange={onChange('emp_id')} 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">No. HP / WhatsApp</label>
                  <Input 
                    type="text" 
                    placeholder="08xx-xxxx-xxxx" 
                    value={form.phone} 
                    onChange={onChange('phone')} 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Tanggal bergabung</label>
                  <Input 
                    type="date" 
                    value={form.joined} 
                    onChange={onChange('joined')} 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Alamat</label>
                  <Input 
                    type="text" 
                    placeholder="Alamat lengkap" 
                    value={form.address} 
                    onChange={onChange('address')} 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
              </div>
            </div>

            <div className="mb-5 last:mb-0">
              <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-3">Pekerjaan & gaji</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Divisi (dept)</label>
                  <Select value={form.dept} onValueChange={v => onSelectChange('dept', v)}>
                    <SelectTrigger className="rounded-[10px] border-[#C8E8F5]">
                      <SelectValue placeholder="Pilih divisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="kasir">Kasir</SelectItem>
                      <SelectItem value="gudang">Gudang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Hak Akses (Role)</label>
                  <Select value={form.role} onValueChange={v => onSelectChange('role', v)}>
                    <SelectTrigger className="rounded-[10px] border-[#C8E8F5]">
                      <SelectValue placeholder="Pilih hak akses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Jabatan</label>
                  <Input 
                    type="text" 
                    placeholder="Staff, Senior, dll" 
                    value={form.jabatan} 
                    onChange={onChange('jabatan')} 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Gaji pokok (Rp)</label>
                  <Input 
                    type="number" 
                    placeholder="3000000" 
                    value={form.salary} 
                    onChange={onChange('salary')} 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Jam kerja</label>
                  <Select value={form.shift} onValueChange={v => onSelectChange('shift', v)}>
                    <SelectTrigger className="rounded-[10px] border-[#C8E8F5]">
                      <SelectValue placeholder="Pilih jam kerja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00 – 17:00">08:00 – 17:00</SelectItem>
                      <SelectItem value="09:00 – 18:00">09:00 – 18:00</SelectItem>
                      <SelectItem value="07:00 – 16:00">07:00 – 16:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Batas kasbon / bulan (Rp)</label>
                  <Input 
                    type="number" 
                    placeholder="1000000" 
                    value={form.kasbon_limit} 
                    onChange={onChange('kasbon_limit')} 
                    className="rounded-[10px] border-[#C8E8F5]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium">Status</label>
                  <Select value={form.status} onValueChange={v => onSelectChange('status', v)}>
                    <SelectTrigger className="rounded-[10px] border-[#C8E8F5]">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t border-[#C8E8F5] bg-white">
            <Button 
              type="button" 
              variant="ghost" 
              className="rounded-[10px] text-[#4A7A8A] hover:text-[#1A3A4A]" 
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="rounded-[10px] bg-[#F5A940] hover:bg-[#b03d24] text-white" 
              disabled={isPending}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Karyawan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
