import { EquippableItem } from '../base';
import { Attributes } from '../../statusEffects/types';

export class Armor extends EquippableItem {
  kind: "armor" = "armor";
  armor: number; // base AC or bonus
  armorType: "light" | "heavy";
  attributeModifiers?: Partial<Attributes>; // stat bonuses from equipment

  constructor(params: {
    id?: string;
    name: string;
    armor: number;
    armorType: "light" | "heavy";
    attributeModifiers?: Partial<Attributes>;
    weight?: number;
    value?: number;
    slot?: string;
  }) {
    super({ 
      id: params.id, 
      name: params.name, 
      slot: params.slot ?? "armor", 
      weight: params.weight, 
      value: params.value,
    });
    this.armor = params.armor;
    this.armorType = params.armorType;
    this.attributeModifiers = params.attributeModifiers;
  }
}
