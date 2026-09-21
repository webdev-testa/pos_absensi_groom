import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { BranchOffice, BranchFormData } from '@/types/branch';
import { DEFAULT_BRANCHES } from '@/constants/geofence.constants';

const STORAGE_KEY_BRANCHES = 'dr_meow_branches_cache';

export const getCachedBranches = (): BranchOffice[] => {
  if (typeof window === 'undefined') return DEFAULT_BRANCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BRANCHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }

    // Defensive item-level validation against corrupted or null array items
    const validBranches = parsed
      .filter(
        (b): b is BranchOffice =>
          b != null &&
          typeof b === 'object' &&
          typeof b.id === 'string' &&
          Number.isFinite(Number(b.lat)) &&
          Number.isFinite(Number(b.lng))
      )
      .map((b) => ({
        ...b,
        name: String(b.name || 'Cabang'),
        address: String(b.address || ''),
        lat: Number(b.lat),
        lng: Number(b.lng),
        radius: Math.min(5000, Math.max(10, Number(b.radius) || 100)),
        is_active: b.is_active !== false,
      }));

    if (validBranches.length === 0) {
      localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }

    return validBranches;
  } catch (e) {
    console.error('Failed to parse cached branches:', e);
    return DEFAULT_BRANCHES;
  }
};

export const saveCachedBranches = (branches: BranchOffice[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(branches));
  } catch (e) {
    console.error('Failed to save branches to cache:', e);
  }
};

export const branchService = {
  async fetchBranches(): Promise<BranchOffice[]> {
    try {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('branches')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        // Table not ready or empty -> use cached / default branches
        return getCachedBranches();
      }

      const formatted: BranchOffice[] = data.map((row: any) => ({
        id: String(row.id),
        name: row.name || 'Cabang',
        address: row.address || '',
        lat: Number(row.lat),
        lng: Number(row.lng),
        radius: Number(row.radius) || 100,
        is_active: row.is_active !== false,
        created_at: row.created_at,
      }));

      saveCachedBranches(formatted);
      return formatted;
    } catch {
      return getCachedBranches();
    }
  },

  async createBranch(formData: BranchFormData): Promise<BranchOffice> {
    const cleanId =
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);

    const newBranch: BranchOffice = {
      id: cleanId,
      name: formData.name.trim(),
      address: (formData.address || '').trim(),
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      radius: Math.max(10, Number(formData.radius) || 100),
      is_active: formData.is_active !== false,
      created_at: new Date().toISOString(),
    };

    // Try inserting into Supabase
    try {
      await supabaseAdmin.schema('hr').from('branches').insert([newBranch]);
    } catch (e) {
      console.warn('Supabase hr.branches not ready, stored locally:', e);
    }

    // Always update local cache
    const current = getCachedBranches();
    const updated = [...current, newBranch];
    saveCachedBranches(updated);

    return newBranch;
  },

  async updateBranch(
    id: string,
    updates: Partial<BranchFormData>
  ): Promise<BranchOffice> {
    const current = getCachedBranches();
    const target = current.find((b) => b.id === id);
    if (!target) {
      throw new Error(`Cabang dengan ID ${id} tidak ditemukan`);
    }

    const updatedBranch: BranchOffice = {
      ...target,
      ...updates,
      lat: updates.lat != null ? Number(updates.lat) : target.lat,
      lng: updates.lng != null ? Number(updates.lng) : target.lng,
      radius:
        updates.radius != null
          ? Math.max(10, Number(updates.radius))
          : target.radius,
    };

    // Try updating Supabase
    try {
      await supabaseAdmin
        .schema('hr')
        .from('branches')
        .update(updatedBranch)
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase hr.branches update failed, updated locally:', e);
    }

    // Update local cache
    const updatedList = current.map((b) => (b.id === id ? updatedBranch : b));
    saveCachedBranches(updatedList);

    return updatedBranch;
  },

  async deleteBranch(id: string): Promise<boolean> {
    const current = getCachedBranches();
    // Do not allow deleting if it's the only remaining branch (check BEFORE remote delete)
    if (current.length <= 1) {
      throw new Error('Tidak dapat menghapus cabang terakhir');
    }

    const target = current.find((b) => b.id === id);
    if (!target) {
      throw new Error(`Cabang dengan ID ${id} tidak ditemukan`);
    }

    // Try deleting from Supabase
    try {
      await supabaseAdmin.schema('hr').from('branches').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase hr.branches delete failed, deleted locally:', e);
    }

    // Update local cache
    const updated = current.filter((b) => b.id !== id);
    saveCachedBranches(updated);

    return true;
  },
};
