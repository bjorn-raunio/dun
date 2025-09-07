import React from 'react';
import { ICreature } from '../../creatures/index';

interface DamageIndicatorProps {
  creature: ICreature;
}

export function DamageIndicator({ creature }: DamageIndicatorProps) {
  // Calculate damage taken
  const damageTaken = creature.vitality - creature.remainingVitality;
  
  // Don't show indicator if no damage taken and not wounded
  if (damageTaken === 0 && !creature.isWounded()) {
    return null;
  }

  // Determine what to display
  const isWounded = creature.isWounded();
  const displayValue = isWounded ? null : damageTaken.toString();
  
  // Determine color based on status
  let backgroundColor = '#cc2222'; // Darker red for damage
  let textColor = '#ffffff';
  
  if (isWounded) {
    backgroundColor = '#ff8800'; // Orange for wounded
  } else if (damageTaken > 0) {
    backgroundColor = '#cc2222'; // Darker red for damage
  }

  // Use fixed indicator size
  const indicatorSize = 40;
  const fontSize = 24;

  if (isWounded) {
    // Render wounded icon directly
    return (
      <img
        src={process.env.PUBLIC_URL + "/icons/wounded.png"}
        alt="Wounded"
        style={{
          position: 'absolute',
          top: -indicatorSize * 0.3,
          right: -indicatorSize * 0.3,
          width: indicatorSize,
          height: indicatorSize,
          zIndex: 10,
          pointerEvents: 'none',
        }}
        title="Wounded"
      />
    );
  }

  // Render damage circle with number
  return (
    <div
      style={{
        position: 'absolute',
        top: -indicatorSize * 0.3,
        right: -indicatorSize * 0.3,
        width: indicatorSize,
        height: indicatorSize,
        borderRadius: '50%',
        backgroundColor: backgroundColor,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fontSize,
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        zIndex: 10,
        pointerEvents: 'none',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
      }}
      title={`${damageTaken} damage taken`}
    >
      {displayValue}
    </div>
  );
}
