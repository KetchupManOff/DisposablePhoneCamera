import Dexie, { type EntityTable } from 'dexie';

export interface StoredPhoto {
  id: string;
  projectId: string;
  profile: string;
  timestamp: number;
  /** Stocké en base64 pour simplifier la persistance IndexedDB */
  dataUrl: string;
  thumbnail?: string;
}

export interface StoredProject {
  id: string;
  name: string;
  mode: string;
  cameraId: string | null;
  colorProfile: string;
  aspectRatio: string;
  orientation: string;
  maxPoses: number;
  takingDeadline: number | null;
  unlockAt: number | null;
  createdAt: number;
  isUnlocked: boolean;
}

const db = new Dexie('DisposablePhoneCameraDB') as Dexie & {
  photos: EntityTable<StoredPhoto, 'id'>;
  projects: EntityTable<StoredProject, 'id'>;
  settings: EntityTable<{ key: string; value: unknown }, 'key'>;
};

db.version(2).stores({
  photos: 'id, projectId, profile, timestamp',
  projects: 'id, createdAt',
  settings: 'key',
});

export { db };