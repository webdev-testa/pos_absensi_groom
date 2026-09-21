import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdminLayout } from '../AdminLayout'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Admin Cat', role: 'superadmin' },
    loading: false,
  }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

describe('src/components/layout/AdminLayout.tsx - Sidebar Active State Tests', () => {
  it('highlights Dashboard Grooming and NOT Grooming Baru when pathname is /admin/grooming', () => {
    render(
      <MemoryRouter initialEntries={['/admin/grooming']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const dashboardLink = screen.getByRole('link', { name: /Dashboard Grooming/i })
    const groomingBaruLink = screen.getByRole('link', { name: /Grooming Baru/i })

    // Dashboard Grooming should have active classes
    expect(dashboardLink.className).toContain('border-brand-accent')
    expect(dashboardLink.className).toContain('text-sidebar-primary-foreground')

    // Grooming Baru should NOT have active border
    expect(groomingBaruLink.className).toContain('border-transparent')
    expect(groomingBaruLink.className).not.toContain('border-brand-accent')
  })

  it('highlights Grooming Baru and NOT Dashboard Grooming when navigating to /admin/grooming/new', () => {
    render(
      <MemoryRouter initialEntries={['/admin/grooming/new']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const dashboardLink = screen.getByRole('link', { name: /Dashboard Grooming/i })
    const groomingBaruLink = screen.getByRole('link', { name: /Grooming Baru/i })

    // Grooming Baru should be active
    expect(groomingBaruLink.className).toContain('border-brand-accent')
    expect(groomingBaruLink.className).toContain('text-sidebar-primary-foreground')

    // Dashboard Grooming must NOT remain active (bug remediation test)
    expect(dashboardLink.className).toContain('border-transparent')
    expect(dashboardLink.className).not.toContain('border-brand-accent')
  })

  it('highlights Paket Grooming and NOT Dashboard Grooming when navigating to /admin/grooming/pengaturan', () => {
    render(
      <MemoryRouter initialEntries={['/admin/grooming/pengaturan']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const dashboardLink = screen.getByRole('link', { name: /Dashboard Grooming/i })
    const paketLink = screen.getByRole('link', { name: /Paket Grooming/i })

    expect(paketLink.className).toContain('border-brand-accent')
    expect(dashboardLink.className).toContain('border-transparent')
  })

  it('handles trailing slash on /admin/grooming/ gracefully', () => {
    render(
      <MemoryRouter initialEntries={['/admin/grooming/']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const dashboardLink = screen.getByRole('link', { name: /Dashboard Grooming/i })
    expect(dashboardLink.className).toContain('border-brand-accent')
    expect(dashboardLink.className).toContain('text-sidebar-primary-foreground')
  })

  it('renders all 4 sidebar section headers with distinct accent colors', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const operasionalHeader = screen.getByText('Operasional')
    const keuanganHeader = screen.getByText('Keuangan & Gaji')
    const penitipanHeader = screen.getByText('Penitipan Kucing')
    const groomingHeader = screen.getByText('Grooming Kucing')

    expect(operasionalHeader.className).toContain('text-brand-cyan')
    expect(keuanganHeader.className).toContain('text-emerald-400')
    expect(penitipanHeader.className).toContain('text-brand-accent')
    expect(groomingHeader.className).toContain('text-brand-orange')
  })

  it('rotates chevron down (rotate-90) when expanded and sideways (rotate-0) when collapsed', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    // Operasional is active, so it starts open
    const operasionalBtn = screen.getByRole('button', { name: /Operasional/i })
    expect(operasionalBtn).toHaveAttribute('aria-expanded', 'true')
    const operasionalSvg = operasionalBtn.querySelector('svg.lucide-chevron-right')
    expect(operasionalSvg?.getAttribute('class')).toContain('rotate-90')

    // Keuangan is inactive, so it starts collapsed
    const keuanganBtn = screen.getByRole('button', { name: /Keuangan & Gaji/i })
    expect(keuanganBtn).toHaveAttribute('aria-expanded', 'false')
    const keuanganSvg = keuanganBtn.querySelector('svg.lucide-chevron-right')
    expect(keuanganSvg?.getAttribute('class')).toContain('rotate-0')
    expect(keuanganSvg?.getAttribute('class')).not.toContain('rotate-90')
  })

  it('toggles section open and rotates chevron when clicking section header button', async () => {
    const { fireEvent } = await import('@testing-library/react')
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const keuanganBtn = screen.getByRole('button', { name: /Keuangan & Gaji/i })
    expect(keuanganBtn).toHaveAttribute('aria-expanded', 'false')

    // Click Keuangan to open
    fireEvent.click(keuanganBtn)
    expect(keuanganBtn).toHaveAttribute('aria-expanded', 'true')
    const keuanganSvg = keuanganBtn.querySelector('svg.lucide-chevron-right')
    expect(keuanganSvg?.getAttribute('class')).toContain('rotate-90')

    // Click Operasional to collapse
    const operasionalBtn = screen.getByRole('button', { name: /Operasional/i })
    expect(operasionalBtn).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(operasionalBtn)
    expect(operasionalBtn).toHaveAttribute('aria-expanded', 'false')
    const operasionalSvg = operasionalBtn.querySelector('svg.lucide-chevron-right')
    expect(operasionalSvg?.getAttribute('class')).toContain('rotate-0')
  })

  it('renders semantic nav landmark and sets aria-current="page" on the active link', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: /Sidebar Navigation/i })
    expect(nav).toBeInTheDocument()

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i })
    expect(dashboardLink).toHaveAttribute('aria-current', 'page')

    const karyawanLink = screen.getByRole('link', { name: /Karyawan/i })
    expect(karyawanLink).not.toHaveAttribute('aria-current')
  })

  it('marks collapsed sections with aria-hidden, inert, and invisible for a11y', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    // Keuangan is collapsed
    const keuanganRegion = container.querySelector('#section-content-keuangan')
    expect(keuanganRegion).toBeInTheDocument()
    expect(keuanganRegion).toHaveAttribute('aria-hidden', 'true')
    expect(keuanganRegion).toHaveAttribute('inert')
    expect(keuanganRegion?.className).toContain('invisible')
    expect(keuanganRegion?.className).toContain('grid-rows-[0fr]')

    // Operasional is expanded
    const operasionalRegion = container.querySelector('#section-content-operasional')
    expect(operasionalRegion).toBeInTheDocument()
    expect(operasionalRegion).toHaveAttribute('aria-hidden', 'false')
    expect(operasionalRegion).not.toHaveAttribute('inert')
    expect(operasionalRegion?.className).toContain('visible')
    expect(operasionalRegion?.className).toContain('grid-rows-[1fr]')
  })

  it('handles multiple trailing slashes on /admin/grooming// gracefully', () => {
    render(
      <MemoryRouter initialEntries={['/admin/grooming//']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const dashboardLink = screen.getByRole('link', { name: /Dashboard Grooming/i })
    expect(dashboardLink.className).toContain('border-brand-accent')
    expect(dashboardLink.className).toContain('text-sidebar-primary-foreground')
  })

  it('navigates to /login in handleLogout even if supabase.auth.signOut throws', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { fireEvent, act } = await import('@testing-library/react')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(supabase.auth.signOut).mockRejectedValueOnce(new Error('Network offline'))

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    const logoutBtn = screen.getByRole('button', { name: /Keluar \/ Switch Role/i })
    await act(async () => {
      fireEvent.click(logoutBtn)
    })

    expect(supabase.auth.signOut).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('automatically closes mobile drawer when route changes', async () => {
    const { fireEvent } = await import('@testing-library/react')
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Child Content</div>
        </AdminLayout>
      </MemoryRouter>
    )

    // Open mobile drawer
    const burgerBtn = screen.getByRole('button', { name: /Buka sidebar/i })
    fireEvent.click(burgerBtn)
    expect(screen.getByLabelText(/Tutup sidebar/i)).toBeInTheDocument()

    // Click a nav link inside
    const absensiLink = screen.getByRole('link', { name: /Absensi/i })
    fireEvent.click(absensiLink)

    // Drawer toggles back closed
    expect(screen.getByRole('button', { name: /Buka sidebar/i })).toBeInTheDocument()
  })
})


