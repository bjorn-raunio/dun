import { EquippableItem } from '../base';
import { Attributes } from '../../statusEffects/types';
import { rollD6 } from '../../utils/dice';

export class Shield extends EquippableItem {
  kind: "shield" = "shield";
  block: number; // shield bonus to AC
  special?: string[]; // special properties like "magical", "spiked", etc.
  attributeModifiers?: Partial<Attributes>; // stat bonuses from equipment
  breakRoll: number; // roll equal or lower on 1d6 to break

  constructor(params: {
    id?: string;
    name: string;
    block: number;
    special?: string[];
    attributeModifiers?: Partial<Attributes>;
    breakRoll?: number;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({ 
      id: params.id, 
      name: params.name, 
      slot: params.slot ?? "shield", 
      weight: params.weight, 
      value: params.value,
    });
    this.block = params.block;
    this.special = params.special;
    this.attributeModifiers = params.attributeModifiers;
    this.breakRoll = params.breakRoll ?? 1;
  }

  /**
   * Check if the shield should break on a 1d6 roll
   * @returns true if the shield breaks
   */
  checkForBreaking(): boolean {
    if (this.breakRoll <= 0) {
      return false;
    }
    
    const roll = rollD6();
    return roll <= this.breakRoll;
  }
}
