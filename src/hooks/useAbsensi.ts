import { supabase } from '@/lib/supabase'

export function useAbsensi(userId: string) {

  // fetch today's attendance record
  const getTodayAttendance = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    return data
  }

  // the full clock-in flow
  const clockIn = async (photoBlob: Blob, lat: number, lng: number) => {

    // 1. upload photo to Supabase Storage
    const fileName = `${userId}/${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('attendance-photos')
      .upload(fileName, photoBlob)

    if (uploadError) {
      return { data: null, error: uploadError }
    }

    const photoUrl = supabase.storage
      .from('attendance-photos')
      .getPublicUrl(fileName).data.publicUrl

    // 2. insert attendance record
    // note: clock_in_time uses now() from DB, not device time
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        clock_in_photo_url: photoUrl,
        clock_in_lat: lat,
        clock_in_lng: lng,
        // status determined by Edge Function, not client
      })

    return { data, error }
  }

  // the full clock-out flow
  const clockOut = async (lat: number, lng: number) => {
    // update attendance record
    // note: clock_out_time uses now() from DB
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('attendance')
      .update({
        clock_out_lat: lat,
        clock_out_lng: lng,
      })
      .eq('user_id', userId)
      .eq('date', today)

    return { data, error }
  }

  // fetch attendance history for a given month
  const getHistory = async (year: number, month: number) => {
    const from = `${year}-${String(month).padStart(2,'0')}-01`
    const to   = `${year}-${String(month).padStart(2,'0')}-31`
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false })
    return data
  }

  return { clockIn, clockOut, getTodayAttendance, getHistory }
}