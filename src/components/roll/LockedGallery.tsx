import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useLockTimer } from '../../hooks/useLockTimer';
import { db } from '../../lib/db';
import { decrypt } from '../../lib/crypto';
import { savePhotoToDevice } from '../../lib/saveToDevice';

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
  onSave,
  onTrash,
}: {
  index: number;
  total: number;
  photoId: string;
  timestamp: number;
  onSave: (id: string) => void;
  onTrash: (id: string) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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
        setIsSaved(true);
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
          : isSaved
            ? 'border-vintage-accent/30 bg-vintage-accent/5'
            : 'border-vintage-border/30 bg-vintage-surface/20 hover:border-vintage-border/50'
      }`}
    >
      <div
        className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors ${
          isSaved
            ? 'bg-vintage-accent/20 text-vintage-accent'
            : isTrashing
              ? 'bg-red-500/10 text-red-400'
              : 'bg-vintage-surface/50 text-vintage-muted'
        }`}
      >
        {isSaved ? '✅' : isTrashing ? '🗑️' : '🖼️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display text-vintage-text">
          Photo {index + 1} / {total}
        </p>
        <p className="text-[11px] font-mono text-vintage-muted">
          {dateStr} · {timeStr}
        </p>
        {isSaved && (
          <p className="text-[10px] font-mono text-vintage-accent mt-0.5">
            Enregistrée dans vos photos ✓
          </p>
        )}
        {saveError && (
          <p className="text-[10px] font-mono text-red-400 mt-0.5">{saveError}</p>
        )}
      </div>
      {!isSaved && !isTrashing && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-vintage-accent/20 border border-vintage-accent/40 text-vintage-accent text-xs font-mono hover:bg-vintage-accent/30 disabled:opacity-50 transition-all"
          >
            {isSaving ? '⏳' : '💾 Sauvegarder'}
          </button>
          <button
            onClick={handleTrash}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono hover:bg-red-500/20 transition-all"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
/** Grid view for "control" mode — photos are directly visible. */
function ControlGallery({
  photos,
  decryptedUrls,
  onClose,
  projectName,
  maxPoses,
}: {
  photos: { id: string; timestamp: number }[];
  decryptedUrls: Map<string, string>;
  onClose: () => void;
  projectName: string;
  maxPoses: number;
}) {
  return (
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
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => {
              const url = decryptedUrls.get(photo.id);
              return (
                <div
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden bg-vintage-surface/50 border border-vintage-border/30"
                >
                  {url ? (
                    <img
                      src={url}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-vintage-muted/40">
                      🎞️
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
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
  const savedCount = savedIds.size;

  const handleSave = useCallback((id: string) => {
    setSavedIds((prev) => new Set(prev).add(id));
  }, []);

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
          <span className="text-vintage-accent">Sauvegardez-les</span> dans votre pellicule pour les voir,
          ou <span className="text-red-400">jetez</span> celles que vous n&apos;aimez pas.
        </p>
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
    },
    [currentProject, photos, setCurrentProjectPhotos],
  );

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