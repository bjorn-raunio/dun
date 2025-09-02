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
    const result = creature.performAction(action, allCreatures);
    if (result.success) {
      onUpdate?.(creature);
    }
  }, [allCreatures, onUpdate]);

  return {
    handleAction,
  };
}
