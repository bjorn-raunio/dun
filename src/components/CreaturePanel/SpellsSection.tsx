import React from 'react';
import { ICreature } from '../../creatures/index';
import { COLORS } from '../styles';
import { useGameState, useGameActions, useGameAnimations } from '../../game/GameContext';
import { IconButton } from '../shared/IconButton';

interface SpellsSectionProps {
  creature: ICreature;
  onUpdate?: (creature: ICreature) => void;
  onClose?: () => void;
}

export function SpellsSection({ creature, onUpdate, onClose }: SpellsSectionProps) {
  const knownSpells = creature.getKnownSpells();
  const spellSchools = creature.getSpellSchools();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1,
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Spell Schools */}
      {spellSchools.length > 0 && (
        <div style={{ 
          marginBottom: 16,
          padding: 12,
          backgroundColor: COLORS.backgroundLight,
          borderRadius: 6,
          border: `1px solid ${COLORS.border}`
        }}>
          <div style={{ 
            fontWeight: 700, 
            marginBottom: 8, 
            color: COLORS.primary,
            fontSize: 14
          }}>
            Spell Schools
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {spellSchools.map((school, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 8px',
                  backgroundColor: COLORS.background,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 4,
                  fontSize: 12,
                  color: COLORS.text
                }}
              >
                {school.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Known Spells */}
      <div style={{ 
        flex: 1,
        overflow: 'auto',
        minHeight: 0
      }}>
        <div style={{ 
          fontWeight: 700, 
          marginBottom: 8,
          fontSize: 14,
          color: COLORS.text
        }}>
          Known Spells ({knownSpells.length})
        </div>
        
        {knownSpells.length === 0 ? (
          <div style={{ 
            opacity: 0.6, 
            fontSize: 12, 
            fontStyle: 'italic',
            textAlign: 'center',
            padding: 20
          }}>
            No spells known
          </div>
        ) : (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            {knownSpells.map((spell, index) => (
              <SpellCard key={index} spell={spell} creature={creature} onUpdate={onUpdate} onClose={onClose} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SpellCardProps {
  spell: any; // Spell type
  creature: ICreature;
  onUpdate?: (creature: ICreature) => void;
  onClose?: () => void;
}

function SpellCard({ spell, creature, onUpdate, onClose }: SpellCardProps) {
  const { creatures, mapDefinition, targetingMode } = useGameState();
  const { setTargetingMode } = useGameActions();
  const { animateSpellCast } = useGameAnimations();
  const canCast = creature.canCastSpell(spell, creatures);
  const manaCost = spell.cost;
  const range = spell.range;
  const targetType = spell.targetType;

  const handleCastSpell = () => {
    if (!canCast) return;
    
    // For self-target spells, cast immediately
    if (targetType === 'self') {
      const success = creature.castSpell(spell, undefined, creatures);
      if (success) {
        // Trigger particle effects for self-target spells
        if (creature.x !== undefined && creature.y !== undefined) {
          animateSpellCast(creature.id, creature.id, spell.name, creature.x, creature.y);
        }
        
        if (onUpdate) {
          onUpdate(creature);
        }
      }
      // Close the popup after casting
      if (onClose) {
        onClose();
      }
      return;
    }
    
    // For spells that need targets, enter targeting mode
    if (targetType === 'ally' || targetType === 'enemy') {
      setTargetingMode({
        isActive: true,
        attackerId: creature.id,
        message: `Select target for ${spell.name} (${targetType})`,
        spellId: spell.name,
        targetType: targetType
      });
      // Close the popup when entering targeting mode
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div style={{
      padding: 12,
      backgroundColor: canCast ? COLORS.backgroundLight : COLORS.background,
      border: `1px solid ${canCast ? COLORS.primary : COLORS.border}`,
      borderRadius: 6,
      opacity: canCast ? 1 : 0.6,
      transition: 'all 0.2s ease'
    }}>
      {/* Spell Name and Cost */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
      }}>
        <div style={{
          fontWeight: 600,
          fontSize: 14,
          color: canCast ? COLORS.text : COLORS.textMuted
        }}>
          {spell.name}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <div style={{
            fontSize: 12,
            color: canCast ? COLORS.primary : COLORS.textMuted,
            fontWeight: 500
          }}>
            {manaCost} MP
          </div>
          {canCast && (
            <IconButton
              onClick={handleCastSpell}
              disabled={false}
              iconSrc="/icons/mainHand.png"
              iconAlt="Cast spell"
              title={`Cast ${spell.name}`}
              variant="medium"
              iconSize={20}
            />
          )}
        </div>
      </div>

      {/* Spell Details */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 8
      }}>
        <span>Range: {range}</span>
        <span>Target: {targetType}</span>
      </div>

      {/* Spell Effects */}
      <div style={{
        fontSize: 12,
        color: COLORS.textMuted
      }}>
        {spell.effect.damage && (
          <div>Damage: {spell.effect.damage.damageModifier}</div>
        )}
        {spell.effect.heal && (
          <div>Heal: {spell.effect.heal}</div>
        )}
        {spell.effect.areaOfEffect && (
          <div>AOE: {spell.effect.areaOfEffect}</div>
        )}
        {spell.effect.statusEffect && (
          <div>Effect: {spell.effect.statusEffect.name || 'Status Effect'}</div>
        )}
        {!spell.effect.damage && !spell.effect.heal && !spell.effect.areaOfEffect && !spell.effect.statusEffect && (
          <div style={{ fontStyle: 'italic' }}>No effects</div>
        )}
      </div>

      {/* Cast Status */}
      {!canCast && (
        <div style={{
          fontSize: 11,
          color: COLORS.error,
          marginTop: 4,
          fontStyle: 'italic'
        }}>
          {!creature.hasMana(manaCost) ? 'Not enough mana' : 
           !creature.hasActionsRemaining() ? 'No actions remaining' : 
           'Cannot cast'}
        </div>
      )}
    </div>
  );
}
