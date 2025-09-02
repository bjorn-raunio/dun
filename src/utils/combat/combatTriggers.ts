import { CombatEventData, CombatEventName } from './execution';

export class CombatTriggers {

  static processCombatTriggers(
    triggerType: CombatEventName,
    data: CombatEventData,
  ): void {

    for (const skill of data.attacker.skills) {
      if (skill.combatTriggers) {
        for (const trigger of skill.combatTriggers) {
          if (trigger.event === triggerType && (!trigger.type || (data.isRanged && trigger.type === "ranged" || !data.isRanged && trigger.type === "melee"))) {
            data.messages.push(
              `${data.attacker.name}'s ${skill.name} activates`
            );
            trigger.effect(data);
          }
        }
      }
    }
  }
}