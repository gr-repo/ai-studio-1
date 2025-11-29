export enum ViewMode {
  COMPARISON = 'COMPARISON',
  TRUE_SCALE = 'TRUE_SCALE',
}

export interface VoxelData {
  position: [number, number, number];
  color: string;
}

export interface OrbitalStats {
  circumference: string;
  diameter: string;
  width: string;
  gravity: string;
}

export interface GeminiResponse {
  description: string;
  facts: string[];
}
