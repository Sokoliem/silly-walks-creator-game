import Matter from 'matter-js';
import { CreatureBody } from '@/types/walk';
import { TerrainElement, EnvironmentalEffect } from '@/types/level';

export interface TerrainProperties {
  friction: number;
  restitution: number;
  density: number;
  special?: 'ice' | 'trampoline' | 'conveyor' | 'pressure_plate';
  specialData?: any;
}

export class AdvancedPhysicsEngine {
  private environmentalEffects: EnvironmentalEffect[] = [];
  private terrainBodies: Map<string, { body: Matter.Body; properties: TerrainProperties }> = new Map();
  private activePressurePlates: Set<string> = new Set();

  // Environmental effect processing
  setEnvironmentalEffects(effects: EnvironmentalEffect[]) {
    this.environmentalEffects = effects;
  }

  applyEnvironmentalEffects(creature: CreatureBody, deltaTime: number) {
    for (const effect of this.environmentalEffects) {
      switch (effect.type) {
        case 'wind':
          this.applyWindForce(creature, effect);
          break;
        case 'rain':
          this.applyRainEffect(creature, effect);
          break;
        case 'snow':
          this.applySnowEffect(creature, effect);
          break;
      }
    }
  }

  private applyWindForce(creature: CreatureBody, effect: EnvironmentalEffect) {
    const windDirection = (effect.direction || 0) * Math.PI / 180;
    const windForce = effect.intensity * 0.001;
    
    const windX = Math.cos(windDirection) * windForce;
    const windY = Math.sin(windDirection) * windForce;

    // Apply wind to all body parts
    const bodies = [
      creature.torso, 
      creature.leftThigh, 
      creature.leftCalf, 
      creature.rightThigh, 
      creature.rightCalf,
      creature.leftArm,
      creature.rightArm
    ];

    bodies.forEach(body => {
      Matter.Body.applyForce(body, body.position, { x: windX, y: windY });
    });
  }

  private applyRainEffect(creature: CreatureBody, effect: EnvironmentalEffect) {
    // Rain reduces overall friction and adds slight downward force
    const rainForce = effect.intensity * 0.0005;
    
    const bodies = [creature.torso, creature.leftThigh, creature.leftCalf, creature.rightThigh, creature.rightCalf];
    bodies.forEach(body => {
      Matter.Body.applyForce(body, body.position, { x: 0, y: rainForce });
    });
  }

  private applySnowEffect(creature: CreatureBody, effect: EnvironmentalEffect) {
    // Snow increases air resistance and adds weight
    const snowDrag = effect.intensity * 0.98;
    
    const bodies = [creature.torso, creature.leftThigh, creature.leftCalf, creature.rightThigh, creature.rightCalf];
    bodies.forEach(body => {
      // Apply drag force opposing velocity
      const velocity = body.velocity;
      const dragX = -velocity.x * snowDrag * 0.001;
      const dragY = -velocity.y * snowDrag * 0.001;
      
      Matter.Body.applyForce(body, body.position, { x: dragX, y: dragY });
    });
  }

  // Advanced terrain creation
  createAdvancedTerrain(element: TerrainElement, world: Matter.World): Matter.Body | null {
    let body: Matter.Body;
    let properties: TerrainProperties;

    switch (element.type) {
      case 'ice':
        body = Matter.Bodies.rectangle(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          { isStatic: true }
        );
        properties = {
          friction: 0.1, // Very low friction
          restitution: 0.1,
          density: 1,
          special: 'ice'
        };
        // Visual: light blue with transparency
        body.render.fillStyle = '#87CEEB';
        body.render.strokeStyle = '#4682B4';
        body.render.lineWidth = 2;
        break;

      case 'trampoline':
        body = Matter.Bodies.rectangle(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          { isStatic: true }
        );
        properties = {
          friction: 0.8,
          restitution: element.bounciness || 1.5, // High bounce
          density: 1,
          special: 'trampoline',
          specialData: { bounciness: element.bounciness || 1.5 }
        };
        // Visual: bright green with pattern
        body.render.fillStyle = '#32CD32';
        body.render.strokeStyle = '#228B22';
        body.render.lineWidth = 3;
        break;

      case 'conveyor':
        body = Matter.Bodies.rectangle(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          { isStatic: true }
        );
        properties = {
          friction: 0.9,
          restitution: 0.3,
          density: 1,
          special: 'conveyor',
          specialData: { 
            speed: element.speed || 2,
            direction: element.direction || 0 
          }
        };
        // Visual: orange with directional arrows
        body.render.fillStyle = '#FF8C00';
        body.render.strokeStyle = '#FF4500';
        body.render.lineWidth = 2;
        break;

      case 'pressure_plate':
        body = Matter.Bodies.rectangle(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          { isStatic: true, isSensor: true }
        );
        properties = {
          friction: 0.8,
          restitution: 0.3,
          density: 1,
          special: 'pressure_plate',
          specialData: { 
            activationForce: element.activationForce || 0.5,
            id: `pressure_${element.x}_${element.y}`
          }
        };
        // Visual: yellow, changes color when activated
        body.render.fillStyle = '#FFD700';
        body.render.strokeStyle = '#FFA500';
        body.render.lineWidth = 2;
        break;

      default:
        return null;
    }

    // Apply properties to Matter.js body
    body.friction = properties.friction;
    body.restitution = properties.restitution;
    body.density = properties.density;

    // Store terrain data
    const terrainId = `terrain_${element.x}_${element.y}_${Date.now()}`;
    this.terrainBodies.set(terrainId, { body, properties });

    Matter.World.add(world, body);
    return body;
  }

  // Handle terrain-specific collisions
  handleTerrainCollision(creature: CreatureBody, terrainId: string, collisionData: any) {
    const terrain = this.terrainBodies.get(terrainId);
    if (!terrain) return;

    const { properties } = terrain;

    switch (properties.special) {
      case 'conveyor':
        this.handleConveyorEffect(creature, properties.specialData);
        break;
      case 'pressure_plate':
        this.handlePressurePlateActivation(creature, properties.specialData, collisionData);
        break;
      case 'trampoline':
        this.handleTrampolineEffect(creature, properties.specialData, collisionData);
        break;
    }
  }

  private handleConveyorEffect(creature: CreatureBody, data: any) {
    const direction = data.direction * Math.PI / 180;
    const force = data.speed * 0.001;
    
    const forceX = Math.cos(direction) * force;
    const forceY = Math.sin(direction) * force;

    // Apply conveyor force to feet if they're in contact
    Matter.Body.applyForce(creature.leftCalf, creature.leftCalf.position, { x: forceX, y: forceY });
    Matter.Body.applyForce(creature.rightCalf, creature.rightCalf.position, { x: forceX, y: forceY });
  }

  private handlePressurePlateActivation(creature: CreatureBody, data: any, collisionData: any) {
    const plateId = data.id;
    const requiredForce = data.activationForce;
    
    // Calculate collision force (simplified)
    const contactForce = Math.abs(collisionData.normalImpulse || 0);
    
    if (contactForce > requiredForce) {
      if (!this.activePressurePlates.has(plateId)) {
        this.activePressurePlates.add(plateId);
        
        // Change visual appearance
        const terrain = Array.from(this.terrainBodies.values())
          .find(t => t.properties.specialData?.id === plateId);
        
        if (terrain) {
          terrain.body.render.fillStyle = '#FF6347'; // Activated color
          
          // Trigger pressure plate effect (could open doors, activate mechanisms, etc.)
          this.triggerPressurePlateEffect(plateId);
        }
      }
    }
  }

  private handleTrampolineEffect(creature: CreatureBody, data: any, collisionData: any) {
    const bounciness = data.bounciness;
    
    // Apply extra upward force on collision
    const bounceForce = bounciness * 0.002;
    Matter.Body.applyForce(creature.torso, creature.torso.position, { x: 0, y: -bounceForce });
    
    // Add some particle effects
    setTimeout(() => {
      import('@/lib/audio').then(({ audioManager }) => {
        audioManager.playJump?.();
      });
    }, 10);
  }

  private triggerPressurePlateEffect(plateId: string) {
    // Could trigger level events, unlock paths, etc.
    console.log(`Pressure plate ${plateId} activated!`);
    
    // Play activation sound
    import('@/lib/audio').then(({ audioManager }) => {
      audioManager.playSuccess?.();
    });
  }

  // Checkpoint system
  checkpointReached(checkpointId: string) {
    console.log(`Checkpoint ${checkpointId} reached!`);
    
    // Save game state, unlock next section, etc.
    // This would integrate with the game logic system
  }

  // Utility methods
  isOnSpecialTerrain(creature: CreatureBody, terrainType: string): boolean {
    // Check if creature is currently touching terrain of specified type
    // This would require collision detection integration
    return false; // Placeholder
  }

  getActiveEnvironmentalEffects(): EnvironmentalEffect[] {
    return this.environmentalEffects;
  }

  getActivePressurePlates(): Set<string> {
    return this.activePressurePlates;
  }

  resetPressurePlates() {
    this.activePressurePlates.clear();
    
    // Reset visual appearance of all pressure plates
    this.terrainBodies.forEach((terrain) => {
      if (terrain.properties.special === 'pressure_plate') {
        terrain.body.render.fillStyle = '#FFD700'; // Default color
      }
    });
  }

  destroy() {
    this.terrainBodies.clear();
    this.activePressurePlates.clear();
    this.environmentalEffects = [];
  }
}