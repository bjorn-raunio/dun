import React, { useEffect, useState } from 'react';
import { TILE_SIZE } from '../styles';
import { particleManager, Particle } from '../../animations/particleSystem';

interface ParticleEffectOverlayProps {
  // No props needed - particles are managed globally
}

export function ParticleEffectOverlay({}: ParticleEffectOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const updateParticles = () => {
      // Update particle systems
      particleManager.updateParticles(16); // ~60fps
      
      // Get all active particles for rendering
      const allParticles = particleManager.getAllParticles();
      setParticles(allParticles);

      // Continue animation loop
      animationFrameId = requestAnimationFrame(updateParticles);
    };

    // Start animation loop
    animationFrameId = requestAnimationFrame(updateParticles);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const renderParticle = (particle: Particle) => {
    return (
      <div
        key={particle.id}
        style={{
          position: 'absolute',
          left: particle.x - particle.size / 2,
          top: particle.y - particle.size / 2,
          width: particle.size * particle.scale,
          height: particle.size * particle.scale,
          backgroundColor: particle.color,
          borderRadius: '50%',
          opacity: particle.opacity * particle.life,
          transform: `rotate(${particle.rotation}rad)`,
          zIndex: 20,
          pointerEvents: 'none',
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
        }}
      />
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {particles.map(renderParticle)}
    </div>
  );
}
