import React, { useEffect, useState } from 'react';
import { ICreature } from '../../creatures/index';
import { animationManager, AnimationState } from '../../animations';
import { applyEasing } from '../../animations/easing';

interface AnimatedDamageIndicatorProps {
  creature: ICreature;
}

export function AnimatedDamageIndicator({ creature }: AnimatedDamageIndicatorProps) {
  const [damageAnimations, setDamageAnimations] = useState<AnimationState[]>([]);
  const [healAnimations, setHealAnimations] = useState<AnimationState[]>([]);

  useEffect(() => {
    const updateAnimations = () => {
      const creatureAnimations = animationManager.getCreatureAnimations(creature.id);
      const damageAnims = creatureAnimations.filter(anim => anim.type === 'damage' && !anim.isComplete);
      const healAnims = creatureAnimations.filter(anim => anim.type === 'heal' && !anim.isComplete);
      
      setDamageAnimations(damageAnims);
      setHealAnimations(healAnims);
    };

    // Update immediately
    updateAnimations();

    // Set up interval to check for new animations
    const interval = setInterval(updateAnimations, 50); // Check every 50ms

    return () => clearInterval(interval);
  }, [creature.id]);

  const renderDamageNumber = (animation: AnimationState) => {
    const config = animationManager.config.damage;
    const eased = applyEasing(animation.progress, config.easing);
    
    // Calculate position with bounce effect
    const bounceHeight = config.bounceHeight * 32; // Convert tiles to pixels
    const yOffset = Math.sin(animation.progress * Math.PI) * bounceHeight;
    
    // Fade out as animation progresses
    const opacity = 1 - (animation.progress * 0.7); // Fade to 30% opacity
    
    return (
      <div
        key={animation.id}
        style={{
          position: 'absolute',
          top: -yOffset,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#ff4444',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 20,
          pointerEvents: 'none',
          opacity: opacity,
          transition: 'opacity 0.1s ease-out',
        }}
      >
        -{animation.data.damage}
      </div>
    );
  };

  const renderHealNumber = (animation: AnimationState) => {
    const config = animationManager.config.heal;
    const eased = applyEasing(animation.progress, config.easing);
    
    // Calculate position with bounce effect
    const bounceHeight = config.bounceHeight * 32; // Convert tiles to pixels
    const yOffset = Math.sin(animation.progress * Math.PI) * bounceHeight;
    
    // Fade out as animation progresses
    const opacity = 1 - (animation.progress * 0.7); // Fade to 30% opacity
    
    return (
      <div
        key={animation.id}
        style={{
          position: 'absolute',
          top: -yOffset,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#44ff44',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 20,
          pointerEvents: 'none',
          opacity: opacity,
          transition: 'opacity 0.1s ease-out',
        }}
      >
        +{animation.data.heal}
      </div>
    );
  };

  return (
    <>
      {damageAnimations.map(renderDamageNumber)}
      {healAnimations.map(renderHealNumber)}
    </>
  );
}
