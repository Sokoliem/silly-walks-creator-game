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
  },
  {
    id: 'slippery-slope',
    name: 'Slippery Slope',
    difficulty: 3,
    description: 'Navigate the icy terrain! Balance is everything on slippery surfaces.',
    parTime: 35,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 200, height: 50, type: 'platform' },
      { x: 200, y: 450, width: 300, height: 50, type: 'ice', friction: 0.1 },
      { x: 500, y: 400, width: 150, height: 50, type: 'platform' },
      { x: 650, y: 350, width: 200, height: 50, type: 'ice', friction: 0.1 }
    ],
    obstacles: [],
    environment: [
      { type: 'wind', intensity: 0.3, direction: 180 }
    ],
    goal: { x: 780, y: 250, width: 70, height: 100, minDistance: 800 }
  },
  {
    id: 'bounce-house',
    name: 'Bounce House',
    difficulty: 2,
    description: 'Use the trampolines to reach new heights! Time your bounces perfectly.',
    parTime: 40,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 150, height: 50, type: 'platform' },
      { x: 200, y: 400, width: 100, height: 30, type: 'trampoline', bounciness: 2.0 },
      { x: 400, y: 300, width: 100, height: 30, type: 'trampoline', bounciness: 1.8 },
      { x: 600, y: 200, width: 100, height: 30, type: 'trampoline', bounciness: 2.2 },
      { x: 800, y: 150, width: 200, height: 50, type: 'platform' }
    ],
    obstacles: [],
    goal: { x: 850, y: 50, width: 100, height: 100, minDistance: 900 }
  },
  {
    id: 'conveyor-chaos',
    name: 'Conveyor Chaos',
    difficulty: 3,
    description: 'Master the moving walkways! Some help, others hinder your progress.',
    parTime: 50,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 120, height: 50, type: 'platform' },
      { x: 150, y: 450, width: 200, height: 50, type: 'conveyor', speed: 2, direction: 0 },
      { x: 400, y: 400, width: 150, height: 50, type: 'conveyor', speed: -1.5, direction: 180 },
      { x: 600, y: 350, width: 200, height: 50, type: 'conveyor', speed: 3, direction: 45 },
      { x: 850, y: 300, width: 150, height: 50, type: 'platform' }
    ],
    obstacles: [
      { id: 'gap1', x: 350, y: 350, width: 50, height: 150, type: 'gap', dangerous: true },
      { id: 'gap2', x: 550, y: 250, width: 50, height: 150, type: 'gap', dangerous: true }
    ],
    environment: [
      { type: 'wind', intensity: 0.2, direction: 90 }
    ],
    goal: { x: 900, y: 200, width: 100, height: 100, minDistance: 1000 }
  },
  {
    id: 'storm-walker',
    name: 'Storm Walker',
    difficulty: 3,
    description: 'Brave the storm! Wind and rain will test your walking skills to the limit.',
    parTime: 60,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 200, height: 50, type: 'platform' },
      { x: 250, y: 400, width: 150, height: 50, type: 'ice', friction: 0.05 },
      { x: 450, y: 350, width: 100, height: 30, type: 'trampoline', bounciness: 1.5 },
      { x: 600, y: 400, width: 200, height: 50, type: 'conveyor', speed: -2, direction: 180 },
      { x: 850, y: 300, width: 150, height: 50, type: 'platform' }
    ],
    obstacles: [
      { id: 'wind-gap', x: 400, y: 250, width: 50, height: 150, type: 'gap', dangerous: true }
    ],
    environment: [
      { type: 'wind', intensity: 0.7, direction: 270 },
      { type: 'rain', intensity: 0.5 }
    ],
    goal: { x: 900, y: 200, width: 100, height: 100, minDistance: 1100 }
  },
  {
    id: 'pressure-puzzle',
    name: 'Pressure Puzzle',
    difficulty: 3,
    description: 'Step on all pressure plates to unlock the path. Strategy meets silly walking!',
    parTime: 45,
    unlocked: false,
    terrain: [
      { x: 0, y: 450, width: 150, height: 50, type: 'platform' },
      { x: 200, y: 400, width: 80, height: 20, type: 'pressure_plate', activationForce: 0.3 },
      { x: 350, y: 350, width: 100, height: 50, type: 'platform' },
      { x: 500, y: 300, width: 80, height: 20, type: 'pressure_plate', activationForce: 0.4 },
      { x: 650, y: 400, width: 80, height: 20, type: 'pressure_plate', activationForce: 0.5 },
      { x: 800, y: 350, width: 200, height: 50, type: 'platform' }
    ],
    obstacles: [],
    checkpoints: [
      { id: 'checkpoint1', x: 400, y: 320, width: 50, height: 30, activated: false },
      { id: 'checkpoint2', x: 700, y: 370, width: 50, height: 30, activated: false }
    ],
    goal: { x: 850, y: 250, width: 100, height: 100, minDistance: 950 }
  }
];