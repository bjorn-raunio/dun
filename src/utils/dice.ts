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

export type DiceRoll = { total: number, dice: number[], modifier: number, fumble: boolean, criticalHit: boolean, criticalSuccess: boolean };

export function calculateAttributeRoll(modifier: number, fumbleValue: number = 1): DiceRoll {
  const dice = rollXd6(2);
  const total = dice.reduce((sum, roll) => sum + roll, 0) + modifier;
  let fumble = false;
  for(let i = 1; i <= fumbleValue; i++) {
    if(dice.filter(roll => roll === i).length >= 2) {
      fumble = true;
      break;
    }
  }
  const criticalHit = dice.some(roll => roll === 6);
  const criticalSuccess = dice.filter(roll => roll === 6).length >= 2;
  return { total, dice, modifier, fumble, criticalHit, criticalSuccess };
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

export function displayDiceRoll(dice: number[]): string {
  return `${dice.map(d => `[${d}]`).join('')}`;
}

export function displayDieRoll(die: number): string {
  return displayDiceRoll([die]);
}

export function displayDiceSum(roll: { total: number; dice: number[] }, modifier?: number): string {
  return `${displayDiceRoll(roll.dice)}${modifier !== undefined ? `${modifier >= 0 ? ` + ${modifier}` : ` - ${modifier * -1}`}` : ''} = ${roll.total}`;
}

/**
 * Check if two or more dice show the same result
 * @param diceResults Array of dice roll results
 * @returns True if any value appears two or more times
 */
export function isDoubles(diceResults: number[]): boolean {
  if (diceResults.length < 2) return false;
  
  // Count occurrences of each value
  const counts: { [key: number]: number } = {};
  for (const result of diceResults) {
    counts[result] = (counts[result] || 0) + 1;
  }
  
  // Check if any value appears two or more times
  return Object.values(counts).some(count => count >= 2);
}