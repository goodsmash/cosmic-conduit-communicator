import * as THREE from 'three';

export interface GalaxyPhysicsParams {
  mass: number;          // Mass in solar masses
  size: number;          // Size in kiloparsecs
  rotationSpeed: number; // Angular velocity in radians per second
  dustDensity: number;   // Density of dust lanes (0-1)
  starFormationRate: number; // Rate of star formation (0-1)
  temperature: number;   // Temperature in Kelvin
}

export class GalaxyPhysics {
  private points: THREE.Points;
  private params: GalaxyPhysicsParams;
  private velocities: Float32Array;
  private accelerations: Float32Array;
  private temperatures: Float32Array;

  constructor(points: THREE.Points, params: GalaxyPhysicsParams) {
    this.points = points;
    this.params = { ...params };

    const positions = (points.geometry.getAttribute('position') as THREE.BufferAttribute).array;
    const particleCount = positions.length / 3;

    // Initialize physics arrays
    this.velocities = new Float32Array(particleCount * 3);
    this.accelerations = new Float32Array(particleCount * 3);
    this.temperatures = new Float32Array(particleCount);

    // Set initial velocities based on rotation
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const z = positions[i3 + 2];
      const r = Math.sqrt(x * x + z * z);
      
      // Circular orbit velocity (v = sqrt(GM/r))
      const v = Math.sqrt((6.67430e-11 * this.params.mass * 1.989e30) / (r * 3.086e19)) / 1000; // km/s
      
      // Convert to angular velocity
      const omega = v / r;
      
      // Set tangential velocities
      this.velocities[i3] = -z * omega;     // vx
      this.velocities[i3 + 1] = 0;          // vy
      this.velocities[i3 + 2] = x * omega;  // vz

      // Initialize temperatures based on distance from center
      this.temperatures[i] = this.params.temperature * (1 - r / this.params.size);
    }
  }

  public update(deltaTime: number) {
    const positions = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colors = this.points.geometry.getAttribute('color') as THREE.BufferAttribute;
    const posArray = positions.array as Float32Array;
    const colorArray = colors.array as Float32Array;
    
    const particleCount = posArray.length / 3;

    // Update positions and apply physics
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Update positions based on velocities
      posArray[i3] += this.velocities[i3] * deltaTime;
      posArray[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
      posArray[i3 + 2] += this.velocities[i3 + 2] * deltaTime;

      // Calculate gravitational acceleration
      const x = posArray[i3];
      const y = posArray[i3 + 1];
      const z = posArray[i3 + 2];
      const r = Math.sqrt(x * x + y * y + z * z);
      
      if (r > 0) {
        // a = GM/r^2
        const a = (6.67430e-11 * this.params.mass * 1.989e30) / (r * r * 3.086e19);
        
        // Update accelerations (pointing towards center)
        this.accelerations[i3] = -x / r * a;
        this.accelerations[i3 + 1] = -y / r * a;
        this.accelerations[i3 + 2] = -z / r * a;
        
        // Update velocities based on acceleration
        this.velocities[i3] += this.accelerations[i3] * deltaTime;
        this.velocities[i3 + 1] += this.accelerations[i3 + 1] * deltaTime;
        this.velocities[i3 + 2] += this.accelerations[i3 + 2] * deltaTime;
      }

      // Update temperature
      const cooling = deltaTime * 0.1; // Cooling rate
      const heating = this.params.starFormationRate * deltaTime; // Heating from star formation
      this.temperatures[i] = Math.max(0, this.temperatures[i] - cooling + heating);

      // Update colors based on temperature
      const temp = this.temperatures[i];
      const normalizedTemp = Math.min(temp / this.params.temperature, 1);
      
      // Color gradient from red (hot) to blue (cool)
      colorArray[i3] = normalizedTemp;          // Red
      colorArray[i3 + 1] = normalizedTemp * 0.6; // Green
      colorArray[i3 + 2] = 1 - normalizedTemp;   // Blue
    }

    // Mark attributes as needing update
    positions.needsUpdate = true;
    colors.needsUpdate = true;
  }

  public updateParams(params: Partial<GalaxyPhysicsParams>) {
    Object.assign(this.params, params);
  }

  public addDustLanes() {
    const positions = this.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colors = this.points.geometry.getAttribute('color') as THREE.BufferAttribute;
    const posArray = positions.array as Float32Array;
    const colorArray = colors.array as Float32Array;
    
    const particleCount = posArray.length / 3;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = posArray[i3];
      const z = posArray[i3 + 2];
      
      // Calculate angle in the x-z plane
      const angle = Math.atan2(z, x);
      
      // Create spiral pattern
      const r = Math.sqrt(x * x + z * z);
      const spiralPhase = (r / this.params.size * 4 + angle) % (Math.PI * 2);
      
      // Add dust lanes along spiral arms
      if (Math.abs(Math.sin(spiralPhase)) < this.params.dustDensity) {
        colorArray[i3] *= 0.3;     // Reduce red
        colorArray[i3 + 1] *= 0.3; // Reduce green
        colorArray[i3 + 2] *= 0.3; // Reduce blue
      }
    }

    colors.needsUpdate = true;
  }

  public updateTemperature(deltaTime: number) {
    const colors = this.points.geometry.getAttribute('color') as THREE.BufferAttribute;
    const colorArray = colors.array as Float32Array;
    const particleCount = colorArray.length / 3;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Update temperature
      const cooling = deltaTime * 0.1;
      const heating = this.params.starFormationRate * deltaTime;
      this.temperatures[i] = Math.max(0, this.temperatures[i] - cooling + heating);

      // Update colors based on temperature
      const normalizedTemp = this.temperatures[i] / this.params.temperature;
      colorArray[i3] = Math.min(1, normalizedTemp);
      colorArray[i3 + 1] = Math.min(0.6, normalizedTemp * 0.6);
      colorArray[i3 + 2] = Math.min(1, 1 - normalizedTemp);
    }

    colors.needsUpdate = true;
  }
}
