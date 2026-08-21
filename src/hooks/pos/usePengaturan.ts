import { useState } from 'react'
import { usePosStore } from '@/data/pos-store'
import type { PaketHarga, Pengaturan } from '@/types/pos'

export function usePengaturan() {
  const store = usePosStore()

  const [settingsForm, setSettingsForm] = useState<Pengaturan>({
    ...store.pengaturan,
  })

  const handleSaveSettings = () => {
    store.updatePengaturan(settingsForm)
  }

  const handleAddPaket = (paket: Omit<PaketHarga, 'id'>) => {
    const newPaket: PaketHarga = {
      id: `p-${Date.now()}`,
      ...paket,
    }
    store.addPaket(newPaket)
  }

  const handleUpdatePaket = (id: string, partial: Partial<PaketHarga>) => {
    store.updatePaket(id, partial)
  }

  const handleToggleAktif = (id: string, currentAktif: boolean) => {
    store.updatePaket(id, { aktif: !currentAktif })
  }

  const handleResetData = () => {
    store.resetAll()
    setSettingsForm(store.pengaturan)
  }

  return {
    pengaturan: store.pengaturan,
    settingsForm,
    setSettingsForm,
    handleSaveSettings,
    paketList: store.paketHarga,
    handleAddPaket,
    handleUpdatePaket,
    handleToggleAktif,
    handleResetData,
  }
}
