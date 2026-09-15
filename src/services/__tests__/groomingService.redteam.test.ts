import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { groomingService } from '../groomingService'
import { supabase } from '@/lib/supabase'
import { openWhatsApp } from '@/utils/grooming.utils'

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      schema: vi.fn().mockReturnThis(),
      from: vi.fn(),
      storage: {
        from: vi.fn(),
      },
      rpc: vi.fn(),
    },
  }
})

describe('Red-Team Verification Test Suite - Cat Grooming Resilience & Security', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Defect 2: Duplicate progress prevention under concurrent requests', () => {
    it('does not insert duplicate progress records for the same step and session', async () => {
      let progressInsertCount = 0
      const mockFrom = vi.fn((table: string) => {
        if (table === 'grooming_sessions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'session-1', status: 'antrian', current_step: 'check_in' },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        if (table === 'grooming_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockImplementation(() => {
                    // First time null, second time found
                    if (progressInsertCount > 0) {
                      return Promise.resolve({ data: { id: 'existing-prog-1' }, error: null })
                    }
                    return Promise.resolve({ data: null, error: null })
                  }),
                }),
              }),
            }),
            insert: vi.fn().mockImplementation(() => {
              progressInsertCount++
              return Promise.resolve({ error: null })
            }),
          }
        }
        return {}
      })
      ;(supabase.schema as any).mockReturnValue({ from: mockFrom })

      // Invoke step update twice sequentially / concurrently
      await groomingService.updateStep('session-1', 'bathing')
      await groomingService.updateStep('session-1', 'bathing')

      // Should only insert once into grooming_progress
      expect(progressInsertCount).toBe(1)
    })
  })

  describe('Defect 3: Token entropy and Demo token substring leakage prevention', () => {
    it('generates high-entropy tokens with grm- prefix and alphanumeric format', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'sess-101',
                public_token: 'grm-token-val',
                harga: 50000,
              },
              error: null,
            }),
          }),
        }),
      })
      ;(supabase.schema as any).mockReturnValue({ from: mockFrom })

      const session = await groomingService.createSession({
        owner_id: 'own-1',
        cat_id: 'cat-1',
        paket: 'Mandi Sehat',
        harga: 50000,
      })

      expect(session.public_token).toMatch(/^grm-[a-zA-Z0-9]+/)
      expect(session.public_token.length).toBeGreaterThanOrEqual(10)
    })

    it('rejects arbitrary tokens containing the word "demo" unless exact match', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Session not found') }),
          }),
        }),
      })
      ;(supabase.schema as any).mockReturnValue({ from: mockFrom })
      ;(supabase.rpc as any).mockResolvedValue({ data: null, error: new Error('RPC error') })

      // An arbitrary token with substring "demo" should not leak demo data
      const result = await groomingService.fetchReportByToken('malicious-query-demo-token')
      expect(result).toBeNull()
    })
  })

  describe('Defect 4: File upload extension whitelist and MIME type enforcement', () => {
    it('rejects dangerous files such as SVG or HTML', async () => {
      const svgFile = new File(['<svg onload="alert(1)"></svg>'], 'exploit.svg', {
        type: 'image/svg+xml',
      })

      await expect(
        groomingService.uploadGroomingPhoto(svgFile, 'sess-1', 'bathing')
      ).rejects.toThrow(/Format file tidak didukung/)
    })

    it('accepts safe image MIME types such as image/jpeg and image/png', async () => {
      const jpegFile = new File(['dummy content'], 'photo.jpg', {
        type: 'image/jpeg',
      })

      const uploadMock = vi.fn().mockResolvedValue({ error: null })
      const publicUrlMock = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://cdn.drmeow.com/cat-photos/grooming/sess-1/bathing-123.jpg' },
      })

      ;(supabase.storage.from as any).mockReturnValue({
        upload: uploadMock,
        getPublicUrl: publicUrlMock,
      })

      const url = await groomingService.uploadGroomingPhoto(jpegFile, 'sess-1', 'bathing')
      expect(url).toBe('https://cdn.drmeow.com/cat-photos/grooming/sess-1/bathing-123.jpg')
      expect(uploadMock).toHaveBeenCalled()
      expect(uploadMock.mock.calls[0][0]).toMatch(/\.jpg$/)
    })
  })

  describe('Defect 5: State-machine transition guard on terminal sessions', () => {
    it('prevents transitioning sessions that are already dijemput or dibatalkan', async () => {
      // Mock session lookup returning 'dijemput'
      const mockFrom = vi.fn((table: string) => {
        if (table === 'grooming_sessions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'term-sess', status: 'dijemput', current_step: 'done' },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return {}
      })
      ;(supabase.schema as any).mockReturnValue({ from: mockFrom })

      await expect(
        groomingService.updateStep('term-sess', 'bathing')
      ).rejects.toThrow(/dijemput/)
    })
  })

  describe('Defect 7: Durability & resilience against null localStorage cache', () => {
    it('safely recovers when localStorage contains string "null"', async () => {
      localStorage.setItem('dr_meow_grooming_sessions_cache', 'null')
      localStorage.setItem('dr_meow_grooming_packages_cache', 'null')

      // Mock database returning network error to force local cache path
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Table not found' } }),
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Table not found' } }),
          }),
        }),
      })
      ;(supabase.schema as any).mockReturnValue({ from: mockFrom })

      // Should not throw TypeError and should return array
      const sessions = await groomingService.fetchSessions()
      expect(Array.isArray(sessions)).toBe(true)

      const packages = await groomingService.fetchPaketGrooming()
      expect(Array.isArray(packages)).toBe(true)
    })
  })

  describe('Defect 8: FileReader fallback rejection handling', () => {
    it('rejects the Promise if FileReader triggers an error event', async () => {
      const validFile = new File(['corrupted'], 'sample.png', { type: 'image/png' })

      // Mock storage upload failure to trigger FileReader fallback
      ;(supabase.storage.from as any).mockReturnValue({
        upload: vi.fn().mockRejectedValue(new Error('Storage unavailable')),
      })

      const OriginalFileReader = globalThis.FileReader
      class BrokenFileReader {
        onload: any
        onerror: any
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new ProgressEvent('error'))
          }, 10)
        }
      }
      globalThis.FileReader = BrokenFileReader as any

      try {
        await expect(
          groomingService.uploadGroomingPhoto(validFile, 's1', 'bathing')
        ).rejects.toThrow(/Gagal membaca data gambar/)
      } finally {
        globalThis.FileReader = OriginalFileReader
      }
    })
  })

  describe('Defect 9: openWhatsApp phone sanitization', () => {
    it('ignores invalid or too-short phone numbers without opening invalid wa.me links', () => {
      const openMock = vi.fn()
      vi.stubGlobal('open', openMock)

      openWhatsApp('-', 'Test text')
      openWhatsApp('123', 'Test text')

      expect(openMock).not.toHaveBeenCalled()
    })

    it('opens valid phone number with security features noopener,noreferrer', () => {
      const openMock = vi.fn()
      vi.stubGlobal('open', openMock)

      openWhatsApp('081234567890', 'Halo Dr. Meow')

      expect(openMock).toHaveBeenCalledWith(
        'https://wa.me/6281234567890?text=Halo%20Dr.%20Meow',
        '_blank',
        'noopener,noreferrer'
      )
    })
  })
})
