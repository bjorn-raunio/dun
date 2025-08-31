import { useCallback } from 'react';
import { Creature } from '../../creatures/index';

export function useActions(
  onUpdate?: (creature: Creature) => void
) {
  const handleRun = useCallback((creature: Creature) => {
    if (!creature.isPlayerControlled()) {
        return;
    }
    const success = creature.run();
    if (success) {
      onUpdate?.(creature);
    }
  }, [onUpdate]);

  const handleSearch = useCallback((creature: Creature) => {
    if (!creature.isPlayerControlled()) {
      return;
    }
    const success = creature.search();
    if (success) {
      onUpdate?.(creature);
    }
  }, [onUpdate]);

  return {
    handleRun,
    handleSearch,
  };
}
