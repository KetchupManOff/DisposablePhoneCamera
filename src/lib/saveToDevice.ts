/**
 * Save a photo to the device's photo library.
 * On mobile, uses the Web Share API to open the native share sheet
 * (which includes "Save Image" / "Enregistrer dans Photos").
 * Falls back to direct download on desktop.
 */
export async function savePhotoToDevice(dataUrl: string, filename: string): Promise<boolean> {
  try {
    // Convert base64 data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

    // Try Web Share API first (best for mobile — gives native Save to Photos)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
      return true;
    }
  } catch (err) {
    // Web Share API failed or was cancelled — fall through to download
    if (err instanceof DOMException && err.name === 'AbortError') {
      // User cancelled the share sheet — not a failure
      return false;
    }
  }

  // Fallback: direct download
  return downloadFile(dataUrl, filename);
}

export interface PhotoToSave {
  dataUrl: string;
  filename: string;
}

/**
 * Save ALL photos to the device in one go.
 *
 * Strategy:
 * 1. Try the multi-file Web Share API (iOS/Android) — opens the native share
 *    sheet with every photo, letting the user save them all into Photos at once.
 * 2. If files can't be shared (desktop/unsupported), fall back to a sequential
 *    download of each photo.
 */
export async function savePhotosToDevice(
  photos: PhotoToSave[],
  onProgress?: (saved: number, total: number) => void,
): Promise<boolean> {
  if (photos.length === 0) return false;

  // 1) Multi-file Web Share API
  try {
    const files = await Promise.all(
      photos.map(async ({ dataUrl, filename }) => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type || 'image/jpeg' });
      }),
    );

    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({ files });
      onProgress?.(files.length, files.length);
      return true;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // User cancelled the native share sheet
      return false;
    }
    // Any other failure → try the per-file fallback below
  }

  // 2) Sequential downloads
  let saved = 0;
  for (const { dataUrl, filename } of photos) {
    const ok = await downloadFile(dataUrl, filename);
    if (ok) saved++;
    onProgress?.(saved, photos.length);
    // Small delay so browsers don't block the subsequent downloads
    await new Promise((r) => setTimeout(r, 300));
  }
  return saved > 0;
}

/** Programmatic anchor download. Works on desktop + Android Chrome. */
function downloadFile(dataUrl: string, filename: string): boolean {
  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch {
    return false;
  }
}