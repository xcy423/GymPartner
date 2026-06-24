import { supabase } from './supabase';

export const SESSION_PHOTOS_BUCKET = 'session-photos';
export const MIN_SESSION_MINS = 50;

export function sessionPhotoPath(userId: string, date: string, kind: 'checkin' | 'checkout'): string {
  return `${userId}/${date}/${kind}.jpg`;
}

export async function uploadSessionPhoto(
  userId: string,
  date: string,
  kind: 'checkin' | 'checkout',
  photoDataUrl: string,
): Promise<string> {
  const blob = await fetch(photoDataUrl).then((response) => response.blob());
  const path = sessionPhotoPath(userId, date, kind);

  const { error } = await supabase.storage.from(SESSION_PHOTOS_BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(SESSION_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
