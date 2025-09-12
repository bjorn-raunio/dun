// Particle system for spell effects and visual enhancements

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  life: number; // 0 to 1, decreases over time
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  scaleSpeed: number;
  gravity?: number;
  friction?: number;
}

export interface ParticleSystem {
  particles: Map<string, Particle>;
  isActive: boolean;
  startTime: number;
  duration: number;
}

export interface ParticleConfig {
  count: number;
  life: number; // in milliseconds
  size: { min: number; max: number };
  speed: { min: number; max: number };
  direction: { min: number; max: number }; // in radians
  color: string | string[];
  opacity: { min: number; max: number };
  gravity?: number;
  friction?: number;
  rotationSpeed?: { min: number; max: number };
  scaleSpeed?: { min: number; max: number };
  spread?: number; // how much particles spread from center
}

export class ParticleManager {
  private systems: Map<string, ParticleSystem> = new Map();
  private nextParticleId = 0;

  /**
   * Create a new particle system
   */
  createParticleSystem(
    id: string,
    x: number,
    y: number,
    config: ParticleConfig,
    duration: number = 1000
  ): string {
    const system: ParticleSystem = {
      particles: new Map(),
      isActive: true,
      startTime: performance.now(),
      duration
    };

    // Generate particles based on config
    for (let i = 0; i < config.count; i++) {
      const particle = this.createParticle(x, y, config);
      system.particles.set(particle.id, particle);
    }

    this.systems.set(id, system);
    return id;
  }

  /**
   * Create a single particle
   */
  private createParticle(x: number, y: number, config: ParticleConfig): Particle {
    const id = `particle_${this.nextParticleId++}`;
    
    // Random direction within range
    const direction = config.direction.min + Math.random() * (config.direction.max - config.direction.min);
    
    // Random speed within range
    const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
    
    // Apply spread
    const spread = config.spread || 0;
    const spreadX = (Math.random() - 0.5) * spread;
    const spreadY = (Math.random() - 0.5) * spread;
    
    // Random size within range
    const size = config.size.min + Math.random() * (config.size.max - config.size.min);
    
    // Random opacity within range
    const opacity = config.opacity.min + Math.random() * (config.opacity.max - config.opacity.min);
    
    // Random color (if array provided)
    const color = Array.isArray(config.color) 
      ? config.color[Math.floor(Math.random() * config.color.length)]
      : config.color;
    
    // Random rotation speed
    const rotationSpeed = config.rotationSpeed 
      ? config.rotationSpeed.min + Math.random() * (config.rotationSpeed.max - config.rotationSpeed.min)
      : 0;
    
    // Random scale speed
    const scaleSpeed = config.scaleSpeed 
      ? config.scaleSpeed.min + Math.random() * (config.scaleSpeed.max - config.scaleSpeed.min)
      : 0;

    return {
      id,
      x: x + spreadX,
      y: y + spreadY,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      life: 1,
      maxLife: config.life,
      size,
      color,
      opacity,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed,
      scale: 1,
      scaleSpeed,
      gravity: config.gravity,
      friction: config.friction
    };
  }

  /**
   * Update all particle systems
   */
  updateParticles(deltaTime: number): void {
    const systemsToRemove: string[] = [];

    this.systems.forEach((system, systemId) => {
      if (!system.isActive) return;

      const currentTime = performance.now();
      const elapsed = currentTime - system.startTime;
      
      // Check if system should be removed
      if (elapsed >= system.duration) {
        systemsToRemove.push(systemId);
        return;
      }

      const particlesToRemove: string[] = [];

      // Update each particle in the system
      system.particles.forEach((particle, particleId) => {
        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Apply gravity
        if (particle.gravity) {
          particle.vy += particle.gravity * deltaTime;
        }

        // Apply friction
        if (particle.friction) {
          particle.vx *= particle.friction;
          particle.vy *= particle.friction;
        }

        // Update rotation
        particle.rotation += particle.rotationSpeed * deltaTime;

        // Update scale
        particle.scale += particle.scaleSpeed * deltaTime;

        // Update life
        particle.life -= deltaTime / particle.maxLife;
        
        if (particle.life <= 0) {
          particlesToRemove.push(particleId);
        }
      });

      // Remove dead particles
      particlesToRemove.forEach(id => system.particles.delete(id));

      // Remove system if no particles left
      if (system.particles.size === 0) {
        systemsToRemove.push(systemId);
      }
    });

    // Remove completed systems
    systemsToRemove.forEach(id => this.systems.delete(id));
  }

  /**
   * Get all active particles for rendering
   */
  getAllParticles(): Particle[] {
    const allParticles: Particle[] = [];
    
    this.systems.forEach(system => {
      if (system.isActive) {
        system.particles.forEach(particle => {
          allParticles.push(particle);
        });
      }
    });
    
    return allParticles;
  }

  /**
   * Get particles for a specific system
   */
  getSystemParticles(systemId: string): Particle[] {
    const system = this.systems.get(systemId);
    if (!system) return [];
    
    const particles: Particle[] = [];
    system.particles.forEach(particle => {
      particles.push(particle);
    });
    return particles;
  }

  /**
   * Remove a particle system
   */
  removeParticleSystem(systemId: string): void {
    this.systems.delete(systemId);
  }

  /**
   * Clear all particle systems
   */
  clearAllParticles(): void {
    this.systems.clear();
  }

  /**
   * Check if a system is active
   */
  isSystemActive(systemId: string): boolean {
    const system = this.systems.get(systemId);
    return system ? system.isActive : false;
  }
}

// Global particle manager instance
export const particleManager = new ParticleManager();

// Predefined particle configurations for different spell types
export const SPELL_PARTICLE_CONFIGS: Record<string, ParticleConfig> = {
  ice: {
    count: 20,
    life: 2500,
    size: { min: 3, max: 8 },
    speed: { min: 20, max: 50 },
    direction: { min: -Math.PI, max: Math.PI },
    color: ['#87ceeb', '#b0e0e6', '#e0f6ff', '#f0f8ff'],
    opacity: { min: 0.8, max: 1.0 },
    gravity: 0.03,
    friction: 0.992,
    rotationSpeed: { min: -0.08, max: 0.08 },
    scaleSpeed: { min: -0.0004, max: -0.0004 },
    spread: 10
  },
  
  healing: {
    count: 35,
    life: 3000,
    size: { min: 3, max: 8 },
    speed: { min: 20, max: 50 },
    direction: { min: -Math.PI/2 - 0.3, max: Math.PI/2 + 0.3 }, // Upward with slight spread
    color: ['#00ff7f', '#32cd32', '#90ee90', '#98fb98', '#ffffff'],
    opacity: { min: 0.7, max: 1.0 },
    gravity: -0.05, // Stronger upward force
    friction: 0.995,
    rotationSpeed: { min: -0.05, max: 0.05 },
    scaleSpeed: { min: -0.0003, max: -0.0003 },
    spread: 6
  },
  
  lightning: {
    count: 15,
    life: 800,
    size: { min: 2, max: 5 },
    speed: { min: 60, max: 120 },
    direction: { min: -Math.PI/4, max: Math.PI/4 },
    color: ['#ffff00', '#ffd700', '#ffffff'],
    opacity: { min: 0.9, max: 1.0 },
    gravity: 0,
    friction: 0.92,
    rotationSpeed: { min: -0.3, max: 0.3 },
    scaleSpeed: { min: -0.0015, max: -0.0015 },
    spread: 4
  },
  
  magic: {
    count: 25,
    life: 2500,
    size: { min: 2, max: 8 },
    speed: { min: 25, max: 60 },
    direction: { min: 0, max: Math.PI * 2 },
    color: ['#9370db', '#ba55d3', '#da70d6', '#ee82ee'],
    opacity: { min: 0.7, max: 1.0 },
    gravity: 0.015,
    friction: 0.985,
    rotationSpeed: { min: -0.12, max: 0.12 },
    scaleSpeed: { min: -0.0006, max: -0.0006 },
    spread: 15
  },
  
  poison: {
    count: 18,
    life: 3000,
    size: { min: 3, max: 8 },
    speed: { min: 8, max: 25 },
    direction: { min: -Math.PI, max: Math.PI },
    color: ['#9acd32', '#adff2f', '#7fff00', '#32cd32'],
    opacity: { min: 0.5, max: 0.9 },
    gravity: 0.06,
    friction: 0.975,
    rotationSpeed: { min: -0.08, max: 0.08 },
    scaleSpeed: { min: -0.0003, max: -0.0003 },
    spread: 18
  }
};
