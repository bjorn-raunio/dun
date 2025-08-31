import { Creature } from '../creatures/index';
import { GameActions } from '../game/types';
import { DIRECTIONS } from '../utils/constants';
import { findCreatureById } from '../utils/pathfinding';

// --- Keyboard Event Handlers ---

export interface KeyboardHandlers {
  setupKeyboardHandler: () => void;
  cleanupKeyboardHandler: () => void;
}

export function createKeyboardHandlers(
  gameActions: GameActions,
  creatures: Creature[],
  selectedCreatureId: string | null,
  targetingMode?: { isActive: boolean; attackerId: string | null; message: string }
): KeyboardHandlers {
  const { setCreatures, setMessages, setTargetingMode } = gameActions;

  let keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

  function setupKeyboardHandler() {
    keyboardHandler = (e: KeyboardEvent) => {
      // Handle Escape key to cancel targeting mode
      if (e.key === 'Escape' && targetingMode?.isActive) {
        setTargetingMode({ isActive: false, attackerId: null, message: '' });
        setMessages(prev => ['Targeting mode cancelled', ...prev].slice(0, 50));
        return;
      }

      if (!selectedCreatureId) return;
      
      const currentCreature = findCreatureById(creatures, selectedCreatureId);
      if (!currentCreature) return;
      
      // Prevent controlling enemies with keyboard shortcuts
      // Check if the creature is player-controlled
      if (!currentCreature.isPlayerControlled()) {
        return; // Don't allow keyboard control of AI-controlled creatures
      }
      
      let newFacing = currentCreature.facing;
      
      switch (e.key) {
        case 'Numpad8':
        case '8':
          newFacing = DIRECTIONS.NORTH;
          break;
        case 'Numpad6':
        case '6':
          newFacing = DIRECTIONS.EAST;
          break;
        case 'Numpad2':
        case '2':
          newFacing = DIRECTIONS.SOUTH;
          break;
        case 'Numpad4':
        case '4':
          newFacing = DIRECTIONS.WEST;
          break;
        case 'Numpad7':
        case '7':
          newFacing = DIRECTIONS.NORTHWEST;
          break;
        case 'Numpad9':
        case '9':
          newFacing = DIRECTIONS.NORTHEAST;
          break;
        case 'Numpad1':
        case '1':
          newFacing = DIRECTIONS.SOUTHWEST;
          break;
        case 'Numpad3':
        case '3':
          newFacing = DIRECTIONS.SOUTHEAST;
          break;
        default:
          return;
      }
      
      if (newFacing !== currentCreature.facing) {
        setCreatures(prev => prev.map(c => {
          if (c.id === selectedCreatureId) {
            // Update the creature's facing direction in place
            if (c.faceDirection) {
              c.faceDirection(newFacing);
              // Return the same creature instance to maintain selection
              return c;
            } else {
              // For plain objects, we need to create a new instance to maintain type safety
              // This is a fallback case that shouldn't normally occur
              console.warn('Creature without faceDirection method detected');
              return c;
            }
          }
          return c;
        }));
        setMessages(prev => [`${currentCreature.name} faces ${currentCreature.getFacingShortName()}`, ...prev].slice(0, 50));
      }
    };

    window.addEventListener('keydown', keyboardHandler);
  }

  function cleanupKeyboardHandler() {
    if (keyboardHandler) {
      window.removeEventListener('keydown', keyboardHandler);
      keyboardHandler = null;
    }
  }

  return {
    setupKeyboardHandler,
    cleanupKeyboardHandler,
  };
}
