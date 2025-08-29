import { Weapon, RangedWeapon, Armor, Shield } from './types';
import { weaponPresets, rangedPresets, armorPresets, shieldPresets } from './presets';

export function createWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof Weapon>[0]> & { id?: string }): Weapon {
  const p = weaponPresets[presetId];
  return new Weapon({
    name: overrides?.name ?? p.name,
    damage: overrides?.damage ?? p.damage,
    hands: overrides?.hands ?? p.hands,
    reach: overrides?.reach ?? p.reach,
    properties: overrides?.properties ?? p.properties,
    combatModifier: overrides?.combatModifier ?? p.combatModifier,
    armorModifier: overrides?.armorModifier ?? p.armorModifier,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}

export function createRangedWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof RangedWeapon>[0]> & { id?: string }): RangedWeapon {
  const p = rangedPresets[presetId];
  return new RangedWeapon({
    name: overrides?.name ?? p.name,
    damage: overrides?.damage ?? p.damage,
    range: overrides?.range ?? p.range,
    hands: overrides?.hands ?? p.hands,
    ammoType: overrides?.ammoType ?? p.ammoType,
    properties: overrides?.properties ?? p.properties,
    armorModifier: overrides?.armorModifier ?? p.armorModifier,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}

export function createArmor(presetId: string, overrides?: Partial<ConstructorParameters<typeof Armor>[0]> & { id?: string }): Armor {
  const p = armorPresets[presetId];
  return new Armor({
    name: overrides?.name ?? p.name,
    armor: overrides?.armor ?? p.armor,
    armorType: overrides?.armorType ?? p.armorType,
    stealthDisadvantage: overrides?.stealthDisadvantage ?? p.stealthDisadvantage,
    strengthRequirement: overrides?.strengthRequirement ?? p.strengthRequirement,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}

export function createShield(presetId: string, overrides?: Partial<ConstructorParameters<typeof Shield>[0]> & { id?: string }): Shield {
  const p = shieldPresets[presetId];
  return new Shield({
    name: overrides?.name ?? p.name,
    block: overrides?.block ?? p.block,
    size: overrides?.size ?? p.size,
    special: overrides?.special ?? p.special,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}
