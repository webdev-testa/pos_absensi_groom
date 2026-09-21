import { supabase } from '@/lib/supabase'
import type {
  GroomingSession,
  GroomingProgress,
  GroomingStep,
  GroomingStatus,
  PaketGrooming,
} from '@/types/pos'
const posDb = () => supabase.schema('pos')

const STORAGE_KEY_SESSIONS = 'dr_meow_grooming_sessions_cache'
const STORAGE_KEY_PACKAGES = 'dr_meow_grooming_packages_cache'

// Local storage fallback helpers for testing before SQL is executed in Supabase
const getCachedSessions = (): GroomingSession[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify([]))
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveCachedSessions = (sessions: GroomingSession[]) => {
  if (typeof window === 'undefined') return
  try {
    const sanitized = sessions.map(s => ({
      ...s,
      progress: s.progress?.map(p => ({
        ...p,
        foto_url: p.foto_url?.startsWith('data:') ? undefined : p.foto_url,
      })),
    }))
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sanitized))
  } catch (e) {
    console.error('Failed to cache grooming sessions:', e)
  }
}

const getCachedPackages = (): PaketGrooming[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PACKAGES)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveCachedPackages = (pkgs: PaketGrooming[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(pkgs))
  } catch (e) {
    console.error('Failed to cache grooming packages:', e)
  }
}

export const groomingService = {
  /**
   * Fetch list of grooming sessions with optional date/status/range filter.
   * Gracefully falls back to local cache/demo if Supabase tables haven't been created yet.
   */
  async fetchSessions(filter?: {
    date?: string
    startDate?: string
    endDate?: string
    status?: string
  }): Promise<GroomingSession[]> {
    try {
      let query = posDb()
        .from('grooming_sessions')
        .select(`
          *,
          owner:owners(*),
          cat:cats(*),
          progress:grooming_progress(*)
        `)
        .order('created_at', { ascending: false })

      let sDate = filter?.startDate
      let eDate = filter?.endDate
      if (sDate && eDate && sDate > eDate) {
        ;[sDate, eDate] = [eDate, sDate]
      }

      if (sDate && eDate) {
        query = query.gte('tanggal', sDate).lte('tanggal', eDate)
      } else if (sDate) {
        query = query.gte('tanggal', sDate)
      } else if (eDate) {
        query = query.lte('tanggal', eDate)
      } else if (filter?.date) {
        query = query.eq('tanggal', filter.date)
      }
      if (filter?.status && filter.status !== 'all') query = query.eq('status', filter.status)

      const { data, error } = await query

      if (error) {
        // Table not created yet or schema issue -> fallback to cache
        console.warn('Supabase grooming_sessions not ready, using local state:', error.message)
        let local = getCachedSessions()
        if (sDate && eDate) {
          local = local.filter(s => s.tanggal >= sDate! && s.tanggal <= eDate!)
        } else if (sDate) {
          local = local.filter(s => s.tanggal >= sDate!)
        } else if (eDate) {
          local = local.filter(s => s.tanggal <= eDate!)
        } else if (filter?.date) {
          local = local.filter(s => s.tanggal === filter.date)
        }
        if (filter?.status && filter.status !== 'all') {
          local = local.filter(s => s.status === filter.status)
        }
        return local
      }

      const formatted = (data || []).map((s: any) => ({
        ...s,
        harga: Number(s.harga || 0),
        progress: (s.progress || []).sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }))

      // Keep cache synced by merging so historical records are not wiped out
      const currentCache = getCachedSessions()
      const sessionMap = new Map(currentCache.map(s => [s.id, s]))
      formatted.forEach(s => sessionMap.set(s.id, s))
      saveCachedSessions(Array.from(sessionMap.values()))
      return formatted
    } catch (err) {
      console.warn('fetchSessions fallback triggered:', err)
      let local = getCachedSessions()
      let sDate = filter?.startDate
      let eDate = filter?.endDate
      if (sDate && eDate && sDate > eDate) {
        ;[sDate, eDate] = [eDate, sDate]
      }
      if (sDate && eDate) {
        local = local.filter(s => s.tanggal >= sDate! && s.tanggal <= eDate!)
      } else if (sDate) {
        local = local.filter(s => s.tanggal >= sDate!)
      } else if (eDate) {
        local = local.filter(s => s.tanggal <= eDate!)
      } else if (filter?.date) {
        local = local.filter(s => s.tanggal === filter.date)
      }
      if (filter?.status && filter.status !== 'all') {
        local = local.filter(s => s.status === filter.status)
      }
      return local
    }
  },

  /**
   * Fetch single session by ID
   */
  async fetchSessionById(id: string): Promise<GroomingSession | null> {
    try {
      const { data, error } = await posDb()
        .from('grooming_sessions')
        .select(`
          *,
          owner:owners(*),
          cat:cats(*),
          progress:grooming_progress(*)
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        const cached = getCachedSessions().find(s => s.id === id)
        return cached || null
      }

      return {
        ...data,
        harga: Number(data.harga || 0),
        progress: (data.progress || []).sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }
    } catch {
      const cached = getCachedSessions().find(s => s.id === id)
      return cached || null
    }
  },

  /**
   * Fetch session report by public_token (Used by Customer Live Report).
   * First tries RPC `pos.get_grooming_report`, then direct select, then local cache fallback.
   */
  async fetchReportByToken(token: string): Promise<{
    session: GroomingSession
    cat: any
    progress: GroomingProgress[]
  } | null> {
    if (!token) return null

    // 1. Try secure RPC function
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_grooming_report', {
        p_token: token,
      })

      if (!rpcError && rpcData?.session) {
        return {
          session: {
            ...rpcData.session,
            harga: Number(rpcData.session.harga || 0),
          },
          cat: rpcData.cat,
          progress: rpcData.progress || [],
        }
      }
    } catch (e) {
      // Ignore and fallback
    }

    // 2. Try direct select from pos schema
    try {
      const { data: session, error } = await posDb()
        .from('grooming_sessions')
        .select(`
          *,
          cat:cats(*),
          owner:owners(nama, no_wa),
          progress:grooming_progress(*)
        `)
        .eq('public_token', token)
        .single()

      if (!error && session) {
        return {
          session: {
            ...session,
            harga: Number(session.harga || 0),
          },
          cat: session.cat,
          progress: (session.progress || []).sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ),
        }
      }
    } catch (e) {
      // Ignore and fallback
    }

    // 3. Fallback to local demo cache (so user can view live report interface immediately)
    const cached = getCachedSessions().find(s => s.public_token === token)
    if (cached) {
      return {
        session: cached,
        cat: cached.cat,
        progress: cached.progress || [],
      }
    }

    return null
  },

  /**
   * Create a new grooming session at check-in
   */
  async createSession(payload: {
    owner_id: string
    cat_id: string
    paket: string
    harga: number
    kondisi_awal?: string
    catatan?: string
    groomer_name?: string
    estimasi_selesai?: string
    sudah_bayar?: boolean
    metode_bayar?: string
  }): Promise<GroomingSession> {
    const randomHex = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    const publicToken = `grm-${randomHex}`
    const today = new Date().toISOString().split('T')[0]

    try {
      const { data, error } = await posDb()
        .from('grooming_sessions')
        .insert({
          owner_id: payload.owner_id,
          cat_id: payload.cat_id,
          paket: payload.paket,
          harga: payload.harga,
          kondisi_awal: payload.kondisi_awal || null,
          catatan: payload.catatan || null,
          tanggal: today,
          waktu_masuk: new Date().toISOString(),
          estimasi_selesai: payload.estimasi_selesai || null,
          status: 'antrian',
          current_step: 'check_in',
          public_token: publicToken,
          sudah_bayar: payload.sudah_bayar ?? false,
          metode_bayar: payload.metode_bayar || null,
          groomer_name: payload.groomer_name || null,
        })
        .select(`
          *,
          owner:owners(*),
          cat:cats(*)
        `)
        .single()

      if (!error && data) {
        // Automatically insert the initial check-in progress
        await posDb().from('grooming_progress').insert({
          session_id: data.id,
          step: 'check_in',
          catatan: payload.kondisi_awal
            ? `Check-in grooming. Kondisi awal: ${payload.kondisi_awal}`
            : 'Check-in grooming.',
        })

        const full = await this.fetchSessionById(data.id)
        if (full) return full
      }
    } catch (err) {
      console.warn('Database write failed, storing session in local cache:', err)
    }

    // Local fallback creation
    const newSession: GroomingSession = {
      id: 'grm-local-' + Date.now(),
      owner_id: payload.owner_id,
      cat_id: payload.cat_id,
      paket: payload.paket,
      harga: payload.harga,
      kondisi_awal: payload.kondisi_awal,
      catatan: payload.catatan,
      tanggal: today,
      waktu_masuk: new Date().toISOString(),
      estimasi_selesai: payload.estimasi_selesai,
      status: 'antrian',
      current_step: 'check_in',
      public_token: publicToken,
      sudah_bayar: payload.sudah_bayar ?? false,
      metode_bayar: payload.metode_bayar,
      groomer_name: payload.groomer_name,
      created_at: new Date().toISOString(),
      progress: [
        {
          id: 'prog-init-' + Date.now(),
          session_id: 'grm-local-' + Date.now(),
          step: 'check_in',
          catatan: payload.kondisi_awal
            ? `Check-in grooming. Kondisi awal: ${payload.kondisi_awal}`
            : 'Check-in grooming.',
          created_at: new Date().toISOString(),
        },
      ],
    }

    const current = getCachedSessions()
    saveCachedSessions([newSession, ...current])
    return newSession
  },

  /**
   * Advance grooming step & status
   */
  async updateStep(
    sessionId: string,
    step: GroomingStep,
    extra?: {
      status?: GroomingStatus
      catatan?: string
      foto_url?: string
    }
  ): Promise<void> {
    // Check terminal status guard
    const currentSession = await this.fetchSessionById(sessionId)
    if (currentSession && (currentSession.status === 'dijemput' || currentSession.status === 'dibatalkan')) {
      throw new Error(`Sesi grooming sudah dalam status '${currentSession.status}' dan tidak dapat diubah lagi.`)
    }

    const isDone = step === 'done'
    const newStatus: GroomingStatus = extra?.status
      ? extra.status
      : isDone
      ? 'selesai'
      : step === 'check_in'
      ? 'antrian'
      : 'dikerjakan'

    const updatePayload: any = {
      current_step: step,
      status: newStatus,
    }

    if (isDone) {
      updatePayload.waktu_selesai = new Date().toISOString()
    }

    try {
      await posDb()
        .from('grooming_sessions')
        .update(updatePayload)
        .eq('id', sessionId)

      // Guard against duplicate progress inserts for the same session and step
      const { data: existingProgress } = await posDb()
        .from('grooming_progress')
        .select('id')
        .eq('session_id', sessionId)
        .eq('step', step)
        .maybeSingle()

      if (!existingProgress) {
        await posDb().from('grooming_progress').insert({
          session_id: sessionId,
          step,
          catatan: extra?.catatan || null,
          foto_url: extra?.foto_url || null,
        })
      } else if (extra?.foto_url || extra?.catatan) {
        await posDb()
          .from('grooming_progress')
          .update({
            catatan: extra.catatan || undefined,
            foto_url: extra.foto_url || undefined,
          })
          .eq('id', existingProgress.id)
      }
    } catch (e) {
      console.warn('Update step db error, updating local cache:', e)
    }

    // Always update local cache so UI reacts instantly
    const sessions = getCachedSessions().map(s => {
      if (s.id === sessionId) {
        // Prevent duplicate step in local cache progress if already present
        const hasStep = (s.progress || []).some(p => p.step === step && !extra?.foto_url && !extra?.catatan)
        const newProgress: GroomingProgress = {
          id: 'prog-' + Date.now(),
          session_id: sessionId,
          step,
          catatan: extra?.catatan,
          foto_url: extra?.foto_url,
          created_at: new Date().toISOString(),
        }
        return {
          ...s,
          current_step: step,
          status: newStatus,
          waktu_selesai: isDone ? new Date().toISOString() : s.waktu_selesai,
          progress: hasStep ? s.progress : [...(s.progress || []), newProgress],
        }
      }
      return s
    })
    saveCachedSessions(sessions)
  },

  /**
   * Mark pet as picked up by owner
   */
  async markPickedUp(sessionId: string): Promise<void> {
    const currentSession = await this.fetchSessionById(sessionId)
    if (currentSession && currentSession.status !== 'selesai') {
      throw new Error(
        `Kucing hanya dapat dijemput jika status sudah 'selesai'. Status saat ini: '${currentSession.status}'.`
      )
    }

    try {
      await posDb()
        .from('grooming_sessions')
        .update({ status: 'dijemput' })
        .eq('id', sessionId)
    } catch (e) {
      console.warn('DB error, updating local cache:', e)
    }

    const sessions = getCachedSessions().map(s =>
      s.id === sessionId ? { ...s, status: 'dijemput' as GroomingStatus } : s
    )
    saveCachedSessions(sessions)
  },

  /**
   * Upload grooming photo to Supabase Storage 'cat-photos' in 'grooming/{sessionId}/' folder.
   * If storage fails (e.g. bucket config not yet updated), creates an inline data URL fallback.
   */
  async uploadGroomingPhoto(
    file: File,
    sessionId: string,
    step: GroomingStep
  ): Promise<string> {
    const ALLOWED_MIME_TYPES: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }

    const mime = (file.type || '').toLowerCase()
    const safeExt = ALLOWED_MIME_TYPES[mime]
    if (!safeExt) {
      throw new Error('Format file tidak didukung. Harap unggah foto format JPEG, PNG, atau WebP.')
    }

    const cleanSessionId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '')
    const cleanStep = step.replace(/[^a-zA-Z0-9_-]/g, '')
    const filePath = `grooming/${cleanSessionId}/${cleanStep}-${Date.now()}.${safeExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('cat-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (!uploadError) {
        const { data } = supabase.storage.from('cat-photos').getPublicUrl(filePath)
        if (data?.publicUrl) return data.publicUrl
      }
    } catch (e) {
      console.warn('Storage upload error, using local FileReader URL:', e)
    }

    // Fallback: Read file as Base64 Data URL so user can preview immediately
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Gagal membaca data gambar dari perangkat'))
      reader.onabort = () => reject(new Error('Pembacaan gambar dibatalkan'))
      reader.readAsDataURL(file)
    })
  },

  /**
   * Fetch grooming packages
   */
  async fetchPaketGrooming(): Promise<PaketGrooming[]> {
    try {
      const { data, error } = await posDb()
        .from('paket_grooming')
        .select('*')
        .eq('aktif', true)
        .order('harga', { ascending: true })

      if (!error && data && data.length > 0) {
        const formatted = data.map((p: any) => ({
          ...p,
          harga: Number(p.harga),
        }))
        saveCachedPackages(formatted)
        return formatted
      }
    } catch (e) {
      // Fallback
    }

    return getCachedPackages()
  },

  /**
   * Add package
   */
  async addPaketGrooming(pkg: Omit<PaketGrooming, 'id'>): Promise<PaketGrooming> {
    try {
      const { data, error } = await posDb()
        .from('paket_grooming')
        .insert({
          nama: pkg.nama,
          harga: pkg.harga,
          deskripsi: pkg.deskripsi || null,
          durasi_estimasi: pkg.durasi_estimasi || 60,
          aktif: true,
        })
        .select()
        .single()

      if (!error && data) {
        return { ...data, harga: Number(data.harga) }
      }
    } catch (e) {
      // Fallback
    }

    const newPkg: PaketGrooming = {
      ...pkg,
      id: 'pkg-local-' + Date.now(),
    }
    const current = getCachedPackages()
    saveCachedPackages([...current, newPkg])
    return newPkg
  },

  /**
   * Update package
   */
  async updatePaketGrooming(id: string, partial: Partial<PaketGrooming>): Promise<void> {
    try {
      await posDb().from('paket_grooming').update(partial).eq('id', id)
    } catch (e) {
      // Fallback
    }

    const current = getCachedPackages().map(p => (p.id === id ? { ...p, ...partial } : p))
    saveCachedPackages(current)
  },
}
