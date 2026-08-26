import { useColorProfile } from '../../hooks/useColorProfile';
import type { ColorProfile } from '../../types';

interface RollSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RollSelector({ isOpen, onClose }: RollSelectorProps) {
  const { currentProfile, allProfiles, setProfile } = useColorProfile();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg/95 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6 border-b border-vintage-border/30">
        <h2 className="text-lg font-display text-vintage-text">Choisir un film</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Liste des profils */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {allProfiles.map((profile) => {
          const isSelected = profile.id === currentProfile?.id;
          return (
            <button
              key={profile.id}
              onClick={() => {
                setProfile(profile.id as ColorProfile);
                onClose();
              }}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                ${isSelected
                  ? 'border-vintage-accent bg-vintage-accent/10'
                  : 'border-vintage-border/30 bg-vintage-surface/30 hover:border-vintage-border/60'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{profile.emoji}</span>
                <div>
                  <p className="font-display text-vintage-text text-base">
                    {profile.label}
                  </p>
                  <p className="text-xs text-vintage-muted mt-0.5">
                    {profile.description}
                  </p>
                </div>
                {isSelected && (
                  <span className="ml-auto text-vintage-accent text-lg">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-vintage-border/30">
        <p className="text-xs text-vintage-muted text-center font-mono">
          Le filtre est appliqué à la prise de vue, pas d'aperçu avant développement.
        </p>
      </div>
    </div>
  );
}