export type ColorProfile =
  | 'kodak-gold'
  | 'kodak-ultramax'
  | 'fuji-superia'
  | 'lomo-400'
  | 'lomo-lady-grey'
  | 'bw-tri-x'
  | 'bw-hp5'
  | 'bw-xp2'
  | 'agfa-vista'
  | 'polaroid'
  | 'instax-mini'
  | 'instax-wide';

export type AspectRatio = '1:1' | '3:2' | '4:3' | '16:9';

export type Orientation = 'portrait' | 'landscape';

/** Mode simple : caméra simulée (LUT + ratio imposés) · Mode control : réglages libres */
export type ProjectMode = 'simple' | 'control';

export interface CapturedPhoto {
  id: string;
  profile: ColorProfile;
  timestamp: number;
  /** Blob chiffré (simulation — stocké en clair dans cette V1) */
  blob: Blob;
  thumbnail?: string;
}

export interface Project {
  id: string;
  name: string;
  mode: ProjectMode;
  /** Id de la caméra simulée (mode simple uniquement, null en mode control) */
  cameraId: string | null;
  colorProfile: ColorProfile;
  aspectRatio: AspectRatio;
  orientation: Orientation;
  maxPoses: number;
  photos: CapturedPhoto[];
  /** Date limite pour prendre des photos (timestamp ms) */
  takingDeadline: number | null;
  /** Date de déverrouillage / développement (timestamp ms) */
  unlockAt: number | null;
  createdAt: number;
  isUnlocked: boolean;
}