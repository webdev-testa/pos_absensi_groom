import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { posService } from '@/services/posService'
import type { PaketHarga, Pengaturan } from '@/types/pos'
import { toast } from 'sonner'

const DEFAULT_PENGATURAN: Pengaturan = {
  id: 1,
  nama_usaha: 'Dr. Meow Cat Hotel & Care',
  no_wa_usaha: '081234567890',
  alamat_usaha: 'Jl. Ahmad Yani No. 45, Jakarta Selatan',
  nama_bank: 'BCA (Bank Central Asia)',
  no_rekening: '8735091234',
  atas_nama_rekening: 'Dr. Meow Cat Clinic',
  qris_nmid: 'ID1020304050607',
}

export function usePengaturan() {
  const queryClient = useQueryClient()

  // Query: Pengaturan
  const { data: pengaturan = DEFAULT_PENGATURAN, isLoading: isLoadingSettings } = useQuery<Pengaturan>({
    queryKey: ['pos_pengaturan'],
    queryFn: () => posService.fetchPengaturan(),
    staleTime: 1000 * 60 * 5,
  })

  // Query: Paket Harga
  const { data: paketList = [], isLoading: isLoadingPakets } = useQuery<PaketHarga[]>({
    queryKey: ['pos_pakets'],
    queryFn: () => posService.fetchPaketHarga(),
    staleTime: 1000 * 60 * 5,
  })

  // Form State
  const [settingsForm, setSettingsForm] = useState<Pengaturan>(DEFAULT_PENGATURAN)

  useEffect(() => {
    if (pengaturan) {
      setSettingsForm(pengaturan)
    }
  }, [pengaturan])

  // Mutation: Save Settings
  const saveSettingsMutation = useMutation({
    mutationFn: (form: Partial<Pengaturan>) => posService.updatePengaturan(form),
    onSuccess: (updated) => {
      setSettingsForm(updated)
      queryClient.invalidateQueries({ queryKey: ['pos_pengaturan'] })
      toast.success('Pengaturan Info Usaha berhasil disimpan!')
    },
    onError: (err: any) => {
      console.error('Error saving settings:', err)
      toast.error(err.message || 'Gagal menyimpan pengaturan')
    },
  })

  // Mutation: Add Package
  const addPaketMutation = useMutation({
    mutationFn: (paket: Omit<PaketHarga, 'id'>) => posService.addPaket(paket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos_pakets'] })
      toast.success('Paket baru berhasil ditambahkan!')
    },
    onError: (err: any) => {
      console.error('Error adding package:', err)
      toast.error(err.message || 'Gagal menambahkan paket')
    },
  })

  // Mutation: Update Package
  const updatePaketMutation = useMutation({
    mutationFn: ({ id, partial }: { id: string; partial: Partial<PaketHarga> }) =>
      posService.updatePaket(id, partial),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos_pakets'] })
      toast.success('Paket berhasil diperbarui!')
    },
    onError: (err: any) => {
      console.error('Error updating package:', err)
      toast.error(err.message || 'Gagal memperbarui paket')
    },
  })

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settingsForm)
  }

  const handleAddPaket = (paket: Omit<PaketHarga, 'id'>) => {
    addPaketMutation.mutate(paket)
  }

  const handleUpdatePaket = (id: string, partial: Partial<PaketHarga>) => {
    updatePaketMutation.mutate({ id, partial })
  }

  const handleToggleAktif = (id: string, currentAktif: boolean) => {
    updatePaketMutation.mutate({ id, partial: { aktif: !currentAktif } })
  }

  return {
    pengaturan,
    settingsForm,
    setSettingsForm,
    handleSaveSettings,
    isSavingSettings: saveSettingsMutation.isPending,
    paketList,
    handleAddPaket,
    handleUpdatePaket,
    handleToggleAktif,
    isLoading: isLoadingSettings || isLoadingPakets,
  }
}
