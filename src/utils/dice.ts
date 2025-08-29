// --- Dice Rolling Utilities ---

/**
 * Roll a single d6 die
 * @returns A random number between 1 and 6
 */
export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Roll multiple d6 dice
 * @param count Number of dice to roll
 * @returns Array of dice roll results
 */
export function rollXd6(count: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollD6());
  }
  return results;
}

/**
 * Roll 2d6 (two six-sided dice)
 * @returns Sum of two d6 rolls
 */
export function roll2d6(): number {
  return rollD6() + rollD6();
}

/**
 * Roll 2d6 with a bonus
 * @param bonus Bonus to add to the roll
 * @returns Sum of two d6 rolls plus bonus
 */
export function roll2d6WithBonus(bonus: number): number {
  return roll2d6() + bonus;
}

/**
 * Roll 1d6 for shield blocking
 * @returns A random number between 1 and 6
 */
export function rollShieldBlock(): number {
  return rollD6();
}

/**
 * Calculate damage roll (Xd6 where X = strength + weapon damage)
 * @param strength Creature's strength attribute
 * @param weaponDamage Weapon's damage value
 * @returns Array of dice roll results
 */
export function calculateDamageRoll(strength: number, weaponDamage: number): number[] {
  const numDice = strength + weaponDamage;
  return rollXd6(numDice);
}

/**
 * Calculate ranged damage roll (Xd6 where X = weapon damage only, no strength)
 * @param weaponDamage Weapon's damage value
 * @returns Array of dice roll results
 */
export function calculateRangedDamageRoll(weaponDamage: number): number[] {
  return rollXd6(weaponDamage);
}

/**
 * Calculate combat roll (2d6 + combat bonus)
 * @param combatBonus Combat bonus to add
 * @returns Sum of 2d6 plus combat bonus
 */
export function calculateCombatRoll(combatBonus: number): number {
  return roll2d6WithBonus(combatBonus);
}
