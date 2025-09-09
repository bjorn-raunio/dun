// Utility functions for working with scenarios

import { Scenario } from './Scenario';
import { returnOfRazbaal } from './presets';

/**
 * Get a scenario by name
 * @param scenarioName - The name of the scenario to load
 * @returns The scenario instance or null if not found
 */
export function getScenarioByName(scenarioName: string): Scenario | null {
  switch (scenarioName.toLowerCase()) {
    case 'returnofrazbaal':
    case 'return of razbaal':
      return returnOfRazbaal;
    default:
      console.warn(`Scenario "${scenarioName}" not found`);
      return null;
  }
}

/**
 * Get all available scenario names
 * @returns Array of scenario names
 */
export function getAvailableScenarios(): string[] {
  return [
    'Return of Razbaal'
  ];
}

/**
 * Load a scenario and return its first map preset
 * @param scenarioName - The name of the scenario to load
 * @returns The first map preset from the scenario, or null if not found
 */
export function loadScenarioMap(scenarioName: string) {
  const scenario = getScenarioByName(scenarioName);
  if (!scenario || scenario.maps.length === 0) {
    return null;
  }
  return scenario.maps[0];
}
