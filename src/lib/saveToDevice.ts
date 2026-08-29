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