import { supabase } from '@/lib/supabase'

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

export function useClockOut() {
  const clockOut = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not logged in')

    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('user_id', user.id)
      .eq('date', today)

    if (error) throw error
  }

  return { clockOut }
}