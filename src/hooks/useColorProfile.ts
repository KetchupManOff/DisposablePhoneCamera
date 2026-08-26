import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PROFILES } from '../lib/colorProfiles';
import type { ProfileDefinition } from '../lib/colorProfiles';
import type { ColorProfile } from '../types';

interface UseColorProfileReturn {
  currentProfile: ProfileDefinition | null;
  allProfiles: ProfileDefinition[];
  setProfile: (id: ColorProfile) => void;
}

export function useColorProfile(): UseColorProfileReturn {
  const project = useStore((s) => s.currentProject());

  const currentProfile = useMemo(
    () => (project ? PROFILES[project.colorProfile] : null),
    [project?.colorProfile],
  );
  const allProfiles = useMemo(() => Object.values(PROFILES), []);

  return {
    currentProfile,
    allProfiles,
    setProfile: (id) => {
      // Le changement de profil se fait via updateCurrentProjectSetting
      // qui devra être ajouté au store ou géré autrement
      // Pour l'instant, ce hook ne gère pas le set (le CreateProject le fait)
    },
  };
}