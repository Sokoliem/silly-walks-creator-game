import Matter from 'matter-js';
import { CreatureBody, WalkParameters } from '@/types/walk';
import { Level, TerrainElement } from '@/types/level';
import { AdvancedPhysicsEngine } from './advancedPhysics';

export class PhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;
  public render?: Matter.Render;
  public advancedPhysics: AdvancedPhysicsEngine;
  
  constructor() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.advancedPhysics = new AdvancedPhysicsEngine();
    
    // Configure physics world
    this.engine.world.gravity.y = 0.8;
    this.engine.world.gravity.x = 0;
  }
  
  setupRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
    this.render = Matter.Render.create({
      canvas: canvas,
      engine: this.engine,
      options: {
        width: width,
        height: height,
        pixelRatio: window.devicePixelRatio,
        background: 'transparent',
        wireframes: false,
        showAngleIndicator: false,
        showDebug: false,
        showVelocity: false
      }
    });
    
    Matter.Render.run(this.render);
  }
  
  createLevel(level: Level, width: number, height: number) {
    // Set up environmental effects
    if (level.environment) {
      this.advancedPhysics.setEnvironmentalEffects(level.environment);
    }

    // Create terrain elements
    level.terrain.forEach((element) => {
      // Try advanced terrain first, fall back to basic terrain
      const advancedTerrain = this.advancedPhysics.createAdvancedTerrain(element, this.world);
      if (!advancedTerrain) {
        this.createTerrainElement(element, height);
      }
    });

    // Create checkpoints if they exist
    if (level.checkpoints) {
      level.checkpoints.forEach((checkpoint) => {
        const checkpointBody = Matter.Bodies.rectangle(
          checkpoint.x + checkpoint.width / 2,
          checkpoint.y + checkpoint.height / 2,
          checkpoint.width,
          checkpoint.height,
          {
            isStatic: true,
            isSensor: true,
            render: {
              fillStyle: checkpoint.activated ? '#32CD32' : '#FFD700',
              strokeStyle: '#FFA500',
              lineWidth: 2
            }
          }
        );
        Matter.World.add(this.world, checkpointBody);
      });
    }

    // Create goal zone (visual indicator)
    const goalZone = Matter.Bodies.rectangle(
      level.goal.x + level.goal.width / 2,
      level.goal.y + level.goal.height / 2,
      level.goal.width,
      level.goal.height,
      {
        isStatic: true,
        isSensor: true, // Won't collide but can detect
        render: {
          fillStyle: '#00FF00',
          strokeStyle: '#00AA00',
          lineWidth: 3
        }
      }
    );

    Matter.World.add(this.world, goalZone);
    return goalZone;
  }

  private createTerrainElement(element: TerrainElement, canvasHeight: number) {
    let body;

    switch (element.type) {
      case 'platform':
        body = Matter.Bodies.rectangle(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          {
            isStatic: true,
            render: {
              fillStyle: element.color || '#8B4513'
            }
          }
        );
        break;

      case 'ramp':
        // Create angled rectangle for ramp
        body = Matter.Bodies.rectangle(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          {
            isStatic: true,
            render: {
              fillStyle: element.color || '#CD853F'
            }
          }
        );
        if (element.angle) {
          Matter.Body.setAngle(body, (element.angle * Math.PI) / 180);
        }
        break;

      case 'moving_platform':
        body = Matter.Bodies.rectangle(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          {
            isStatic: false, // Can move
            render: {
              fillStyle: element.color || '#DAA520'
            }
          }
        );
        // Add simple oscillating movement (can be enhanced later)
        break;

      default:
        return;
    }

    if (body) {
      Matter.World.add(this.world, body);
    }

    return body;
  }

  createGround(width: number, height: number) {
    const ground = Matter.Bodies.rectangle(
      width / 2, 
      height - 50, 
      width, 
      100, 
      { 
        isStatic: true,
        render: {
          fillStyle: '#8B4513'
        }
      }
    );
    
    Matter.World.add(this.world, ground);
    return ground;
  }
  
  createCreature(x: number, y: number): CreatureBody {
    // Body dimensions
    const torsoWidth = 20;
    const torsoHeight = 40;
    const limbWidth = 8;
    const thighLength = 30;
    const calfLength = 25;
    const armLength = 25;
    
    // Create body parts
    const torso = Matter.Bodies.rectangle(x, y, torsoWidth, torsoHeight, {
      density: 0.001,
      render: { fillStyle: '#FF6B35' }
    });
    
    const leftThigh = Matter.Bodies.rectangle(x - 10, y + 35, limbWidth, thighLength, {
      density: 0.0008,
      render: { fillStyle: '#4ECDC4' }
    });
    
    const leftCalf = Matter.Bodies.rectangle(x - 10, y + 60, limbWidth, calfLength, {
      density: 0.0006,
      render: { fillStyle: '#45B7D1' }
    });
    
    const rightThigh = Matter.Bodies.rectangle(x + 10, y + 35, limbWidth, thighLength, {
      density: 0.0008,
      render: { fillStyle: '#4ECDC4' }
    });
    
    const rightCalf = Matter.Bodies.rectangle(x + 10, y + 60, limbWidth, calfLength, {
      density: 0.0006,
      render: { fillStyle: '#45B7D1' }
    });
    
    const leftArm = Matter.Bodies.rectangle(x - 15, y - 5, limbWidth, armLength, {
      density: 0.0005,
      render: { fillStyle: '#96CEB4' }
    });
    
    const rightArm = Matter.Bodies.rectangle(x + 15, y - 5, limbWidth, armLength, {
      density: 0.0005,
      render: { fillStyle: '#96CEB4' }
    });
    
    // Create joints with motors
    const leftHip = Matter.Constraint.create({
      bodyA: torso,
      bodyB: leftThigh,
      pointA: { x: -5, y: torsoHeight / 2 },
      pointB: { x: 0, y: -thighLength / 2 },
      length: 0,
      stiffness: 0.8
    });
    
    const leftKnee = Matter.Constraint.create({
      bodyA: leftThigh,
      bodyB: leftCalf,
      pointA: { x: 0, y: thighLength / 2 },
      pointB: { x: 0, y: -calfLength / 2 },
      length: 0,
      stiffness: 0.8
    });
    
    const rightHip = Matter.Constraint.create({
      bodyA: torso,
      bodyB: rightThigh,
      pointA: { x: 5, y: torsoHeight / 2 },
      pointB: { x: 0, y: -thighLength / 2 },
      length: 0,
      stiffness: 0.8
    });
    
    const rightKnee = Matter.Constraint.create({
      bodyA: rightThigh,
      bodyB: rightCalf,
      pointA: { x: 0, y: thighLength / 2 },
      pointB: { x: 0, y: -calfLength / 2 },
      length: 0,
      stiffness: 0.8
    });
    
    const leftShoulder = Matter.Constraint.create({
      bodyA: torso,
      bodyB: leftArm,
      pointA: { x: -torsoWidth / 2, y: -10 },
      pointB: { x: 0, y: -armLength / 2 },
      length: 0,
      stiffness: 0.6
    });
    
    const rightShoulder = Matter.Constraint.create({
      bodyA: torso,
      bodyB: rightArm,
      pointA: { x: torsoWidth / 2, y: -10 },
      pointB: { x: 0, y: -armLength / 2 },
      length: 0,
      stiffness: 0.6
    });
    
    // Add all bodies and constraints to world
    const bodies = [torso, leftThigh, leftCalf, rightThigh, rightCalf, leftArm, rightArm];
    const constraints = [leftHip, leftKnee, rightHip, rightKnee, leftShoulder, rightShoulder];
    
    Matter.World.add(this.world, [...bodies, ...constraints]);
    
    return {
      torso,
      leftThigh,
      leftCalf,
      rightThigh,
      rightCalf,
      leftArm,
      rightArm,
      leftHip,
      leftKnee,
      rightHip,
      rightKnee,
      leftShoulder,
      rightShoulder
    };
  }
  
  updateCreatureWalk(creature: CreatureBody, params: WalkParameters, time: number) {
    const t = time / 1000; // Convert to seconds
    const cycleProgress = (t / params.stepInterval) % (2 * Math.PI);
    
    // Apply environmental effects
    this.advancedPhysics.applyEnvironmentalEffects(creature, 1/60);
    
    // Calculate target angles for joints based on sine waves
    const leftHipAngle = this.lerp(
      params.hipAngleRange[0],
      params.hipAngleRange[1],
      (Math.sin(cycleProgress * params.hipSpeed) + 1) / 2
    );
    
    const rightHipAngle = this.lerp(
      params.hipAngleRange[0],
      params.hipAngleRange[1],
      (Math.sin(cycleProgress * params.hipSpeed + params.hipPhaseOffset) + 1) / 2
    );
    
    const leftKneeAngle = this.lerp(
      params.kneeAngleRange[0],
      params.kneeAngleRange[1],
      (Math.sin(cycleProgress * params.kneeSpeed + params.kneePhaseOffset) + 1) / 2
    );
    
    const rightKneeAngle = this.lerp(
      params.kneeAngleRange[0],
      params.kneeAngleRange[1],
      (Math.sin(cycleProgress * params.kneeSpeed + params.kneePhaseOffset + params.hipPhaseOffset) + 1) / 2
    );
    
    // Apply torque to achieve target angles (simplified motor simulation)
    const torqueMultiplier = 0.02;
    
    const leftHipTorque = (this.degToRad(leftHipAngle) - creature.leftThigh.angle) * torqueMultiplier;
    const rightHipTorque = (this.degToRad(rightHipAngle) - creature.rightThigh.angle) * torqueMultiplier;
    const leftKneeTorque = (this.degToRad(leftKneeAngle) - creature.leftCalf.angle) * torqueMultiplier;
    const rightKneeTorque = (this.degToRad(rightKneeAngle) - creature.rightCalf.angle) * torqueMultiplier;
    
    // Apply torques
    Matter.Body.applyForce(creature.leftThigh, creature.leftThigh.position, { 
      x: -leftHipTorque * Math.sin(creature.leftThigh.angle), 
      y: leftHipTorque * Math.cos(creature.leftThigh.angle) 
    });
    
    Matter.Body.applyForce(creature.rightThigh, creature.rightThigh.position, { 
      x: -rightHipTorque * Math.sin(creature.rightThigh.angle), 
      y: rightHipTorque * Math.cos(creature.rightThigh.angle) 
    });
    
    Matter.Body.applyForce(creature.leftCalf, creature.leftCalf.position, { 
      x: -leftKneeTorque * Math.sin(creature.leftCalf.angle), 
      y: leftKneeTorque * Math.cos(creature.leftCalf.angle) 
    });
    
    Matter.Body.applyForce(creature.rightCalf, creature.rightCalf.position, { 
      x: -rightKneeTorque * Math.sin(creature.rightCalf.angle), 
      y: rightKneeTorque * Math.cos(creature.rightCalf.angle) 
    });
    
    // Add torso bounce
    if (params.bounceIntensity > 0) {
      const bounceForce = Math.sin(cycleProgress * 2) * params.bounceIntensity * 0.001;
      Matter.Body.applyForce(creature.torso, creature.torso.position, { x: 0, y: bounceForce });
    }
    
    // Add arm swing
    if (params.armSwing > 0) {
      const armSwingForce = Math.sin(cycleProgress + Math.PI) * params.armSwing * 0.001;
      Matter.Body.applyForce(creature.leftArm, creature.leftArm.position, { 
        x: armSwingForce, 
        y: 0 
      });
      Matter.Body.applyForce(creature.rightArm, creature.rightArm.position, { 
        x: -armSwingForce, 
        y: 0 
      });
    }
  }
  
  private lerp(min: number, max: number, t: number): number {
    return min + (max - min) * t;
  }
  
  private degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  step() {
    Matter.Engine.update(this.engine, 16.666); // ~60fps
  }
  
  clear() {
    Matter.World.clear(this.world, false);
    if (this.render) {
      Matter.Render.stop(this.render);
    }
  }
  
  destroy() {
    this.clear();
    this.advancedPhysics.destroy();
    if (this.render) {
      this.render.canvas.remove();
    }
  }
}