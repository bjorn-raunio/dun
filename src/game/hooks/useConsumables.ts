import { useCallback } from 'react';
import { ICreature } from '../../creatures/index';
import { Consumable } from '../../items/types';
import { STATUS_EFFECT_PRESETS } from '../../statusEffects/presets';

export function useConsumables(creature: ICreature, onUpdate?: (creature: ICreature) => void) {
  const handleUseConsumable = useCallback((consumable: Consumable) => {

    // Prevent consumable usage for AI-controlled creatures
    if (creature.isAIControlled()) {
      return;
    }

    // Check if creature has quick actions available
    if (!creature.canUseQuickAction()) {
      return;
    }

    // Check if creature is alive
    if (!creature.isAlive()) {
      return;
    }
    
    // Apply consumable effects based on target type
    let success = false;
    let message = '';

    switch (consumable.targetType) {
      case 'self':
        success = applySelfEffect(creature, consumable);
        message = success ? `Used ${consumable.name}` : `Failed to use ${consumable.name}`;
        break;
      case 'ally':
        // TODO: Implement ally targeting
        return;
      case 'enemy':
        // TODO: Implement enemy targeting
        return;
      case 'area':
        // TODO: Implement area targeting
        return;
      default:
        return;
    }
    
    if (success) {
      // Consume quick action
      creature.useQuickAction();
      
      // Remove consumable from inventory
      const itemIndex = creature.inventory.findIndex(item => item.id === consumable.id);
      if (itemIndex !== -1) {
        creature.inventory.splice(itemIndex, 1);
      }

      // Update creature
      onUpdate?.(creature);
    }
  }, [creature, onUpdate]);

  const canUseConsumable = useCallback((consumable: Consumable): boolean => {
    return creature.isPlayerControlled() && 
           creature.isAlive() && 
           creature.canUseQuickAction();
  }, [creature]);

  return {
    handleUseConsumable,
    canUseConsumable,
  };
}

function applySelfEffect(creature: ICreature, consumable: Consumable): boolean {
  let hasEffect = false;
  
  // Remove status effects if the consumable specifies any to remove
  if (consumable.removeStatusEffect) {
    const statusEffectManager = creature.getStatusEffectManager();
    const effectsToRemove = Array.isArray(consumable.removeStatusEffect) 
      ? consumable.removeStatusEffect 
      : [consumable.removeStatusEffect];
    
    for (const effectType of effectsToRemove) {
      const effect = statusEffectManager.getEffect(effectType as any);
      if (effect) {
        statusEffectManager.removeEffect(effect.id);
        hasEffect = true;
      }
    }
  }
  
  // Apply status effect if the consumable has one
  if (consumable.statusEffect) {
    const statusEffectType = consumable.statusEffect.type as keyof typeof STATUS_EFFECT_PRESETS;
    const statusEffectPreset = STATUS_EFFECT_PRESETS[statusEffectType];
    
    if (statusEffectPreset) {        
      const statusEffect = statusEffectPreset.createEffect(consumable.name, consumable.statusEffect.duration || undefined, consumable.statusEffect.value || undefined);
      creature.addStatusEffect(statusEffect);
      hasEffect = true;
    }
  }
  
  // Restore vitality if specified
  if (consumable.restoreVitality && consumable.restoreVitality > 0) {
    creature.heal(consumable.restoreVitality);
    hasEffect = true;
  }

  // Restore mana if specified
  if (consumable.restoreMana && consumable.restoreMana > 0) {
    creature.restoreMana(consumable.restoreMana);
    hasEffect = true;
  }

  return hasEffect;
}
