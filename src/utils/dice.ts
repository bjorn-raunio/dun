// --- Dice Rolling Utilities ---

/**
 * Roll multiple d6 dice
 * @param count Number of dice to roll
 * @returns Array of dice roll results
 */
export function rollXd6(count: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * 6) + 1);
  }
  return results;
}

/**
 * Roll a single d6 die
 * @returns A random number between 1 and 6
 */
export function rollD6(): number {
  return rollXd6(1)[0];
}

/**
 * Roll multiple d6 dice and return the sum
 * @param count Number of dice to roll
 * @param bonus Optional bonus to add to the sum
 * @returns Sum of all dice rolls plus bonus
 */
export function rollXd6Sum(count: number, bonus: number = 0): number {
  const rolls = rollXd6(count);
  return rolls.reduce((sum, roll) => sum + roll, 0) + bonus;
}

/**
 * Roll 2d6 (two six-sided dice) with optional bonus
 * @param bonus Optional bonus to add to the roll
 * @returns Sum of two d6 rolls plus bonus
 */
export function roll2d6(bonus: number = 0): number {
  return rollXd6Sum(2, bonus);
}

// Note: rollShieldBlock() was removed as it was redundant with rollD6()
// Use rollD6() directly for shield blocking rolls

/**
 * Calculate damage roll (Xd6 where X = base dice + optional strength)
 * This is the unified damage roll function - use this for all damage calculations
 * 
 * @param baseDice Base number of dice (usually weapon damage)
 * @param strength Optional strength modifier (defaults to 0 for ranged attacks)
 * @returns Array of dice roll results
 * 
 * @example
 * // For melee attacks: strength + weapon damage
 * const meleeDamage = calculateDamageRoll(weaponDamage, strength);
 * 
 * // For ranged attacks: weapon damage only (no strength)
 * const rangedDamage = calculateDamageRoll(weaponDamage, 0);
 * // or simply: calculateDamageRoll(weaponDamage);
 */
export function calculateDamageRoll(baseDice: number, strength: number = 0): number[] {
  const numDice = baseDice + strength;
  return rollXd6(numDice);
}

/**
 * Calculate combat roll (2d6 + combat bonus)
 * This is the unified combat roll function - use this for all 2d6 + bonus rolls
 * 
 * @param combatBonus Combat bonus to add (attack bonus, defense bonus, etc.)
 * @returns Object containing total roll and individual dice results
 * 
 * @example
 * // For attack rolls
 * const attackRoll = calculateCombatRoll(attackBonus);
 * 
 * // For defense/block rolls
 * const blockRoll = calculateCombatRoll(defenseBonus);
 * 
 * // For any other 2d6 + bonus rolls
 * const skillCheck = calculateCombatRoll(skillBonus);
 */
export function calculateCombatRoll(combatBonus: number): { total: number; dice: number[] } {
  const dice = rollXd6(2);
  const total = dice.reduce((sum, roll) => sum + roll, 0) + combatBonus;
  return { total, dice };
}

/**
 * Check if a combat roll contains a critical hit (any die rolled a 6)
 * @param diceResults Array of individual dice results from a combat roll
 * @returns True if any die rolled a 6 (critical hit)
 */
export function isCriticalHit(diceResults: number[]): boolean {
  return diceResults.some(roll => roll === 6);
}

/**
 * Check if a combat roll contains a double critical hit (both dice rolled 6)
 * @param diceResults Array of individual dice results from a combat roll
 * @returns True if both dice rolled 6 (double critical hit)
 */
export function isDoubleCritical(diceResults: number[]): boolean {
  return diceResults.length === 2 && diceResults.every(roll => roll === 6);
}

/**
 * Get a random element from an array
 * @param array The array to select from
 * @returns A random element from the array, or undefined if array is empty
 */
export function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
