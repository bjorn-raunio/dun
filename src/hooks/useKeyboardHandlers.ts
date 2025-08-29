import React from 'react';
import { createKeyboardHandlers } from '../handlers/keyboardHandlers';
import { GameActions } from '../game/types';
import { Creature } from '../creatures/index';

// --- Keyboard Handlers Hook ---

export function useKeyboardHandlers(
  gameActions: GameActions,
  creatures: Creature[],
  selectedCreatureId: string | null
) {
  const keyboardHandlers = React.useMemo(() => {
    return createKeyboardHandlers(gameActions, creatures, selectedCreatureId);
  }, [gameActions, creatures, selectedCreatureId]);

  // Setup and cleanup keyboard handlers
  React.useEffect(() => {
    keyboardHandlers.setupKeyboardHandler();
    return () => keyboardHandlers.cleanupKeyboardHandler();
  }, [keyboardHandlers]);

  return keyboardHandlers;
}
