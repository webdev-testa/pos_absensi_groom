import { useState, useEffect, type ReactNode } from 'react'
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
  PanelLeftOpen,
  Cat,
  PlusCircle,
  ClipboardList,
  Settings,
  Scissors,
  Sparkles,
  ChevronRight,
  Briefcase
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface AdminLayoutProps {
  children: ReactNode
}

type SectionKey = 'operasional' | 'keuangan' | 'penitipan' | 'grooming'

export const cleanPath = (p: string) => (p || '').replace(/\/+$/, '')

const isOperasionalActive = (path: string) => {
  const c = cleanPath(path)
  return (
    c === '/admin/dashboard' || c.startsWith('/admin/dashboard/') ||
    c === '/admin/karyawan' || c.startsWith('/admin/karyawan/') ||
    c === '/admin/absensi' || c.startsWith('/admin/absensi/')
  )
}

const isKeuanganActive = (path: string) => {
  const c = cleanPath(path)
  return (
    c === '/admin/kasbon' || c.startsWith('/admin/kasbon/') ||
    c === '/admin/payroll' || c.startsWith('/admin/payroll/')
  )
}

const isPenitipanActive = (path: string) => {
  const c = cleanPath(path)
  return c === '/admin/pos' || c.startsWith('/admin/pos/')
}

const isGroomingActive = (path: string) => {
  const c = cleanPath(path)
  return (
    c === '/admin/grooming' || c.startsWith('/admin/grooming/') ||
    c === '/groomer' || c.startsWith('/groomer/')
  )
}

interface NavSectionProps {
  id: string
  title: string
  icon: React.ElementType
  colorClass: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

function NavSection({
  id,
  title,
  icon: Icon,
  colorClass,
  isOpen,
  onToggle,
  children,
}: NavSectionProps) {
  return (
    <div className="shrink-0 pt-2 pb-0.5 first:pt-0">
      <button
        type="button"
        id={`section-btn-${id}`}
        aria-expanded={isOpen}
        aria-controls={`section-content-${id}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-2 text-left cursor-pointer transition-colors duration-150 hover:bg-sidebar-accent/50 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${colorClass}`} />
          <span className={`font-mono text-[10px] tracking-[1.5px] uppercase font-semibold truncate ${colorClass}`}>
            {title}
          </span>
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 text-sidebar-foreground/60 transition-transform duration-200 ease-in-out shrink-0 group-hover:text-sidebar-foreground ${
            isOpen ? 'rotate-90' : 'rotate-0'
          }`}
        />
      </button>
      <div
        id={`section-content-${id}`}
        role="region"
        aria-labelledby={`section-btn-${id}`}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        className={`grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-0.5 pb-1 space-y-0.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ 
  to, 
  icon: Icon, 
  label, 
  onClick, 
  activeMatcher 
}: { 
  to: string; 
  icon: React.ElementType; 
  label: string; 
  onClick?: () => void; 
  activeMatcher?: (pathname: string) => boolean; 
}) {
  const location = useLocation()
  const cleanedLocation = cleanPath(location.pathname)
  const cleanedTarget = cleanPath(to)
  const isActive = activeMatcher
    ? activeMatcher(location.pathname)
    : cleanedLocation === cleanedTarget || cleanedLocation.startsWith(cleanedTarget + '/')
  
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 pl-8 pr-6 py-2.5 text-[13px] font-medium transition-all border-l-2 ${
        isActive 
          ? 'text-sidebar-primary-foreground bg-sidebar-accent border-brand-accent font-semibold' 
          : 'text-sidebar-foreground/75 border-transparent hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)
  const showHR = user?.role === 'superadmin'

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(() => ({
    operasional: isOperasionalActive(location.pathname),
    keuangan: isKeuanganActive(location.pathname),
    penitipan: isPenitipanActive(location.pathname),
    grooming: isGroomingActive(location.pathname),
  }))

  // Auto-expand section on route change and auto-dismiss mobile drawer
  useEffect(() => {
    setMobileOpen(false)
    if (isOperasionalActive(location.pathname)) {
      setOpenSections(prev => (prev.operasional ? prev : { ...prev, operasional: true }))
    }
    if (isKeuanganActive(location.pathname)) {
      setOpenSections(prev => (prev.keuangan ? prev : { ...prev, keuangan: true }))
    }
    if (isPenitipanActive(location.pathname)) {
      setOpenSections(prev => (prev.penitipan ? prev : { ...prev, penitipan: true }))
    }
    if (isGroomingActive(location.pathname)) {
      setOpenSections(prev => (prev.grooming ? prev : { ...prev, grooming: true }))
    }
  }, [location.pathname])

  const toggleSection = (key: SectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background font-sans">
      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground border-b border-sidebar-border sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? "Tutup sidebar" : "Buka sidebar"}
            aria-expanded={mobileOpen}
            aria-controls="admin-sidebar"
            className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-sidebar-foreground/90 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-lg transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🐾</span>
            <span className="font-heading font-bold text-base tracking-tight text-sidebar-primary-foreground">Absen Dr. Meow</span>
            <span className="text-[10px] font-mono text-sidebar-foreground/80 uppercase bg-sidebar-accent px-1.5 py-0.5 rounded font-semibold border border-sidebar-border">Admin</span>
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
        id="admin-sidebar"
        aria-label="Sidebar Menu"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[220px] bg-sidebar text-sidebar-foreground border-r border-sidebar-border py-8 shrink-0 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none overflow-y-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}`}
      >
        <div className="px-6 mb-6 pb-6 border-b border-sidebar-border shrink-0">
          <span className="block text-[11px] font-semibold text-sidebar-foreground/60 tracking-[1.5px] uppercase mb-1 font-mono">
            Klinik Hewan
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <div className="font-heading font-bold text-lg text-sidebar-primary-foreground tracking-tight">Dr. Meow</div>
          </div>
        </div>

        <nav aria-label="Sidebar Navigation" className="flex flex-col">
          {showHR && (
            <>
              <NavSection
                id="operasional"
                title="Operasional"
                icon={Briefcase}
                colorClass="text-brand-cyan"
                isOpen={openSections.operasional}
                onToggle={() => toggleSection('operasional')}
              >
                <NavItem to="/admin/dashboard" icon={Home} label="Dashboard" onClick={() => setMobileOpen(false)} />
                <NavItem to="/admin/karyawan" icon={Users} label="Karyawan" onClick={() => setMobileOpen(false)} />
                <NavItem to="/admin/absensi" icon={CalendarClock} label="Absensi" onClick={() => setMobileOpen(false)} />
              </NavSection>

              <NavSection
                id="keuangan"
                title="Keuangan & Gaji"
                icon={Wallet}
                colorClass="text-emerald-400"
                isOpen={openSections.keuangan}
                onToggle={() => toggleSection('keuangan')}
              >
                <NavItem to="/admin/kasbon" icon={Wallet} label="Kasbon" onClick={() => setMobileOpen(false)} />
                <NavItem to="/admin/payroll" icon={FileText} label="Payroll" onClick={() => setMobileOpen(false)} />
              </NavSection>
            </>
          )}

          <NavSection
            id="penitipan"
            title="Penitipan Kucing"
            icon={Cat}
            colorClass="text-brand-accent"
            isOpen={openSections.penitipan}
            onToggle={() => toggleSection('penitipan')}
          >
            <NavItem 
              to="/admin/pos" 
              icon={Cat} 
              label="Dashboard Kucing" 
              activeMatcher={pathname => {
                const clean = cleanPath(pathname)
                return clean === '/admin/pos' || clean === '/admin/pos/kucing' || clean.startsWith('/admin/pos/kucing/')
              }} 
              onClick={() => setMobileOpen(false)} 
            />
            <NavItem to="/admin/pos/check-in" icon={PlusCircle} label="Check-In Kucing" onClick={() => setMobileOpen(false)} />
            <NavItem to="/admin/pos/laporan" icon={ClipboardList} label="Laporan Harian" onClick={() => setMobileOpen(false)} />
            <NavItem to="/admin/pos/check-out" icon={LogOut} label="Check-Out" onClick={() => setMobileOpen(false)} />
            <NavItem to="/admin/pos/pengaturan" icon={Settings} label="Pengaturan POS" onClick={() => setMobileOpen(false)} />
          </NavSection>

          <NavSection
            id="grooming"
            title="Grooming Kucing"
            icon={Scissors}
            colorClass="text-brand-orange"
            isOpen={openSections.grooming}
            onToggle={() => toggleSection('grooming')}
          >
            <NavItem 
              to="/admin/grooming" 
              icon={Scissors} 
              label="Dashboard Grooming" 
              activeMatcher={pathname => cleanPath(pathname) === '/admin/grooming'} 
              onClick={() => setMobileOpen(false)} 
            />
            <NavItem to="/admin/grooming/new" icon={PlusCircle} label="Grooming Baru" onClick={() => setMobileOpen(false)} />
            <NavItem to="/groomer" icon={Sparkles} label="Workstation HP" onClick={() => setMobileOpen(false)} />
            <NavItem to="/admin/grooming/pengaturan" icon={Settings} label="Paket Grooming" onClick={() => setMobileOpen(false)} />
          </NavSection>
        </nav>

        <div className="mt-auto px-6 pt-5 border-t border-sidebar-border shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 mb-4 text-brand-accent text-xs font-semibold hover:text-brand-accent-hover transition-colors bg-transparent border-none cursor-pointer w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Keluar / Switch Role
          </button>
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 rounded-full bg-brand-accent text-primary font-heading font-semibold text-xs flex items-center justify-center">
              <AvatarFallback className="bg-transparent text-primary font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xs text-sidebar-primary-foreground font-semibold">{user?.name || 'User'}</div>
              <div className="text-[11px] text-sidebar-foreground/70">{user?.role === 'superadmin' ? 'Super Admin' : 'POS Admin'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out p-4 sm:p-6 md:p-8 w-full min-h-screen ${
        desktopOpen ? 'md:ml-[220px]' : 'md:ml-0'
      }`}>
        <div className="w-full space-y-6">
          {/* DESKTOP SIDEBAR TOGGLE BUTTON */}
          <div className="hidden md:flex items-center gap-3 pb-1">
            <button
              onClick={() => setDesktopOpen(prev => !prev)}
              aria-label={desktopOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
              aria-expanded={desktopOpen}
              aria-controls="admin-sidebar"
              title={desktopOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:text-foreground bg-card hover:bg-surface-soft border border-border rounded-lg shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              {desktopOpen ? (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span>Sembunyikan Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-foreground" />
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
