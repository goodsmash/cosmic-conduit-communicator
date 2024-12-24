import * as THREE from 'three';
import { GalaxyPhysics } from './galaxyPhysics';

export interface InteractionParams {
  type: 'merger' | 'collision' | 'tidal' | 'stripping' | 'harassment';
  strength: number;
  duration: number;
  distance: number;
}

export class GalaxyInteractions {
  private galaxyA: GalaxyPhysics;
  private galaxyB: GalaxyPhysics | null;
  private params: InteractionParams;
  private time: number = 0;
  private interactionProgress: number = 0;
  private tidal: THREE.Vector3 = new THREE.Vector3();
  private ram: THREE.Vector3 = new THREE.Vector3();

  constructor(galaxyA: GalaxyPhysics, galaxyB: GalaxyPhysics | null, params: InteractionParams) {
    this.galaxyA = galaxyA;
    this.galaxyB = galaxyB;
    this.params = params;
  }

  public update(deltaTime: number) {
    this.time += deltaTime;
    this.interactionProgress = Math.min(this.time / this.params.duration, 1);

    switch (this.params.type) {
      case 'merger':
        this.updateMerger();
        break;
      case 'collision':
        this.updateCollision();
        break;
      case 'tidal':
        this.updateTidal();
        break;
      case 'stripping':
        this.updateStripping();
        break;
      case 'harassment':
        this.updateHarassment();
        break;
    }
  }

  private updateMerger() {
    if (!this.galaxyB) return;

    // Calculate merger trajectory
    const progress = this.interactionProgress;
    const strength = this.params.strength;

    // Interpolate between galaxies
    const posA = this.galaxyA.getPosition();
    const posB = this.galaxyB.getPosition();
    const direction = new THREE.Vector3().subVectors(posB, posA).normalize();

    // Apply gravitational effects
    this.galaxyA.applyForce(direction.multiplyScalar(strength * progress));
    this.galaxyB.applyForce(direction.multiplyScalar(-strength * progress));

    // Mix particle properties
    if (progress > 0.5) {
      this.galaxyA.mixParticles(this.galaxyB, progress - 0.5);
    }
  }

  private updateCollision() {
    // High-energy collision effects
    const strength = this.params.strength * (1 - this.interactionProgress);
    
    // Create shock waves
    const shockwave = Math.sin(this.time * 10) * strength;
    this.galaxyA.applyShockwave(shockwave);

    // Heat up particles
    this.galaxyA.increaseTemperature(strength * 0.1);

    // Scatter particles
    this.galaxyA.scatterParticles(strength);
  }

  private updateTidal() {
    if (!this.galaxyB) return;

    // Calculate tidal forces
    const posA = this.galaxyA.getPosition();
    const posB = this.galaxyB.getPosition();
    const distance = posA.distanceTo(posB);
    
    if (distance < this.params.distance) {
      // Calculate tidal acceleration
      this.tidal.subVectors(posB, posA).normalize();
      const tidalStrength = this.params.strength * (1 - distance / this.params.distance);
      
      // Apply tidal stretching
      this.galaxyA.applyTidalForce(this.tidal, tidalStrength);
    }
  }

  private updateStripping() {
    // Ram pressure stripping effects
    const strength = this.params.strength * (1 - this.interactionProgress);
    
    // Calculate ram pressure direction
    this.ram.set(1, 0, 0).applyQuaternion(this.galaxyA.getRotation());
    
    // Apply stripping forces
    this.galaxyA.applyRamPressure(this.ram, strength);
    
    // Remove outer particles
    if (Math.random() < strength * 0.1) {
      this.galaxyA.stripOuterParticles(strength);
    }
  }

  private updateHarassment() {
    // Multiple fast encounters
    const time = this.time * 5;
    const strength = this.params.strength;
    
    // Create periodic perturbations
    const perturbX = Math.sin(time) * strength;
    const perturbY = Math.cos(time * 1.3) * strength;
    const perturbZ = Math.sin(time * 0.7) * strength;
    
    // Apply harassment forces
    this.galaxyA.applyPerturbation(new THREE.Vector3(perturbX, perturbY, perturbZ));
  }

  public isComplete(): boolean {
    return this.interactionProgress >= 1;
  }

  public getProgress(): number {
    return this.interactionProgress;
  }
}
