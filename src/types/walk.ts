export interface WalkParameters {
  // Hip joint parameters
  hipSpeed: number;
  hipAngleRange: [number, number]; // [min, max] in degrees
  hipPhaseOffset: number; // phase difference between left and right hip
  
  // Knee joint parameters
  kneeSpeed: number;
  kneeAngleRange: [number, number]; // [min, max] in degrees
  kneePhaseOffset: number;
  
  // Timing parameters
  stepInterval: number; // seconds per step cycle
  
  // Style parameters
  bounceIntensity: number; // how much the torso bounces
  armSwing: number; // how much arms swing with walking
}

export const DEFAULT_WALK_PARAMETERS: WalkParameters = {
  hipSpeed: 3.0,
  hipAngleRange: [-30, 30],
  hipPhaseOffset: Math.PI, // opposite legs
  kneeSpeed: 4.0,
  kneeAngleRange: [0, 60],
  kneePhaseOffset: Math.PI / 2,
  stepInterval: 1.0,
  bounceIntensity: 0.5,
  armSwing: 0.3
};

export interface CreatureBody {
  torso: Matter.Body;
  leftThigh: Matter.Body;
  leftCalf: Matter.Body;
  rightThigh: Matter.Body;
  rightCalf: Matter.Body;
  leftArm: Matter.Body;
  rightArm: Matter.Body;
  
  // Joints
  leftHip: Matter.Constraint;
  leftKnee: Matter.Constraint;
  rightHip: Matter.Constraint;
  rightKnee: Matter.Constraint;
  leftShoulder: Matter.Constraint;
  rightShoulder: Matter.Constraint;
}