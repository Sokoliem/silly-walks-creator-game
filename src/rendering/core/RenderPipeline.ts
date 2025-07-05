import { WebGLRenderer, RenderObject } from './WebGLRenderer';
import { ParticleManager } from '../effects/ParticleManager';
import { SpriteAnimator } from '../animation/SpriteAnimator';
import { MaterialSystem } from './MaterialSystem';
import { CreatureBody } from '@/types/walk';

export class RenderPipeline {
  private renderer: WebGLRenderer;
  private particleManager: ParticleManager;
  private spriteAnimator: SpriteAnimator;
  private materialSystem: MaterialSystem;
  private lastFrameTime = 0;
  private isRunning = false;
  private animationFrameId?: number;

  constructor(canvas: HTMLCanvasElement) {
    console.log('Initializing RenderPipeline...');
    try {
      this.renderer = new WebGLRenderer(canvas);
      console.log('WebGLRenderer created successfully');
      
      this.particleManager = new ParticleManager();
      console.log('ParticleManager created successfully');
      
      this.spriteAnimator = new SpriteAnimator();
      console.log('SpriteAnimator created successfully');
      
      this.materialSystem = this.renderer.getMaterialSystem();
      console.log('MaterialSystem accessed successfully');
      
      console.log('RenderPipeline initialization complete');
    } catch (error) {
      console.error('Failed to initialize RenderPipeline:', error);
      throw error;
    }
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.renderLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private renderLoop = () => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // Update systems
    this.update(deltaTime);
    
    // Render frame
    this.render();

    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  private update(deltaTime: number) {
    // Update particles
    this.particleManager.update(deltaTime);
    
    // Update animations
    const renderObjects = this.renderer.getRenderObjects();
    this.spriteAnimator.updateAnimations(renderObjects);
  }

  private render() {
    // Render main scene
    this.renderer.render();
    
    // Render particles
    this.renderParticles();
  }

  private renderParticles() {
    const particles = this.particleManager.getParticles();
    
    for (const particle of particles) {
      const renderObject: RenderObject = {
        id: particle.id,
        position: particle.position,
        rotation: 0,
        scale: { x: particle.size, y: particle.size },
        material: particle.material,
        layer: 10, // Particles on top
        visible: true
      };
      
      this.renderer.addRenderObject(renderObject);
    }
  }

  // Creature management
  addCreature(creature: CreatureBody, id = 'creature') {
    const renderObjects = this.spriteAnimator.convertCreatureToRenderObjects(creature, id);
    
    for (const obj of renderObjects) {
      this.renderer.addRenderObject(obj);
    }
    
    // Start idle animation
    this.spriteAnimator.startAnimation(`${id}_torso`, 'creature-idle');
  }

  updateCreature(creature: CreatureBody, id = 'creature') {
    const renderObjects = this.spriteAnimator.convertCreatureToRenderObjects(creature, id);
    
    for (const obj of renderObjects) {
      this.renderer.updateRenderObject(obj.id, {
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale
      });
    }
  }

  removeCreature(id = 'creature') {
    const parts = ['torso', 'left_thigh', 'left_calf', 'right_thigh', 'right_calf', 'left_arm', 'right_arm'];
    
    for (const part of parts) {
      this.renderer.removeRenderObject(`${id}_${part}`);
      this.spriteAnimator.stopAnimation(`${id}_${part}`);
    }
  }

  // Animation control
  playCreatureAnimation(animationId: string, creatureId = 'creature') {
    this.spriteAnimator.startAnimation(`${creatureId}_torso`, animationId);
  }

  // Particle effects with audio
  createFootstepEffect(x: number, y: number) {
    this.particleManager.createDustEmitter(x, y);
    
    // Play footstep sound with slight delay for realism
    setTimeout(() => {
      import('@/lib/audio').then(({ audioManager }) => {
        audioManager.playFootstep();
      });
    }, 50);
  }

  createSweatEffect(x: number, y: number) {
    this.particleManager.createSweatEmitter(x, y);
  }

  createImpactEffect(x: number, y: number, intensity = 1.0) {
    this.particleManager.createImpactEmitter(x, y, intensity);
    
    // Play landing sound based on impact intensity
    import('@/lib/audio').then(({ audioManager }) => {
      audioManager.playLanding(intensity);
    });
  }

  // Terrain rendering
  addTerrain(x: number, y: number, width: number, height: number, type = 'ground') {
    const terrainObject: RenderObject = {
      id: `terrain_${Date.now()}_${Math.random()}`,
      position: { x: x + width / 2, y: y + height / 2 },
      rotation: 0,
      scale: { x: width, y: height },
      material: type,
      layer: -1, // Behind everything
      visible: true
    };
    
    this.renderer.addRenderObject(terrainObject);
    return terrainObject.id;
  }

  // Camera control
  setCamera(x: number, y: number, zoom = 1.0) {
    this.renderer.setCamera(x, y, zoom);
  }

  followCreature(creature: CreatureBody, smoothing = 0.1) {
    const targetX = creature.torso.position.x;
    const targetY = creature.torso.position.y - 50; // Offset camera up a bit
    
    // Simple camera following with smoothing
    const currentCamera = this.renderer.getCamera();
    const newX = currentCamera.x + (targetX - currentCamera.x) * smoothing;
    const newY = currentCamera.y + (targetY - currentCamera.y) * smoothing;
    
    this.setCamera(newX, newY, currentCamera.zoom);
  }

  // Utility methods
  resize(width: number, height: number) {
    this.renderer.resize(width, height);
  }

  getParticleCount(): number {
    return this.particleManager.getParticleCount();
  }

  clear() {
    this.particleManager.clear();
    // Clear all render objects except terrain
    this.renderer.clearRenderObjects((layer) => layer >= 0); // Keep terrain (layer -1)
  }

  destroy() {
    this.stop();
    this.renderer.destroy();
    this.particleManager.clear();
  }
}