import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useLockTimer } from '../../hooks/useLockTimer';
import { db } from '../../lib/db';
import { decrypt } from '../../lib/crypto';

interface LockedGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LockedGallery({ isOpen, onClose }: LockedGalleryProps) {
  const currentProject = useStore((s) => s.currentProject());
  const isUnlocked = currentProject?.isUnlocked ?? true;
  const { isLocked, timeRemaining } = useLockTimer();
  const [decryptedUrls, setDecryptedUrls] = useState<Map<string, string>>(new Map());

  const photos = currentProject?.photos ?? [];

  // Charger et déchiffrer les photos depuis IndexedDB
  useEffect(() => {
    if (!isOpen || !isUnlocked || !currentProject) return;

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
        } catch {
          // ignore les photos corrompues
        }
      }
      setDecryptedUrls(urls);
    };

    loadPhotos();
  }, [isOpen, isUnlocked, currentProject]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg/95 backdrop-blur-md">
      <div className="flex items-center justify-between p-4 pt-6 border-b border-vintage-border/30">
        <h2 className="text-lg font-display text-vintage-text">
          {currentProject?.name ?? 'Rouleau'} ({photos.length}/{currentProject?.maxPoses ?? '?'})
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text"
        >
          ✕
        </button>
      </div>

      {isLocked ? (
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
            Revenez à l'heure du développement pour découvrir vos photos !
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-5xl mb-4">🎞️</p>
          <p className="text-vintage-muted text-sm">Aucune photo pour le moment.</p>
          <p className="text-vintage-muted/60 text-xs mt-2">
            Prenez votre première photo !
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
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
        </div>
      )}
    </div>
  );
}