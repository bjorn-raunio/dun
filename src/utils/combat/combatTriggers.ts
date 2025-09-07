import { CombatEventData, CombatEventName } from './execution';
import { addCombatMessage } from '../messageSystem';
import { DiceRoll } from '../dice';

export class CombatTriggers {

  static processCombatTriggers(
    triggerType: CombatEventName,
    data: CombatEventData,
    roll?: DiceRoll
  ): void {

    if (!roll || !roll.fumble) {
      // Process skill triggers
      for (const skill of data.attacker.skills) {
        if (skill.combatTriggers) {
          for (const trigger of skill.combatTriggers) {
            if (trigger.events.includes(triggerType) && (!trigger.type || data.attack.type === trigger.type)) {
              if(roll && trigger.validator && !trigger.validator(roll)) {
                continue;
              }
              addCombatMessage(
                `${data.attacker.name}'s ${skill.name} activates`
              );
              trigger.effect(data);
              break;
            }
          }
        }
      }

      // Process weapon triggers
      if (data.weapon.combatTriggers) {
        for (const trigger of data.weapon.combatTriggers) {
          if (trigger.events.includes(triggerType) && (!trigger.type || data.attack.type === trigger.type)) {
            if(roll && trigger.validator && !trigger.validator(roll)) {
              continue;
            }
            trigger.effect(data);
            break;
          }
        }
      }
    }
  }
}