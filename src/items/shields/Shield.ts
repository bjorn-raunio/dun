import { EquippableItem } from '../base';
import { Attributes } from '../../statusEffects/types';

export class Shield extends EquippableItem {
  kind: "shield" = "shield";
  block: number; // shield bonus to AC
  special?: string[]; // special properties like "magical", "spiked", etc.
  attributeModifiers?: Partial<Attributes>; // stat bonuses from equipment

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
      breakRoll: params.breakRoll
    });
    this.block = params.block;
    this.special = params.special;
    this.attributeModifiers = params.attributeModifiers;
  }
}
