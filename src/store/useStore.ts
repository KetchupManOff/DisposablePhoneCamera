import { create } from 'zustand';
import type { ColorProfile, AspectRatio, Orientation, CapturedPhoto, Project } from '../types';
import { db } from '../lib/db';
import type { Lang } from '../i18n/translations';

interface AppState {
  /* --- Projets --- */
  projects: Project[];
  currentProjectId: string | null;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  setCurrentProjectId: (id: string | null) => void;

  /* --- Projet courant (dérivé) --- */
  currentProject: () => Project | null;

  /* --- Helpers pour accès rapide au projet courant --- */
  addPhotoToCurrentProject: (photo: CapturedPhoto) => void;
  setCurrentProjectPhotos: (photos: CapturedPhoto[]) => void;
  unlockCurrentProject: () => void;
  updateCurrentProjectTimer: (takingDeadline: number | null, unlockAt: number | null) => void;
  updateCurrentProjectSettings: (settings: { colorProfile?: ColorProfile; aspectRatio?: AspectRatio; orientation?: Orientation }) => void;

  /* --- UI --- */
  flashTrigger: number;
  triggerFlash: () => void;

  /* --- Langue --- */
  language: Lang;
  setLanguage: (language: Lang) => void;
}

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  currentProjectId: null,

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
      currentProjectId: project.id,
    })),

  removeProject: (projectId) =>
    set((state) => {
      const filtered = state.projects.filter((p) => p.id !== projectId);
      const newCurrentId =
        state.currentProjectId === projectId
          ? filtered.length > 0
            ? filtered[0].id
            : null
          : state.currentProjectId;
      return {
        projects: filtered,
        currentProjectId: newCurrentId,
      };
    }),

  setCurrentProjectId: (id) => {
    // Persister le projet actif
    if (id) {
      db.settings.put({ key: 'currentProjectId', value: id }).catch(() => {});
    }
    set({ currentProjectId: id });
  },

  currentProject: () => {
    const { projects, currentProjectId } = get();
    return projects.find((p) => p.id === currentProjectId) ?? null;
  },

  addPhotoToCurrentProject: (photo) =>
    set((state) => {
      const idx = state.projects.findIndex((p) => p.id === state.currentProjectId);
      if (idx === -1) return state;
      const updated = [...state.projects];
      updated[idx] = {
        ...updated[idx],
        photos: [...updated[idx].photos, photo],
      };
      return { projects: updated };
    }),

  setCurrentProjectPhotos: (photos) =>
    set((state) => {
      const idx = state.projects.findIndex((p) => p.id === state.currentProjectId);
      if (idx === -1) return state;
      const updated = [...state.projects];
      updated[idx] = { ...updated[idx], photos };
      return { projects: updated };
    }),

  unlockCurrentProject: () =>
    set((state) => {
      const idx = state.projects.findIndex((p) => p.id === state.currentProjectId);
      if (idx === -1) return state;
      const updated = [...state.projects];
      updated[idx] = { ...updated[idx], isUnlocked: true };
      // Persister le déverrouillage
      db.projects.update(state.currentProjectId!, { isUnlocked: true }).catch(() => {});
      return { projects: updated };
    }),

  updateCurrentProjectTimer: (takingDeadline, unlockAt) =>
    set((state) => {
      const idx = state.projects.findIndex((p) => p.id === state.currentProjectId);
      if (idx === -1) return state;
      const updated = [...state.projects];
      updated[idx] = {
        ...updated[idx],
        takingDeadline,
        unlockAt,
        isUnlocked: false,
      };
      // Persister
      db.projects.update(state.currentProjectId!, {
        takingDeadline: takingDeadline ?? undefined,
        unlockAt: unlockAt ?? undefined,
        isUnlocked: false,
      }).catch(() => {});
      return { projects: updated };
    }),

  updateCurrentProjectSettings: (settings) =>
    set((state) => {
      const idx = state.projects.findIndex((p) => p.id === state.currentProjectId);
      if (idx === -1) return state;
      const updated = [...state.projects];
      updated[idx] = { ...updated[idx], ...settings };
      // Persister
      if (settings.colorProfile || settings.aspectRatio || settings.orientation) {
        db.projects.update(state.currentProjectId!, {
          ...(settings.colorProfile && { colorProfile: settings.colorProfile }),
          ...(settings.aspectRatio && { aspectRatio: settings.aspectRatio }),
          ...(settings.orientation && { orientation: settings.orientation }),
        }).catch(() => {});
      }
      return { projects: updated };
    }),

  flashTrigger: 0,
  triggerFlash: () => set({ flashTrigger: Date.now() }),

  language: 'fr',
  setLanguage: (language) => {
    // Persister la langue choisie
    db.settings.put({ key: 'language', value: language }).catch(() => {});
    set({ language });
  },
}));