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
      <DialogContent className="sm:max-w-[520px] p-0 border-border bg-card rounded-2xl overflow-hidden gap-0 shadow-xl">
        <form onSubmit={onSubmit}>
          <DialogHeader className="p-6 pb-4 border-b border-border bg-card sticky top-0 z-10">
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              {isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEdit ? 'Perbarui data master karyawan klinik' : 'Masukkan informasi karyawan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
            {/* Account section */}
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-3">Akun login</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label htmlFor="emp-email" className="text-xs text-muted-foreground font-medium">Email *</label>
                  <Input 
                    id="emp-email"
                    type="email" 
                    placeholder="nama@drmeow.com" 
                    value={form.email} 
                    onChange={onChange('email')} 
                    required 
                    className="rounded-xl border-border" 
                  />
                </div>
                {!isEdit && (
                  <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                    <label htmlFor="emp-password" className="text-xs text-muted-foreground font-medium">Password *</label>
                    <Input 
                      id="emp-password"
                      type="password" 
                      placeholder="Min. 6 karakter" 
                      value={form.password} 
                      onChange={onChange('password')} 
                      required 
                      minLength={6} 
                      className="rounded-xl border-border" 
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-3">Data pribadi</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="emp-name" className="text-xs text-muted-foreground font-medium">Nama lengkap *</label>
                  <Input 
                    id="emp-name"
                    type="text" 
                    placeholder="Nama karyawan" 
                    value={form.name} 
                    onChange={onChange('name')} 
                    required 
                    className="rounded-xl border-border" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="emp-id-field" className="text-xs text-muted-foreground font-medium">ID Karyawan</label>
                  <Input 
                    id="emp-id-field"
                    type="text" 
                    placeholder="EMP-001" 
                    value={form.emp_id} 
                    onChange={onChange('emp_id')} 
                    className="rounded-xl border-border font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="emp-phone" className="text-xs text-muted-foreground font-medium">No. HP / WhatsApp</label>
                  <Input 
                    id="emp-phone"
                    type="text" 
                    placeholder="08xx-xxxx-xxxx" 
                    value={form.phone} 
                    onChange={onChange('phone')} 
                    className="rounded-xl border-border font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="emp-joined" className="text-xs text-muted-foreground font-medium">Tanggal bergabung</label>
                  <Input 
                    id="emp-joined"
                    type="date" 
                    value={form.joined} 
                    onChange={onChange('joined')} 
                    className="rounded-xl border-border font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label htmlFor="emp-address" className="text-xs text-muted-foreground font-medium">Alamat</label>
                  <Input 
                    id="emp-address"
                    type="text" 
                    placeholder="Alamat lengkap" 
                    value={form.address} 
                    onChange={onChange('address')} 
                    className="rounded-xl border-border" 
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-3">Pekerjaan & gaji</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Divisi (dept)</label>
                  <Select value={form.dept} onValueChange={v => onSelectChange('dept', v)}>
                    <SelectTrigger className="rounded-xl border-border">
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
                  <label className="text-xs text-muted-foreground font-medium">Hak Akses (Role)</label>
                  <Select value={form.role} onValueChange={v => onSelectChange('role', v)}>
                    <SelectTrigger className="rounded-xl border-border">
                      <SelectValue placeholder="Pilih hak akses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="emp-position" className="text-xs text-muted-foreground font-medium">Jabatan</label>
                  <Input 
                    id="emp-position"
                    type="text" 
                    placeholder="Staff, Senior, dll" 
                    value={form.jabatan} 
                    onChange={onChange('jabatan')} 
                    className="rounded-xl border-border" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="emp-salary" className="text-xs text-muted-foreground font-medium">Gaji pokok (Rp)</label>
                  <Input 
                    id="emp-salary"
                    type="text" 
                    inputMode="numeric"
                    placeholder="3.000.000" 
                    value={form.salary} 
                    onChange={e => {
                      const rawVal = e.target.value.replace(/\D/g, '');
                      const formatted = rawVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      e.target.value = formatted;
                      onChange('salary')(e);
                    }}
                    className="rounded-xl border-border font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Jam kerja</label>
                  <Select value={form.shift} onValueChange={v => onSelectChange('shift', v)}>
                    <SelectTrigger className="rounded-xl border-border">
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
                  <label htmlFor="emp-kasbon-limit" className="text-xs text-muted-foreground font-medium">Batas kasbon / bulan (Rp)</label>
                  <Input 
                    id="emp-kasbon-limit"
                    type="text" 
                    inputMode="numeric"
                    placeholder="1.000.000" 
                    value={form.kasbon_limit} 
                    onChange={e => {
                      const rawVal = e.target.value.replace(/\D/g, '');
                      const formatted = rawVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      e.target.value = formatted;
                      onChange('kasbon_limit')(e);
                    }}
                    className="rounded-xl border-border font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Status</label>
                  <Select value={form.status} onValueChange={v => onSelectChange('status', v)}>
                    <SelectTrigger className="rounded-xl border-border">
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
          <DialogFooter className="p-6 pt-4 border-t border-border bg-card">
            <Button 
              type="button" 
              variant="ghost" 
              className="rounded-xl text-muted-foreground hover:text-foreground" 
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
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
