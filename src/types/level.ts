export interface TerrainElement {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'platform' | 'ramp' | 'moving_platform' | 'ice' | 'trampoline' | 'conveyor' | 'pressure_plate';
  angle?: number; // for ramps
  speed?: number; // for moving platforms and conveyors
  direction?: number; // conveyor direction in degrees
  bounciness?: number; // trampoline bounce factor
  friction?: number; // surface friction (ice = low, regular = normal)
  activationForce?: number; // force needed to activate pressure plates
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

export interface EnvironmentalEffect {
  type: 'wind' | 'rain' | 'snow';
  intensity: number; // 0-1
  direction?: number; // wind direction in degrees
  duration?: number; // effect duration in seconds (0 = permanent)
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
}

export interface Level {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3;
  terrain: TerrainElement[];
  obstacles: Obstacle[];
  goal: GoalZone;
  checkpoints?: Checkpoint[]; // for multi-stage levels
  environment?: EnvironmentalEffect[]; // weather and environmental effects
  parTime: number; // target completion time in seconds
  description: string;
  unlocked: boolean;
}
