import React, { useEffect, useState } from 'react';
import { TILE_SIZE } from '../styles';
import { ICreature } from '../../creatures/index';
import { animationManager, AnimationState } from '../../animations';
import { applyEasing } from '../../animations/easing';

interface SpellEffectOverlayProps {
  creatures: ICreature[];
}

export function SpellEffectOverlay({ creatures }: SpellEffectOverlayProps) {
  const [spellAnimations, setSpellAnimations] = useState<AnimationState[]>([]);

  useEffect(() => {
    const updateAnimations = () => {
      const allSpellAnims: AnimationState[] = [];
      
      creatures.forEach(creature => {
        const creatureAnimations = animationManager.getCreatureAnimations(creature.id);
        const spellAnims = creatureAnimations.filter(anim => anim.type === 'spell_cast' && !anim.isComplete);
        allSpellAnims.push(...spellAnims);
      });
      
      setSpellAnimations(allSpellAnims);
    };

    // Update immediately
    updateAnimations();

    // Set up interval to check for new animations
    const interval = setInterval(updateAnimations, 50); // Check every 50ms

    return () => clearInterval(interval);
  }, [creatures]);

  const getCreaturePosition = (creatureId: string) => {
    const creature = creatures.find(c => c.id === creatureId);
    if (!creature || creature.x === undefined || creature.y === undefined) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: creature.x * TILE_SIZE + (TILE_SIZE / 2),
      y: creature.y * TILE_SIZE + (TILE_SIZE / 2)
    };
  };

  const renderSpellEffect = (animation: AnimationState) => {
    const config = animationManager.config.spell_cast;
    const eased = applyEasing(animation.progress, config.easing);
    
    const casterPos = getCreaturePosition(animation.data.creatureId);
    const targetPos = animation.data.targetId ? getCreaturePosition(animation.data.targetId) : casterPos;
    
    // Spell effect visual based on spell name
    const spellName = animation.data.spellName || 'unknown';
    
    // Different visual effects for different spells
    let effectElement: React.ReactNode = null;
    
    if (spellName.toLowerCase().includes('heal') || spellName.toLowerCase().includes('cure')) {
      // Healing effect
      effectElement = (
        <div
          style={{
            position: 'absolute',
            left: targetPos.x - 16,
            top: targetPos.y - 16,
            width: 32,
            height: 32,
            background: `radial-gradient(circle, rgba(0,255,100,${0.8 * (1 - animation.progress)}) 0%, rgba(100,255,200,${0.4 * (1 - animation.progress)}) 50%, transparent 100%)`,
            borderRadius: '50%',
            transform: `scale(${1 + eased * 1.5})`,
            zIndex: 15,
            pointerEvents: 'none',
            opacity: 1 - animation.progress,
          }}
        />
      );
    } else if (spellName.toLowerCase().includes('ice') || spellName.toLowerCase().includes('frost')) {
      // Ice effect
      effectElement = (
        <div
          style={{
            position: 'absolute',
            left: targetPos.x - 16,
            top: targetPos.y - 16,
            width: 32,
            height: 32,
            background: `radial-gradient(circle, rgba(100,200,255,${0.8 * (1 - animation.progress)}) 0%, rgba(200,230,255,${0.4 * (1 - animation.progress)}) 50%, transparent 100%)`,
            borderRadius: '50%',
            transform: `scale(${1 + eased * 1.8})`,
            zIndex: 15,
            pointerEvents: 'none',
            opacity: 1 - animation.progress,
          }}
        />
      );
    } else {
      // Generic magic effect
      effectElement = (
        <div
          style={{
            position: 'absolute',
            left: targetPos.x - 16,
            top: targetPos.y - 16,
            width: 32,
            height: 32,
            background: `radial-gradient(circle, rgba(150,100,255,${0.8 * (1 - animation.progress)}) 0%, rgba(200,150,255,${0.4 * (1 - animation.progress)}) 50%, transparent 100%)`,
            borderRadius: '50%',
            transform: `scale(${1 + eased * 1.5})`,
            zIndex: 15,
            pointerEvents: 'none',
            opacity: 1 - animation.progress,
          }}
        />
      );
    }

    // Add spell name text for debugging/visual feedback
    const showSpellName = animation.progress < 0.3; // Show name for first 30% of animation
    
    return (
      <div key={animation.id}>
        {effectElement}
        {showSpellName && (
          <div
            style={{
              position: 'absolute',
              left: targetPos.x,
              top: targetPos.y - 40,
              transform: 'translateX(-50%)',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#ffffff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              zIndex: 16,
              pointerEvents: 'none',
              opacity: 1 - (animation.progress * 3), // Fade out quickly
            }}
          >
            {spellName}
          </div>
        )}
      </div>
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
        zIndex: 15,
      }}
    >
      {spellAnimations.map(renderSpellEffect)}
    </div>
  );
}
