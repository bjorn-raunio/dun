import { ICreature } from "../creatures/interfaces";
import { CreatureAction } from "../creatures/types";
import { getEngagingCreatures } from "../utils/zoneOfControl";

export function validateAction(creature: ICreature, action: CreatureAction, allCreatures: ICreature[]): boolean {
    switch(action) {
        case 'run':
            return validateCanRun(creature, allCreatures);
        case 'disengage':
            return validateCanDisengage(creature, allCreatures);
        case 'search':
            return validateCanSearch(creature);
    }
}

function validateCanRun(creature: ICreature, allCreatures: ICreature[]): boolean {
    return creature.canAct() &&
        creature.hasActionsRemaining() &&
        !creature.running && 
        !creature.hasMoved() &&
        getEngagingCreatures(creature, allCreatures).length === 0 &&
        !creature.hasStatusEffect("wounded") &&
        !creature.hasStatusEffect("stunned");
}

function validateCanDisengage(creature: ICreature, allCreatures: ICreature[]): boolean {
    return creature.canAct() &&
        !creature.hasTakenActionsThisTurn() &&
        getEngagingCreatures(creature, allCreatures, true).length > 0;
}

function validateCanSearch(creature: ICreature): boolean {
    return creature.canAct() &&
        creature.hasActionsRemaining() &&
        false;
}