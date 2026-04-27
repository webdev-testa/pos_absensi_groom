import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  CalendarClock, 
  Wallet, 
  Award, 
  FileText,
  LogOut 
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const AV_COLORS = [
  { bg: '#F5E8E4', fg: '#C84B2F' }, { bg: '#E2F0E8', fg: '#2A7A4B' },
  { bg: '#F5EDE0', fg: '#B87333' }, { bg: '#EDE8F5', fg: '#6B4F9E' },
  { bg: '#E0EDF5', fg: '#1A6FAA' }, { bg: '#F5E8ED', fg: '#A0374F' },
  { bg: '#E8F5E0', fg: '#3A6B1A' }, { bg: '#F0EDE8', fg: '#6B5A3A' },
  { bg: '#E8EDF5', fg: '#3A4A8B' }, { bg: '#F5F0E8', fg: '#8B6A3A' },
  { bg: '#EBF5E8', fg: '#2A6B4B' }, { bg: '#F5E8F0', fg: '#8B3A6A' },
]

export function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

interface AdminLayoutProps {
  children: ReactNode
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-6 py-2.5 text-[13.5px] transition-all border-l-2 ${
        isActive 
          ? 'text-white bg-white/5 border-red-600' 
          : 'text-white/45 border-transparent hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F5F2ED] font-sans selection:bg-red-600/30">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-[220px] bg-[#1A1814] py-8 shrink-0">
        <div className="px-6 mb-6 pb-8 border-b border-white/10">
          <div className="font-['Syne'] font-bold text-lg text-white tracking-tight">
            <span className="block text-[11px] font-normal text-white/35 tracking-[1.5px] uppercase mb-1 font-mono">
              Admin Panel
            </span>
            HadiR
          </div>
        </div>

        <div className="px-6 py-2 pb-1 font-mono text-[10px] tracking-[1.5px] uppercase text-white/20">
          Main
        </div>
        <NavItem to="/admin/dashboard" icon={Home} label="Dashboard" />
        {/* We use /admin/manage-employee or /admin/karyawan here for the route, matching what we have */}
        <NavItem to="/admin/karyawan" icon={Users} label="Karyawan" />
        <NavItem to="/admin/absensi" icon={CalendarClock} label="Absensi" />

        <div className="px-6 pt-5 pb-2 font-mono text-[10px] tracking-[1.5px] uppercase text-white/20">
          Keuangan
        </div>
        <NavItem to="/admin/kasbon" icon={Wallet} label="Kasbon" />
        <NavItem to="/admin/insentif" icon={Award} label="Insentif" />
        <NavItem to="/admin/payroll" icon={FileText} label="Payroll" />

        <div className="mt-auto px-6 pt-5 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 mb-4 text-[#C84B2F] text-[13.5px]"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Switch Role
          </Link>
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 rounded-full bg-[#C84B2F] text-white font-['Syne'] font-semibold text-[13px] flex items-center justify-center">
              <AvatarFallback className="bg-transparent">A</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-[13px] text-white font-medium">Admin</div>
              <div className="text-[11px] text-white/35">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-[220px] p-10 lg:p-12">
        {children}
      </main>
    </div>
  )
}
