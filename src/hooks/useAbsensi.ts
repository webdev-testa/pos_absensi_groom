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

export function useClockIn() {
  
  // Step 1 — Get GPS
  const getLocation = (): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { enableHighAccuracy: true }
      )
    })
  }

  // Step 2 — Capture photo (no gallery, camera only)
  const capturePhoto = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      // forces front camera, blocks gallery
      // For mobile devices, "user" means front-facing camera.
      input.capture = 'user' 
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) resolve(file)
        else reject(new Error('No photo selected'))
      }
      input.click()
    })
  }

  // Step 3 — Upload photo + save attendance
  const clockIn = async () => {
    // 1. Trigger photo capture IMMEDIATELY to preserve user activation
    // Do NOT await anything before this, otherwise the browser blocks the file chooser.
    const photoPromise = capturePhoto()

    // 2. Now we can safely await other async operations
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not logged in')

    // Get GPS
    const coords = await getLocation()
    
    // Wait for the photo capture to complete
    const photo = await photoPromise

    // Upload photo to storage
    const filename = `${user.id}/${Date.now()}.jpg`
    const { error: uploadError } = await supabase
      .storage
      .from('attendance-photos')
      .upload(filename, photo)
    
    if (uploadError) throw uploadError

    // Get photo URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('attendance-photos')
      .getPublicUrl(filename)

    // Save to attendance (removed .schema('hr') as it's not defined in other parts)
    const { error } = await supabase
      .from('attendance')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        clock_in_time: new Date().toISOString(),
        clock_in_lat: coords.latitude,
        clock_in_lng: coords.longitude,
        clock_in_photo_url: publicUrl,
        status: 'ontime'  // you can calculate late logic here later
      })

    if (error) throw error
  }

  return { clockIn }
}