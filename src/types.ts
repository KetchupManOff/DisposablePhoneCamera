export type ColorProfile = 'kodak-gold' | 'fuji-superia' | 'bw-tri-x' | 'polaroid';

export type AspectRatio = '1:1' | '3:2' | '4:3' | '16:9';

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
  colorProfile: ColorProfile;
  aspectRatio: AspectRatio;
  maxPoses: number;
  photos: CapturedPhoto[];
  /** Date limite pour prendre des photos (timestamp ms) */
  takingDeadline: number | null;
  /** Date de déverrouillage / développement (timestamp ms) */
  unlockAt: number | null;
  createdAt: number;
  isUnlocked: boolean;
}