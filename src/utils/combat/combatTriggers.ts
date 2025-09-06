import { CombatEventData, CombatEventName } from './execution';
import { addCombatMessage } from '../messageSystem';

export class CombatTriggers {

  static processCombatTriggers(
    triggerType: CombatEventName,
    data: CombatEventData,
  ): void {

    for (const skill of data.attacker.skills) {
      if (skill.combatTriggers) {
        for (const trigger of skill.combatTriggers) {
          if (trigger.event === triggerType && (!trigger.type || ((data.attack.isRanged && trigger.type === "ranged") || (!data.attack.isRanged && trigger.type === "melee")))) {
            addCombatMessage(
              `${data.attacker.name}'s ${skill.name} activates`
            );
            trigger.effect(data);
          }
        }
      }
    }
  }
}