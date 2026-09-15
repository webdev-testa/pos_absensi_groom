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
})
