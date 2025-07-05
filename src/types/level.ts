export interface TerrainElement {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'platform' | 'ramp' | 'moving_platform';
  angle?: number; // for ramps
  speed?: number; // for moving platforms
  color?: string;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'gap' | 'wall' | 'moving_block';
  dangerous: boolean;
  speed?: number;
  range?: number;
}

export interface GoalZone {
  x: number;
  y: number;
  width: number;
  height: number;
  minDistance: number; // minimum distance creature must travel
}

export interface Level {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3;
  terrain: TerrainElement[];
  obstacles: Obstacle[];
  goal: GoalZone;
  parTime: number; // target completion time in seconds
  description: string;
  unlocked: boolean;
}
