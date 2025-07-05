import { Level } from '@/types/level';

export const LEVELS: Level[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    difficulty: 1,
    description: 'A gentle introduction to silly walking. Just reach the finish line!',
    parTime: 15,
    unlocked: true,
    terrain: [
      { x: 0, y: 450, width: 800, height: 50, type: 'platform' }
    ],
    obstacles: [],
    goal: { x: 650, y: 350, width: 80, height: 100, minDistance: 500 }
  },
  {
    id: 'the-gap',
    name: 'The Gap',
    difficulty: 1,
    description: 'Your first jumping challenge. Time those legs just right!',
    parTime: 20,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 250, height: 50, type: 'platform' },
      { x: 400, y: 450, width: 400, height: 50, type: 'platform' }
    ],
    obstacles: [
      { id: 'gap1', x: 250, y: 350, width: 150, height: 150, type: 'gap', dangerous: true }
    ],
    goal: { x: 650, y: 350, width: 80, height: 100, minDistance: 500 }
  },
  {
    id: 'uphill-battle',
    name: 'Uphill Battle',
    difficulty: 2,
    description: 'Climb the ramp with style. Momentum is your friend!',
    parTime: 25,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 200, height: 50, type: 'platform' },
      { x: 200, y: 350, width: 300, height: 20, type: 'ramp', angle: -15 },
      { x: 500, y: 250, width: 300, height: 50, type: 'platform' }
    ],
    obstacles: [],
    goal: { x: 650, y: 150, width: 80, height: 100, minDistance: 600 }
  },
  {
    id: 'platform-hopping',
    name: 'Platform Hopping',
    difficulty: 2,
    description: 'Leap from platform to platform. Precision walking required!',
    parTime: 30,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 120, height: 30, type: 'platform' },
      { x: 180, y: 380, width: 120, height: 30, type: 'platform' },
      { x: 360, y: 320, width: 120, height: 30, type: 'platform' },
      { x: 540, y: 380, width: 120, height: 30, type: 'platform' },
      { x: 720, y: 450, width: 120, height: 30, type: 'platform' }
    ],
    obstacles: [],
    goal: { x: 750, y: 350, width: 60, height: 100, minDistance: 700 }
  },
  {
    id: 'the-gauntlet',
    name: 'The Gauntlet',
    difficulty: 3,
    description: 'The ultimate test! Navigate all obstacles to prove your silly walk mastery.',
    parTime: 45,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 150, height: 50, type: 'platform' },
      { x: 250, y: 450, width: 100, height: 50, type: 'platform' },
      { x: 450, y: 350, width: 200, height: 20, type: 'ramp', angle: 10 },
      { x: 650, y: 400, width: 150, height: 50, type: 'platform' }
    ],
    obstacles: [
      { id: 'gap1', x: 150, y: 350, width: 100, height: 150, type: 'gap', dangerous: true },
      { id: 'spike1', x: 300, y: 430, width: 50, height: 20, type: 'spike', dangerous: true }
    ],
    goal: { x: 720, y: 300, width: 80, height: 100, minDistance: 800 }
  }
];