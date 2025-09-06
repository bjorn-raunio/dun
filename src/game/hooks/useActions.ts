import { useCallback } from 'react';
import { CreatureAction, ICreature } from '../../creatures/index';

export function useActions(
  allCreatures: ICreature[],
  onUpdate?: (creature: ICreature) => void
) {
  const handleAction = useCallback((creature: ICreature, action: CreatureAction) => {
    if (!creature.isPlayerControlled()) {
      return;
    }
    if (creature.performAction(action, allCreatures)) {
      onUpdate?.(creature);
    }
  }, [allCreatures, onUpdate]);

  return {
    handleAction,
  };
}
