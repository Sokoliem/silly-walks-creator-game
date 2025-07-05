import { CreatureBody } from '@/types/walk';
import { RenderObject } from '../core/WebGLRenderer';

export interface AnimationFrame {
  spriteId: string;
  duration: number;
  offset: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
}

export interface Animation {
  id: string;
  frames: AnimationFrame[];
  loop: boolean;
  duration: number;
}

export class SpriteAnimator {
  private animations: Map<string, Animation> = new Map();
  private activeAnimations: Map<string, {
    animation: Animation;
    startTime: number;
    currentFrame: number;
  }> = new Map();
  private lastUpdateTime = 0;

  constructor() {
    this.createDefaultAnimations();
  }

  private createDefaultAnimations() {
    // Walking animation for creature parts
    this.createAnimation('creature-walk', {
      frames: [
        { spriteId: 'creature-torso', duration: 0.25, offset: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
        { spriteId: 'creature-torso', duration: 0.25, offset: { x: 0, y: -2 }, rotation: 0.1, scale: { x: 1, y: 1.05 } },
        { spriteId: 'creature-torso', duration: 0.25, offset: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
        { spriteId: 'creature-torso', duration: 0.25, offset: { x: 0, y: -2 }, rotation: -0.1, scale: { x: 1, y: 1.05 } }
      ],
      loop: true,
      duration: 1.0
    });

    // Idle breathing animation
    this.createAnimation('creature-idle', {
      frames: [
        { spriteId: 'creature-torso', duration: 1.0, offset: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
        { spriteId: 'creature-torso', duration: 1.0, offset: { x: 0, y: -1 }, rotation: 0, scale: { x: 1, y: 1.02 } }
      ],
      loop: true,
      duration: 2.0
    });

    // Impact animation for when creature hits ground
    this.createAnimation('creature-impact', {
      frames: [
        { spriteId: 'creature-torso', duration: 0.1, offset: { x: 0, y: 2 }, rotation: 0, scale: { x: 1.1, y: 0.9 } },
        { spriteId: 'creature-torso', duration: 0.1, offset: { x: 0, y: 1 }, rotation: 0, scale: { x: 1.05, y: 0.95 } },
        { spriteId: 'creature-torso', duration: 0.1, offset: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } }
      ],
      loop: false,
      duration: 0.3
    });
  }

  createAnimation(id: string, config: {
    frames: (Omit<AnimationFrame, 'spriteId'> & { spriteId?: string })[];
    loop: boolean;
    duration: number;
  }) {
    const frames: AnimationFrame[] = config.frames.map(frame => ({
      spriteId: frame.spriteId || 'default',
      duration: frame.duration,
      offset: frame.offset,
      rotation: frame.rotation,
      scale: frame.scale
    }));

    this.animations.set(id, {
      id,
      frames,
      loop: config.loop,
      duration: config.duration
    });
  }

  startAnimation(objectId: string, animationId: string) {
    const animation = this.animations.get(animationId);
    if (animation) {
      this.activeAnimations.set(objectId, {
        animation,
        startTime: Date.now(),
        currentFrame: 0
      });
    }
  }

  stopAnimation(objectId: string) {
    this.activeAnimations.delete(objectId);
  }

  updateAnimations(renderObjects: Map<string, RenderObject>) {
    const currentTime = Date.now();

    // Performance: Only update animations every few frames
    if (currentTime - (this.lastUpdateTime || 0) < 16) { // ~60fps max
      return;
    }
    this.lastUpdateTime = currentTime;

    for (const [objectId, animData] of this.activeAnimations) {
      const elapsed = (currentTime - animData.startTime) / 1000;
      const animation = animData.animation;

      if (!animation.loop && elapsed >= animation.duration) {
        this.activeAnimations.delete(objectId);
        continue;
      }

      // Calculate current frame (simplified for performance)
      const normalizedTime = animation.loop ? elapsed % animation.duration : elapsed;
      const frameIndex = Math.floor((normalizedTime / animation.duration) * animation.frames.length);
      const currentFrame = Math.min(frameIndex, animation.frames.length - 1);

      // Update render object with animation frame (no interpolation for performance)
      const renderObject = renderObjects.get(objectId);
      if (renderObject) {
        const frame = animation.frames[currentFrame];

        // Store base transform if not exists
        if (!renderObject.baseTransform) {
          renderObject.baseTransform = {
            position: { x: renderObject.position.x, y: renderObject.position.y },
            rotation: renderObject.rotation,
            scale: { x: renderObject.scale.x, y: renderObject.scale.y }
          };
        }

        // Apply animation offset to base transform (simplified)
        renderObject.position.x = renderObject.baseTransform.position.x + frame.offset.x;
        renderObject.position.y = renderObject.baseTransform.position.y + frame.offset.y;
        renderObject.rotation = renderObject.baseTransform.rotation + frame.rotation;
        renderObject.scale.x = renderObject.baseTransform.scale.x * frame.scale.x;
        renderObject.scale.y = renderObject.baseTransform.scale.y * frame.scale.y;
      }

      animData.currentFrame = currentFrame;
    }
  }

  // Convert Matter.js creature to render objects with proper animation
  convertCreatureToRenderObjects(creature: CreatureBody, baseId: string): RenderObject[] {
    const objects: RenderObject[] = [];

    // Torso
    objects.push({
      id: `${baseId}_torso`,
      position: { x: creature.torso.position.x, y: creature.torso.position.y },
      rotation: creature.torso.angle,
      scale: { x: 20, y: 40 },
      material: 'creature-torso',
      layer: 1,
      visible: true
    });

    // Left leg
    objects.push({
      id: `${baseId}_left_thigh`,
      position: { x: creature.leftThigh.position.x, y: creature.leftThigh.position.y },
      rotation: creature.leftThigh.angle,
      scale: { x: 8, y: 30 },
      material: 'creature-limb',
      layer: 0,
      visible: true
    });

    objects.push({
      id: `${baseId}_left_calf`,
      position: { x: creature.leftCalf.position.x, y: creature.leftCalf.position.y },
      rotation: creature.leftCalf.angle,
      scale: { x: 8, y: 25 },
      material: 'creature-limb',
      layer: 0,
      visible: true
    });

    // Right leg
    objects.push({
      id: `${baseId}_right_thigh`,
      position: { x: creature.rightThigh.position.x, y: creature.rightThigh.position.y },
      rotation: creature.rightThigh.angle,
      scale: { x: 8, y: 30 },
      material: 'creature-limb',
      layer: 0,
      visible: true
    });

    objects.push({
      id: `${baseId}_right_calf`,
      position: { x: creature.rightCalf.position.x, y: creature.rightCalf.position.y },
      rotation: creature.rightCalf.angle,
      scale: { x: 8, y: 25 },
      material: 'creature-limb',
      layer: 0,
      visible: true
    });

    // Arms
    objects.push({
      id: `${baseId}_left_arm`,
      position: { x: creature.leftArm.position.x, y: creature.leftArm.position.y },
      rotation: creature.leftArm.angle,
      scale: { x: 8, y: 25 },
      material: 'creature-limb',
      layer: 0,
      visible: true
    });

    objects.push({
      id: `${baseId}_right_arm`,
      position: { x: creature.rightArm.position.x, y: creature.rightArm.position.y },
      rotation: creature.rightArm.angle,
      scale: { x: 8, y: 25 },
      material: 'creature-limb',
      layer: 0,
      visible: true
    });

    return objects;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
  }

  getActiveAnimations(): string[] {
    return Array.from(this.activeAnimations.keys());
  }

  isAnimationActive(objectId: string): boolean {
    return this.activeAnimations.has(objectId);
  }
}