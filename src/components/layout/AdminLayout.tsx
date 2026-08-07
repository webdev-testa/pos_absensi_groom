import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Users, 
  CalendarClock, 
  Wallet,  
  FileText,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
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

function NavItem({ to, icon: Icon, label, onClick }: { to: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)
  
  return (
    <Link
      to={to}
      onClick={onClick}
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const toggleSidebar = () => {
    // Toggle mobile menu if on mobile viewport, desktop sidebar if on desktop
    if (window.innerWidth < 768) {
      setMobileOpen(prev => !prev)
    } else {
      setDesktopOpen(prev => !prev)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F2ED] font-sans selection:bg-[#4DC8F5]/30">
      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0D2D3D] text-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label={mobileOpen ? "Tutup sidebar" : "Buka sidebar"}
            className="p-1.5 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4DC8F5] rounded-md transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-['Syne'] font-bold text-base tracking-tight">HadiR</span>
            <span className="text-[10px] font-mono text-white/40 uppercase">Admin</span>
          </div>
        </div>
      </header>

      {/* OVERLAY BACKDROP ON MOBILE */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[220px] bg-[#0D2D3D] py-8 shrink-0 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}`}
      >
        <div className="px-6 mb-6 pb-6 border-b border-white/10">
          <span className="block text-[11px] font-normal text-white/35 tracking-[1.5px] uppercase mb-1 font-mono">
            Admin Panel
          </span>
          <div className="font-['Syne'] font-bold text-lg text-white tracking-tight">HadiR</div>
        </div>

        <div className="px-6 py-2 pb-1 font-mono text-[10px] tracking-[1.5px] uppercase text-white/20">
          Main
        </div>
        <NavItem to="/admin/dashboard" icon={Home} label="Dashboard" onClick={() => setMobileOpen(false)} />
        <NavItem to="/admin/karyawan" icon={Users} label="Karyawan" onClick={() => setMobileOpen(false)} />
        <NavItem to="/admin/absensi" icon={CalendarClock} label="Absensi" onClick={() => setMobileOpen(false)} />

        <div className="px-6 pt-5 pb-2 font-mono text-[10px] tracking-[1.5px] uppercase text-white/20">
          Keuangan
        </div>
        <NavItem to="/admin/kasbon" icon={Wallet} label="Kasbon" onClick={() => setMobileOpen(false)} />
        <NavItem to="/admin/payroll" icon={FileText} label="Payroll" onClick={() => setMobileOpen(false)} />

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

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 transition-all duration-300 ease-in-out p-4 sm:p-6 md:p-8 lg:p-10 w-full min-h-screen ${
        desktopOpen ? 'md:ml-[220px]' : 'md:ml-0'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* DESKTOP SIDEBAR TOGGLE BUTTON (when sidebar is closed or visible) */}
          <div className="hidden md:flex items-center gap-3 pb-2">
            <button
              onClick={() => setDesktopOpen(prev => !prev)}
              aria-label={desktopOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
              title={desktopOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#0D2D3D]/70 hover:text-[#0D2D3D] bg-white hover:bg-white/80 border border-[#0D2D3D]/10 rounded-lg shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4DC8F5]"
            >
              {desktopOpen ? (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span>Sembunyikan Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#0D2D3D]" />
                  <span>Tampilkan Sidebar</span>
                </>
              )}
            </button>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}

