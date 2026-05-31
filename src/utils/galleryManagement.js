import { supabase } from './supabase'

const normalizeText = (value) => String(value || '').trim()

export const normalizeEvent = (row) => {
  if (!row) return null
  const yearStr = row.event_year ? row.event_year.split('-')[0] : 'Unknown'
  return {
    id: row.id,
    eventName: row.event_name || 'Unnamed Event',
    eventYear: yearStr,
    eventDate: row.event_year || null,
    createdAt: row.created_at,
  }
}

export const normalizeGalleryItem = (row) => {
  if (!row) return null
  return {
    id: row.id,
    eventId: row.event_id || '',
    type: row.type || 'key', // 'key' or 'all'
    link: row.link || '',
    createdAt: row.created_at,
  }
}

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('event')
    .select('*')
    .order('event_year', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to fetch events.')
  }

  return (data || []).map(normalizeEvent).filter(Boolean)
}

export async function createEvent({ eventName, eventYear }) {
  const dateStr = `${eventYear}-01-01`
  const { data, error } = await supabase
    .from('event')
    .insert({
      event_name: normalizeText(eventName),
      event_year: dateStr,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to create event.')
  }

  return normalizeEvent(data)
}

export async function fetchGalleryItems(eventId) {
  const { data, error } = await supabase
    .from('gallary')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message || 'Unable to fetch gallery items.')
  }

  return (data || []).map(normalizeGalleryItem).filter(Boolean)
}

export async function addGalleryItem({ eventId, type, link }) {
  const { data, error } = await supabase
    .from('gallary')
    .insert({
      event_id: eventId,
      type: normalizeText(type),
      link: normalizeText(link),
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to add gallery photo/link.')
  }

  return normalizeGalleryItem(data)
}

export async function uploadGalleryPhoto(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : String(Date.now())
  const filePath = `gallary/${fileId}-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('student-photos')
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
    })

  if (uploadError) {
    throw new Error(uploadError.message || 'Unable to upload photo.')
  }

  const { data } = supabase.storage
    .from('student-photos')
    .getPublicUrl(filePath)

  return data?.publicUrl || ''
}

export async function deleteEvent(eventId) {
  // 1. Fetch gallery items to delete files from storage
  const { data: items, error: fetchError } = await supabase
    .from('gallary')
    .select('*')
    .eq('event_id', eventId)

  if (!fetchError && items) {
    const filePaths = items
      .filter(item => item.type === 'key' && item.link && item.link.includes('student-photos/'))
      .map(item => {
        const parts = item.link.split('student-photos/')
        return parts.length > 1 ? parts[1] : null
      })
      .filter(Boolean)

    if (filePaths.length > 0) {
      try {
        await supabase.storage
          .from('student-photos')
          .remove(filePaths)
      } catch (e) {
        console.error('Storage files deletion error:', e)
      }
    }
  }

  // 2. Delete the event from DB (cascades to gallary table)
  const { error } = await supabase
    .from('event')
    .delete()
    .eq('id', eventId)

  if (error) {
    throw new Error(error.message || 'Unable to delete event.')
  }
}

export async function deleteGalleryItem(itemId, fileUrl) {
  // 1. Delete from DB first
  const { error: dbError } = await supabase
    .from('gallary')
    .delete()
    .eq('id', itemId)

  if (dbError) {
    throw new Error(dbError.message || 'Unable to delete gallery item.')
  }

  // 2. If there's a file URL in student-photos, try to delete from storage
  if (fileUrl && fileUrl.includes('student-photos/')) {
    try {
      const parts = fileUrl.split('student-photos/')
      if (parts.length > 1) {
        const filePath = parts[1]
        await supabase.storage
          .from('student-photos')
          .remove([filePath])
      }
    } catch (e) {
      console.error('Storage file deletion error:', e)
    }
  }
}

