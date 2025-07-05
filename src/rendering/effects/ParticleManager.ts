export interface Particle {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
  size: number;
  material: string;
}

export interface ParticleEmitter {
  id: string;
  position: { x: number; y: number };
  rate: number; // particles per second
  lifetime: number;
  material: string;
  velocityRange: { min: { x: number; y: number }; max: { x: number; y: number } };
  sizeRange: { min: number; max: number };
  lifeRange: { min: number; max: number };
  active: boolean;
}

export class ParticleManager {
  private particles: Map<string, Particle> = new Map();
  private emitters: Map<string, ParticleEmitter> = new Map();
  private lastTime = 0;
  private particleIdCounter = 0;

  update(deltaTime: number) {
    this.lastTime += deltaTime;
    
    // Update existing particles
    for (const [id, particle] of this.particles) {
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.life -= deltaTime;
      
      // Add gravity to particles
      particle.velocity.y += 0.5 * deltaTime; // Gravity
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.delete(id);
      }
    }
    
    // Update emitters and spawn particles
    for (const emitter of this.emitters.values()) {
      if (emitter.active) {
        this.updateEmitter(emitter, deltaTime);
      }
    }
  }

  private updateEmitter(emitter: ParticleEmitter, deltaTime: number) {
    const particlesToSpawn = emitter.rate * deltaTime;
    
    for (let i = 0; i < Math.floor(particlesToSpawn); i++) {
      this.spawnParticle(emitter);
    }
    
    // Handle fractional particles
    if (Math.random() < (particlesToSpawn % 1)) {
      this.spawnParticle(emitter);
    }
  }

  private spawnParticle(emitter: ParticleEmitter) {
    const particle: Particle = {
      id: `particle_${this.particleIdCounter++}`,
      position: { ...emitter.position },
      velocity: {
        x: this.lerp(emitter.velocityRange.min.x, emitter.velocityRange.max.x, Math.random()),
        y: this.lerp(emitter.velocityRange.min.y, emitter.velocityRange.max.y, Math.random())
      },
      size: this.lerp(emitter.sizeRange.min, emitter.sizeRange.max, Math.random()),
      life: this.lerp(emitter.lifeRange.min, emitter.lifeRange.max, Math.random()),
      maxLife: 0,
      material: emitter.material
    };
    
    particle.maxLife = particle.life;
    this.particles.set(particle.id, particle);
  }

  createEmitter(config: Omit<ParticleEmitter, 'id'>): string {
    const id = `emitter_${Date.now()}_${Math.random()}`;
    this.emitters.set(id, { ...config, id });
    return id;
  }

  // Preset emitter creators
  createDustEmitter(x: number, y: number): string {
    return this.createEmitter({
      position: { x, y },
      rate: 20,
      lifetime: 1.0,
      material: 'dust-particle',
      velocityRange: {
        min: { x: -50, y: -100 },
        max: { x: 50, y: -20 }
      },
      sizeRange: { min: 2, max: 6 },
      lifeRange: { min: 0.5, max: 1.5 },
      active: true
    });
  }

  createSweatEmitter(x: number, y: number): string {
    return this.createEmitter({
      position: { x, y },
      rate: 5,
      lifetime: 0.5,
      material: 'sweat-particle',
      velocityRange: {
        min: { x: -20, y: -30 },
        max: { x: 20, y: 10 }
      },
      sizeRange: { min: 1, max: 3 },
      lifeRange: { min: 0.3, max: 0.8 },
      active: true
    });
  }

  createImpactEmitter(x: number, y: number, intensity = 1.0): string {
    return this.createEmitter({
      position: { x, y },
      rate: 30 * intensity,
      lifetime: 0.3,
      material: 'dust-particle',
      velocityRange: {
        min: { x: -80 * intensity, y: -120 * intensity },
        max: { x: 80 * intensity, y: -20 * intensity }
      },
      sizeRange: { min: 3 * intensity, max: 8 * intensity },
      lifeRange: { min: 0.2, max: 1.0 },
      active: true
    });
  }

  updateEmitterPosition(id: string, x: number, y: number) {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.position.x = x;
      emitter.position.y = y;
    }
  }

  setEmitterActive(id: string, active: boolean) {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.active = active;
    }
  }

  removeEmitter(id: string) {
    this.emitters.delete(id);
  }

  getParticles(): Particle[] {
    return Array.from(this.particles.values());
  }

  getParticleCount(): number {
    return this.particles.size;
  }

  clear() {
    this.particles.clear();
    this.emitters.clear();
  }

  private lerp(min: number, max: number, t: number): number {
    return min + (max - min) * t;
  }
}