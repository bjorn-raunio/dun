import React, { useEffect, useState } from 'react';
import { TILE_SIZE } from '../styles';
import { ICreature } from '../../creatures/index';
import { animationManager, AnimationState } from '../../animations';

interface FireEffectOverlayProps {
  creatures: ICreature[];
}

export function FireEffectOverlay({ creatures }: FireEffectOverlayProps) {
  const [fireAnimations, setFireAnimations] = useState<AnimationState[]>([]);

  useEffect(() => {
    const updateAnimations = () => {
      const allFireAnims: AnimationState[] = [];
      
      creatures.forEach(creature => {
        const creatureAnimations = animationManager.getCreatureAnimations(creature.id);
        const spellAnims = creatureAnimations.filter(anim => 
          anim.type === 'spell_cast' && 
          !anim.isComplete &&
          anim.data.spellName && (
            anim.data.spellName.toLowerCase().includes('fire') ||
            anim.data.spellName.toLowerCase().includes('flame') ||
            anim.data.spellName.toLowerCase().includes('burn') ||
            anim.data.spellName.toLowerCase().includes('phoenix')
          )
        );
        allFireAnims.push(...spellAnims);
      });
      
      setFireAnimations(allFireAnims);
    };

    // Update immediately
    updateAnimations();

    // Set up interval to check for new animations
    const interval = setInterval(updateAnimations, 1900); // Check every 50ms

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

  const renderFireEffect = (animation: AnimationState) => {
    const targetPos = animation.data.targetId ? getCreaturePosition(animation.data.targetId) : getCreaturePosition(animation.data.creatureId);
    
    return (
      <>
        {/* Generate 50 fire particles positioned within the target tile */}
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={`${animation.id}-${i}`}
            className="fire-particle"
            style={{
              position: 'absolute',
              left: targetPos.x + (Math.random() * 100 - 50), // Spread across the 100px tile
              top: targetPos.y + 50,
              animationDelay: `${Math.random() * 1}s`, // Random delay up to 1 second
              zIndex: 16,
              pointerEvents: 'none',
            }}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {/* CSS Styles for fire effect */}
      <style>{`
        .fire-effect {
          font-size: 12px;
          filter: blur(1px);
          -webkit-filter: blur(1px);
        }
        .fire-particle {
          animation: fireRise 2s ease-in infinite;
          background-image: radial-gradient(rgb(255,80,0) 20%, rgba(255,80,0,0) 70%);
          border-radius: 50%;
          mix-blend-mode: screen;
          opacity: 0;
          width: 16px;
          height: 16px;
        }
        
        @keyframes fireRise {
          from {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          25% {
            opacity: 1;
          }
          to {
            opacity: 0;
            transform: translateY(-100px) scale(0);
          }
        }
      `}</style>
      
      <div
        className="fire-effect"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 16,
        }}
      >
        {fireAnimations.map(renderFireEffect)}
      </div>
    </>
  );
}
