import { AdminLayout } from '@/components/layout/AdminLayout'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const avColors = [
    { bg: '#F5E8E4', fg: '#C84B2F' }, { bg: '#E2F0E8', fg: '#2A7A4B' }, { bg: '#F5EDE0', fg: '#B87333' },
    { bg: '#EDE8F5', fg: '#6B4F9E' }, { bg: '#E0EDF5', fg: '#1A6FAA' }, { bg: '#F5E8ED', fg: '#A0374F' },
  ]
  const ini = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const attentionItems = [
    { name: 'Irwan Kusuma', reason: 'Belum absen hari ini', badge: 'Tidak hadir', type: 'red' },
    { name: 'Linda Sari', reason: 'Belum absen hari ini', badge: 'Tidak hadir', type: 'red' },
    { name: 'Dian Permata', reason: 'Lokasi absen di luar area', badge: 'Lokasi anomali', type: 'amber' },
    { name: 'Julia Sari', reason: 'Lokasi absen di luar area', badge: 'Lokasi anomali', type: 'amber' },
    { name: 'Budi Santoso', reason: 'Kasbon Rp 700k belum dipotong', badge: 'Kasbon pending', type: 'blue' },
  ]

  const activities = [
    { icon: '📍', label: <><strong className="font-medium">Hana Wijaya</strong> clock-out</>, time: '17:02', color: '#E8EAE4' },
    { icon: '📍', label: <><strong className="font-medium">Eko Prasetyo</strong> clock-out</>, time: '16:58', color: '#E8EAE4' },
    { icon: '💰', label: <><strong className="font-medium">Andi Saputra</strong> ajukan kasbon Rp 300k</>, time: '14:32', color: '#F5E8E4' },
    { icon: '📍', label: <><strong className="font-medium">Julia Sari</strong> clock-in terlambat</>, time: '08:45', color: '#F5EDE0' },
    { icon: '📍', label: <><strong className="font-medium">Budi Santoso</strong> clock-in terlambat</>, time: '08:14', color: '#F5EDE0' },
    { icon: '📍', label: <><strong className="font-medium">Andi Saputra</strong> clock-in</>, time: '07:52', color: '#E2F0E8' },
  ]

  return (
    <AdminLayout>
      <div className="font-sans text-[#1A1814] -m-10 lg:-m-12 p-10 lg:p-12 min-h-[calc(100vh-1px)]" style={{ backgroundColor: '#F5F2ED' }}>
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.4px]">
              Selamat pagi, <span className="text-[#C84B2F]">Fara</span> 👋
            </div>
            <div className="text-[13.5px] text-[#6B6760] mt-1.5">
              Ini ringkasan bisnis kamu hari ini — Rabu, 20 April 2025
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#E0DDD7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#6B6760]">
            <div className="w-2 h-2 rounded-full bg-[#2A7A4B] shrink-0 animate-pulse"></div>
            <span>Live update · <strong className="text-[#1A1814] font-semibold">08:47</strong></span>
          </div>
        </div>

        {/* ALERT BANNER */}
        <Link to="/admin/kasbon" className="flex items-center gap-3 bg-[#F5EDE0] border border-[#e8c99a] rounded-[16px] px-5 py-3.5 mb-7 hover:border-[#B87333] transition-all group">
          <div className="w-8 h-8 rounded-full bg-[#B87333] flex items-center justify-center shrink-0 text-white font-bold text-[15px]">!</div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-[#B87333]">3 kasbon belum dipotong dari bulan lalu</div>
            <div className="text-[12.5px] text-[#8a5c1a] mt-0.5">Budi Santoso, Dian Permata, Andi Saputra · Total Rp 1,8jt — akan otomatis masuk ke payroll April</div>
          </div>
          <ChevronRight className="text-[#B87333] w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <Link to="/admin/absensi" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Hadir hari ini</div>
            <div className="font-['Syne'] text-[34px] font-bold tracking-[-1.5px] leading-none text-[#2A7A4B]">10</div>
            <div className="text-[12.5px] text-[#A8A49E] mt-2">dari 12 karyawan</div>
            <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">2 belum absen</div>
          </Link>
          <Link to="/admin/kasbon" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Kasbon bulan ini</div>
            <div className="font-['Syne'] text-[34px] font-bold tracking-[-1.5px] leading-none text-[#C84B2F]">Rp 4,2jt</div>
            <div className="text-[12.5px] text-[#A8A49E] mt-2">11 transaksi</div>
            <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5E8E4] text-[#C84B2F]">Rp 1,8jt belum dipotong</div>
          </Link>
          <Link to="/admin/payroll" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Gaji dibayarkan</div>
            <div className="font-['Syne'] text-[34px] font-bold tracking-[-1.5px] leading-none text-[#1A1814]">Rp 16,4jt</div>
            <div className="text-[12.5px] text-[#A8A49E] mt-2">estimasi April</div>
            <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">Payroll belum digenerate</div>
          </Link>
          <Link to="/admin/karyawan" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Total karyawan</div>
            <div className="font-['Syne'] text-[34px] font-bold tracking-[-1.5px] leading-none text-[#1A1814]">12</div>
            <div className="text-[12.5px] text-[#A8A49E] mt-2">aktif bulan ini</div>
            <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">Semua terdaftar</div>
          </Link>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* KEHADIRAN HARI INI */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Kehadiran hari ini</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">Rabu, 20 April 2025</div>
              </div>
              <Link to="/admin/absensi" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Detail →</Link>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-6 mb-5">
                <div className="relative w-[100px] h-[100px] shrink-0">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#EDEAE4" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#2A7A4B" strokeWidth="10" strokeDasharray="146 106" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#B87333" strokeWidth="10" strokeDasharray="63 189" strokeDashoffset="-146" strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#C84B2F" strokeWidth="10" strokeDasharray="42 210" strokeDashoffset="-209" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-['Syne'] text-[24px] font-bold leading-none">10</div>
                    <div className="text-[10px] text-[#A8A49E] uppercase tracking-[0.5px] font-mono mt-1">hadir</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#2A7A4B]"></div>Tepat waktu</div>
                    <div className="font-mono text-[13px] font-medium">7</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#B87333]"></div>Terlambat</div>
                    <div className="font-mono text-[13px] font-medium">3</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#C84B2F]"></div>Tidak hadir</div>
                    <div className="font-mono text-[13px] font-medium">2</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#A8A49E]"></div>Sudah pulang</div>
                    <div className="font-mono text-[13px] font-medium">4</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="text-[12px] text-[#6B6760] w-[90px]">Kehadiran bulan ini</div>
                  <div className="flex-1 h-1.5 bg-[#EDEAE4] rounded-[3px] overflow-hidden"><div className="h-full bg-[#2A7A4B] rounded-[3px] w-[87%] transition-all duration-800"></div></div>
                  <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">87%</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-[12px] text-[#6B6760] w-[90px]">Tepat waktu</div>
                  <div className="flex-1 h-1.5 bg-[#EDEAE4] rounded-[3px] overflow-hidden"><div className="h-full bg-[#1A6FAA] rounded-[3px] w-[70%] transition-all duration-800"></div></div>
                  <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">70%</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-[12px] text-[#6B6760] w-[90px]">Keterlambatan</div>
                  <div className="flex-1 h-1.5 bg-[#EDEAE4] rounded-[3px] overflow-hidden"><div className="h-full bg-[#B87333] rounded-[3px] w-[25%] transition-all duration-800"></div></div>
                  <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">25%</div>
                </div>
              </div>
            </div>
          </div>

          {/* PERLU PERHATIAN */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Perlu perhatian</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">Anomali & tindakan yang tertunda</div>
              </div>
              <Link to="/admin/karyawan" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Lihat semua →</Link>
            </div>
            <div className="py-1.5">
              {attentionItems.map((a, i) => {
                const c = avColors[i % avColors.length];
                const badgeBg = a.type === 'red' ? '#F5E8E4' : a.type === 'amber' ? '#F5EDE0' : '#E0EDF5';
                const badgeFg = a.type === 'red' ? '#C84B2F' : a.type === 'amber' ? '#B87333' : '#1A6FAA';
                return (
                  <Link to="/admin/karyawan" key={i} className="flex items-center gap-3 px-5 py-[11px] border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] transition-colors cursor-pointer block">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-bold font-['Syne'] shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                        {ini(a.name)}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13.5px] font-medium text-[#1A1814]">{a.name}</div>
                        <div className="text-[12px] text-[#A8A49E] mt-px">{a.reason}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11px] font-medium whitespace-nowrap" style={{ backgroundColor: badgeBg, color: badgeFg }}>
                          {a.badge}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* KASBON */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Kasbon April</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">Pengambilan bulan ini</div>
              </div>
              <Link to="/admin/kasbon" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Log →</Link>
            </div>
            <div className="p-5">
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] text-[#C84B2F]">Rp 4,2jt</div>
                <div className="text-[13px] text-[#A8A49E]">total</div>
              </div>
              <div className="text-[12.5px] text-[#6B6760] mb-4">dari 11 pengambilan · 6 karyawan</div>
              <div className="h-2 bg-[#EDEAE4] rounded-[4px] overflow-hidden mb-4">
                <div className="h-full rounded-[4px] transition-all duration-800 w-[72%] bg-gradient-to-r from-[#C84B2F] to-[#e06040]"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F5F2ED] rounded-[10px] p-3">
                  <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.7px] font-mono mb-1">Belum dipotong</div>
                  <div className="font-['Syne'] text-[18px] font-bold tracking-[-0.5px] text-[#C84B2F]">Rp 1,8jt</div>
                </div>
                <div className="bg-[#F5F2ED] rounded-[10px] p-3">
                  <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.7px] font-mono mb-1">Sudah dipotong</div>
                  <div className="font-['Syne'] text-[18px] font-bold tracking-[-0.5px] text-[#2A7A4B]">Rp 2,4jt</div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYROLL STATUS */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Status payroll</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">April 2025 · 30 Apr</div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11px] font-medium whitespace-nowrap bg-[#F5EDE0] text-[#B87333]">Draft</span>
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-[#E2F0E8] text-[#2A7A4B]">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div className="text-[13px] text-[#6B6760] line-through">Data absensi lengkap</div>
                  <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">Apr 19</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-[#E2F0E8] text-[#2A7A4B]">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div className="text-[13px] text-[#6B6760] line-through">Kasbon tercatat semua</div>
                  <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">Apr 20</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-[#F5EDE0] text-[#B87333]">→</div>
                  <div className="text-[13px] text-[#1A1814] font-medium">Generate slip gaji</div>
                  <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">Apr 28</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-[#EDEAE4] text-[#A8A49E]">4</div>
                  <div className="text-[13px] text-[#A8A49E]">Kirim ke karyawan</div>
                  <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">Apr 30</div>
                </div>
              </div>
              <Link to="/admin/payroll" className="bg-[#1A1814] rounded-[10px] p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#2a2620] transition-colors group block">
                <div className="text-[13px] text-white/70">
                  <strong className="text-white block text-[14px] font-['Syne'] mb-0.5">Generate sekarang →</strong>
                  Estimasi total Rp 16,4jt
                </div>
                <div className="text-white/40 text-[20px] group-hover:text-white/80 transition-colors">⚡</div>
              </Link>
            </div>
          </div>

          {/* AKTIVITAS TERKINI */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Aktivitas terkini</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">Hari ini</div>
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-[#2A7A4B] font-medium">
                <div className="w-2 h-2 rounded-full bg-[#2A7A4B] animate-pulse"></div>Live
              </div>
            </div>
            <div>
              {activities.map((a, i) => (
                <Link to="/admin/absensi" key={i} className="flex items-center gap-3 px-5 py-[11px] border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] transition-colors cursor-pointer block">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[16px]" style={{ backgroundColor: a.color }}>
                      {a.icon}
                    </div>
                    <div className="flex-1 text-[13px] text-[#1A1814]">{a.label}</div>
                    <div className="text-[11.5px] text-[#A8A49E] font-mono whitespace-nowrap">{a.time}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}