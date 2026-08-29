import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useLockTimer } from '../../hooks/useLockTimer';
import { db } from '../../lib/db';
import { decrypt } from '../../lib/crypto';
import { savePhotoToDevice, savePhotosToDevice } from '../../lib/saveToDevice';

interface LockedGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

/** A single "print" card in simple mode: face-down, must be saved to device to see. */
function PrintCard({
  index,
  total,
  photoId,
  timestamp,
  saved,
  onSave,
  onTrash,
}: {
  index: number;
  total: number;
  photoId: string;
  timestamp: number;
  saved: boolean;
  onSave: (id: string) => void;
  onTrash: (id: string) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isTrashing, setIsTrashing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short' });

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const stored = await db.photos.get(photoId);
      if (!stored) {
        setSaveError('Photo introuvable');
        return;
      }
      const decrypted = decrypt(stored.dataUrl);
      const filename = `DispoCam-${dateStr.replace(' ', '-')}-${timeStr.replace(':', 'h')}.jpg`;
      const success = await savePhotoToDevice(decrypted, filename);
      if (success) {
        onSave(photoId);
      }
    } catch {
      setSaveError('Échec de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, [photoId, timeStr, dateStr, onSave]);

  const handleTrash = useCallback(() => {
    setIsTrashing(true);
    setTimeout(() => onTrash(photoId), 200);
  }, [photoId, onTrash]);

  return (
    <div
      className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
        isTrashing
          ? 'opacity-0 scale-95 -translate-x-4'
          : saved
            ? 'border-vintage-accent/30 bg-vintage-accent/5'
            : 'border-vintage-border/30 bg-vintage-surface/20 hover:border-vintage-border/50'
      }`}
    >
      <div
        className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors ${
          isTrashing
            ? 'bg-red-500/10 text-red-400'
            : saved
              ? 'bg-vintage-accent/20 text-vintage-accent'
              : 'bg-vintage-surface/50 text-vintage-muted'
        }`}
      >
        {isTrashing ? '🗑️' : saved ? '✅' : '🖼️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display text-vintage-text">
          Photo {index + 1} / {total}
        </p>
        <p className="text-[11px] font-mono text-vintage-muted">
          {dateStr} · {timeStr}
        </p>
        {saved && (
          <p className="text-[10px] font-mono text-vintage-accent mt-0.5">
            Enregistrée dans vos photos ✓
          </p>
        )}
        {saveError && (
          <p className="text-[10px] font-mono text-red-400 mt-0.5">{saveError}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {!saved && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-vintage-accent/20 border border-vintage-accent/40 text-vintage-accent text-xs font-mono hover:bg-vintage-accent/30 disabled:opacity-50 transition-all"
          >
            {isSaving ? '⏳' : '💾 Sauvegarder'}
          </button>
        )}
        <button
          onClick={handleTrash}
          disabled={isTrashing}
          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono hover:bg-red-500/20 transition-all"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
/** Full-screen photo viewer for control mode: swipe / arrows / keyboard navigation. */
function Lightbox({
  photos,
  decryptedUrls,
  index,
  onIndexChange,
  onClose,
  onDownload,
  onDelete,
}: {
  photos: { id: string; timestamp: number }[];
  decryptedUrls: Map<string, string>;
  index: number | null;
  onIndexChange: (i: number | null) => void;
  onClose: () => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const touchStartX = useRef<number | null>(null);

  // Clamp the index when photos are deleted from within the lightbox
  useEffect(() => {
    if (index === null) return;
    if (photos.length === 0) {
      onIndexChange(null);
    } else if (index >= photos.length) {
      onIndexChange(photos.length - 1);
    }
  }, [index, photos.length, onIndexChange]);

  // Keyboard navigation (desktop)
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onIndexChange((index + 1) % photos.length);
      else if (e.key === 'ArrowLeft') onIndexChange((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, photos.length, onIndexChange, onClose]);

  if (index === null || photos.length === 0) return null;

  const photo = photos[index];
  const url = decryptedUrls.get(photo.id);
  const date = new Date(photo.timestamp);
  const label = `${date.toLocaleDateString([], { day: 'numeric', month: 'short' })} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="absolute inset-0 z-[60] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-6">
        <p className="font-mono text-vintage-muted text-sm">
          {index + 1} / {photos.length}
        </p>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text"
        >
          ✕
        </button>
      </div>

      {/* Photo area (swipe to navigate) */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 50) {
            if (delta < 0) onIndexChange((index + 1) % photos.length);
            else onIndexChange((index - 1 + photos.length) % photos.length);
          }
          touchStartX.current = null;
        }}
      >
        {url ? (
          <img
            src={url}
            alt={`Photo ${date.toLocaleDateString()}`}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="text-vintage-muted/50 text-xl">🎞️</div>
        )}
        <button
          onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
          className="absolute left-2 sm:left-4 w-9 h-9 rounded-full bg-black/50 border border-vintage-border/40 flex items-center justify-center text-vintage-text hover:border-vintage-accent/60 transition-colors"
          aria-label="Photo précédente"
        >
          ‹
        </button>
        <button
          onClick={() => onIndexChange((index + 1) % photos.length)}
          className="absolute right-2 sm:right-4 w-9 h-9 rounded-full bg-black/50 border border-vintage-border/40 flex items-center justify-center text-vintage-text hover:border-vintage-accent/60 transition-colors"
          aria-label="Photo suivante"
        >
          ›
        </button>
      </div>

      {/* Footer : info + actions */}
      <div className="p-4 border-t border-vintage-border/20 flex items-center justify-between gap-3">
        <p className="text-xs font-mono text-vintage-muted">{label}</p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onDownload(photo.id)}
            className="px-3 py-2 rounded-lg bg-vintage-accent/20 border border-vintage-accent/40 text-vintage-accent text-xs font-mono hover:bg-vintage-accent/30 transition-all"
          >
            💾 Enregistrer
          </button>
          <button
            onClick={() => onDelete(photo.id)}
            className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono hover:bg-red-500/20 transition-all"
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
/** Grid view for "control" mode — photos are directly visible. */
function ControlGallery({
  photos,
  decryptedUrls,
  onClose,
  onRemovePhoto,
  onDownload,
  projectName,
  maxPoses,
}: {
  photos: { id: string; timestamp: number }[];
  decryptedUrls: Map<string, string>;
  onClose: () => void;
  onRemovePhoto: (id: string) => void;
  onDownload: (id: string) => void;
  projectName: string;
  maxPoses: number;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg/95 backdrop-blur-md">
        <div className="flex items-center justify-between p-4 pt-safe-6 border-b border-vintage-border/30">
          <h2 className="text-lg font-display text-vintage-text">
            {projectName} ({photos.length}/{maxPoses})
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-5xl mb-4">🎞️</p>
              <p className="text-vintage-muted text-sm">Aucune photo pour le moment.</p>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-mono text-vintage-muted mb-3 text-center">
                Appuyez sur une photo pour la voir en grand
              </p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => {
                  const url = decryptedUrls.get(photo.id);
                  return (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedIndex(i)}
                      className="aspect-square rounded-lg overflow-hidden bg-vintage-surface/50 border border-vintage-border/30 group relative"
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={`Photo ${photo.id}`}
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-vintage-muted/40">
                          🎞️
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          decryptedUrls={decryptedUrls}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={() => setSelectedIndex(null)}
          onDownload={onDownload}
          onDelete={onRemovePhoto}
        />
      )}
    </>
  );
}
/** Simple mode gallery: "print stack" — photos must be saved to device to be seen. */
function SimpleGallery({
  photos,
  onClose,
  onRemovePhoto,
}: {
  photos: { id: string; timestamp: number }[];
  onClose: () => void;
  onRemovePhoto: (id: string) => void;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const savedCount = savedIds.size;
  const allSaved = photos.length > 0 && savedCount === photos.length;

  const handleSave = useCallback((id: string) => {
    setSavedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (photos.length === 0 || isDownloadingAll) return;
    setIsDownloadingAll(true);
    setDownloadError(null);
    try {
      const items: { dataUrl: string; filename: string }[] = [];
      for (let i = 0; i < photos.length; i++) {
        const stored = await db.photos.get(photos[i].id);
        if (stored) {
          items.push({ dataUrl: decrypt(stored.dataUrl), filename: `DispoCam-${i + 1}.jpg` });
        }
      }
      const ok = await savePhotosToDevice(items);
      if (ok) {
        setSavedIds(new Set(photos.map((p) => p.id)));
      }
    } catch {
      setDownloadError('Échec du téléchargement. Réessayez.');
    } finally {
      setIsDownloadingAll(false);
    }
  }, [photos, isDownloadingAll]);

  if (photos.length === 0) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg/95 backdrop-blur-md">
        <div className="flex items-center justify-between p-4 pt-safe-6 border-b border-vintage-border/30">
          <h2 className="text-lg font-display text-vintage-text">Tirages</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-vintage-muted text-sm">Aucun tirage pour le moment.</p>
          <p className="text-vintage-muted/60 text-xs mt-2">
            Prenez votre première photo !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg/95 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-6 border-b border-vintage-border/30">
        <div>
          <h2 className="text-lg font-display text-vintage-text">Vos tirages</h2>
          <p className="text-[10px] font-mono text-vintage-muted">
            {photos.length} tirage{photos.length > 1 ? 's' : ''} · {savedCount} sauvegardé{savedCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text"
        >
          ✕
        </button>
      </div>

      {/* Guide */}
      <div className="px-4 py-3 border-b border-vintage-border/20 bg-vintage-surface/10">
        <p className="text-xs font-mono text-vintage-muted text-center leading-relaxed">
          Comme de vrais tirages, vos photos sont masquées.<br />
          <span className="text-vintage-accent">Téléchargez-les d&apos;un coup</span> dans votre pellicule pour les voir,
          puis <span className="text-red-400">jetez</span> celles que vous n&apos;aimez pas.
        </p>
      </div>

      {/* Download-all */}
      <div className="px-4 pt-4">
        <button
          onClick={handleDownloadAll}
          disabled={isDownloadingAll || allSaved}
          className="w-full py-4 rounded-2xl bg-vintage-accent/90 text-vintage-bg font-display text-base flex items-center justify-center gap-2 hover:bg-vintage-accent disabled:opacity-50 transition-all cursor-pointer"
        >
          {isDownloadingAll
            ? '⏳ Téléchargement…'
            : allSaved
              ? '✅ Tout est dans vos photos'
              : '📥 Tout télécharger dans mes photos'}
        </button>
        <p className="text-[10px] font-mono text-vintage-muted text-center mt-2">
          Les {photos.length} photos seront exportées en une fois dans votre pellicule photo.
        </p>
        {downloadError && (
          <p className="text-[10px] font-mono text-red-400 text-center mt-1">{downloadError}</p>
        )}
      </div>

      {/* Print stack */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        {photos.map((photo, i) => (
          <PrintCard
            key={photo.id}
            index={i}
            total={photos.length}
            photoId={photo.id}
            timestamp={photo.timestamp}
            saved={savedIds.has(photo.id)}
            onSave={handleSave}
            onTrash={onRemovePhoto}
          />
        ))}
      </div>

      {/* Footer with progress */}
      <div className="p-4 border-t border-vintage-border/30">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-vintage-surface/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-vintage-accent transition-all duration-500"
              style={{ width: `${photos.length > 0 ? (savedCount / photos.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-vintage-muted shrink-0">
            {savedCount}/{photos.length}
          </span>
        </div>
      </div>
    </div>
  );
}
export function LockedGallery({ isOpen, onClose }: LockedGalleryProps) {
  const currentProject = useStore((s) => s.currentProject());
  const setCurrentProjectPhotos = useStore((s) => s.setCurrentProjectPhotos);
  const isUnlocked = currentProject?.isUnlocked ?? true;
  const { isLocked, timeRemaining } = useLockTimer();
  const [decryptedUrls, setDecryptedUrls] = useState<Map<string, string>>(new Map());

  const mode = currentProject?.mode ?? 'simple';
  const photos = currentProject?.photos ?? [];

  // Load & decrypt photos from IndexedDB (for control mode preview only)
  useEffect(() => {
    if (!isOpen || !isUnlocked || !currentProject || mode !== 'control') return;
    const loadPhotos = async () => {
      const stored = await db.photos
        .where('projectId')
        .equals(currentProject.id)
        .toArray();
      const urls = new Map<string, string>();
      for (const p of stored) {
        try {
          const decrypted = decrypt(p.dataUrl);
          urls.set(p.id, decrypted);
        } catch { /* ignore corrupt photos */ }
      }
      setDecryptedUrls(urls);
    };
    loadPhotos();
  }, [isOpen, isUnlocked, currentProject, mode]);

  const handleRemovePhoto = useCallback(
    async (photoId: string) => {
      if (!currentProject) return;
      await db.photos.delete(photoId);
      const updated = photos.filter((p) => p.id !== photoId);
      setCurrentProjectPhotos(updated);
      setDecryptedUrls((prev) => {
        const next = new Map(prev);
        next.delete(photoId);
        return next;
      });
    },
    [currentProject, photos, setCurrentProjectPhotos],
  );

  const handleDownloadPhoto = useCallback(async (photoId: string) => {
    const stored = await db.photos.get(photoId);
    if (!stored) return;
    await savePhotoToDevice(decrypt(stored.dataUrl), `DispoCam-${photoId.slice(0, 8)}.jpg`);
  }, []);

  if (!isOpen) return null;

  // Still locked (development timer active)
  if (isLocked) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg/95 backdrop-blur-md">
        <div className="flex items-center justify-between p-4 pt-safe-6 border-b border-vintage-border/30">
          <h2 className="text-lg font-display text-vintage-text">
            {currentProject?.name ?? 'Rouleau'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-5xl mb-4">🔒</p>
          <p className="text-lg font-display text-vintage-text mb-2">
            Photos verrouillées
          </p>
          <p className="text-sm text-vintage-muted text-center mb-4">
            Temps restant avant développement :
          </p>
          <p className="text-xl font-display text-vintage-accent">
            {timeRemaining}
          </p>
          <p className="text-xs text-vintage-muted mt-6 text-center max-w-xs">
            Revenez à l&apos;heure du développement pour découvrir vos photos !
          </p>
        </div>
      </div>
    );
  }

  // Unlocked → show appropriate gallery
  if (mode === 'control') {
    return (
      <ControlGallery
        photos={photos.map((p) => ({ id: p.id, timestamp: p.timestamp }))}
        decryptedUrls={decryptedUrls}
        onClose={onClose}
        onRemovePhoto={handleRemovePhoto}
        onDownload={handleDownloadPhoto}
        projectName={currentProject?.name ?? 'Rouleau'}
        maxPoses={currentProject?.maxPoses ?? 0}
      />
    );
  }

  // Simple mode: blind print stack
  return (
    <SimpleGallery
      photos={photos.map((p) => ({ id: p.id, timestamp: p.timestamp }))}
      onClose={onClose}
      onRemovePhoto={handleRemovePhoto}
    />
  );
}