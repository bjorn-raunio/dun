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
  selectedCreatureId: string | null
): KeyboardHandlers {
  const { setCreatures, setMessages } = gameActions;

  let keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

  function setupKeyboardHandler() {
    keyboardHandler = (e: KeyboardEvent) => {
      if (!selectedCreatureId) return;
      
      const currentCreature = findCreatureById(creatures, selectedCreatureId);
      if (!currentCreature) return;
      
      let newFacing = currentCreature.facing;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newFacing = DIRECTIONS.NORTH;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newFacing = DIRECTIONS.EAST;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newFacing = DIRECTIONS.SOUTH;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newFacing = DIRECTIONS.WEST;
          break;
        case 'q':
        case 'Q':
          newFacing = DIRECTIONS.NORTHWEST;
          break;
        case 'e':
        case 'E':
          newFacing = DIRECTIONS.NORTHEAST;
          break;
        case 'z':
        case 'Z':
          newFacing = DIRECTIONS.SOUTHWEST;
          break;
        case 'c':
        case 'C':
          newFacing = DIRECTIONS.SOUTHEAST;
          break;
        default:
          return;
      }
      
      if (newFacing !== currentCreature.facing) {
        setCreatures(prev => prev.map(c => {
          if (c.id === selectedCreatureId) {
            // Ensure we're working with class instances
            if (c.faceDirection) {
              c.faceDirection(newFacing);
              return c.clone(); // Ensure React detects the change
            } else {
              // Fallback for plain objects
              if (c.isPlayerControlled()) {
                // Handle player-controlled creatures (Hero, Mercenary, etc.)
                if (c.kind === "hero") {
                  const hero = new (require('../creatures').Hero)(c);
                  hero.faceDirection(newFacing);
                  return hero;
                } else if (c.kind === "mercenary") {
                  const mercenary = new (require('../creatures').Mercenary)(c);
                  mercenary.faceDirection(newFacing);
                  return mercenary;
                } else {
                  // Default to Hero for other player-controlled creatures
                  const hero = new (require('../creatures').Hero)(c);
                  hero.faceDirection(newFacing);
                  return hero;
                }
              } else {
                const monster = new (require('../creatures').Monster)(c);
                monster.faceDirection(newFacing);
                return monster;
              }
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
