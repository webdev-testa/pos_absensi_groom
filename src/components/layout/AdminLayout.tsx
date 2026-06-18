import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Users, 
  CalendarClock, 
  Wallet,  
  FileText,
  LogOut 
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { AV_COLORS, getInitials } from '@/utils/helpers'

export { AV_COLORS }
export function initials(name: string) {
  return getInitials(name)
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
          ? 'text-white bg-white/5 border-[#4DC8F5]' 
          : 'text-white/45 border-transparent hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#F0FAFF] font-sans selection:bg-[#4DC8F5]/30">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-[220px] bg-[#0D2D3D] py-8 shrink-0">
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
        <NavItem to="/admin/payroll" icon={FileText} label="Payroll" />

        <div className="mt-auto px-6 pt-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 mb-4 text-[#F5A940] text-[13.5px] hover:text-[#FEF3E0] transition-colors bg-transparent border-none cursor-pointer w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Switch Role / Log Out
          </button>
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 rounded-full bg-[#F5A940] text-white font-['Syne'] font-semibold text-[13px] flex items-center justify-center">
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
