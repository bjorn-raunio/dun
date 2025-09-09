export type WeatherType = 'clear' | 'snow' | 'fog' | 'storm' | 'wind' | 'heat';

export interface WeatherEffect {
  type: WeatherType;
  movementModifier: number; // affects movement cost
  combatModifier: number; // affects combat accuracy
}

export interface WeatherState {
  current: WeatherEffect;
  transitionTime: number; // time in ms for weather to transition
  isTransitioning: boolean;
}

export const WEATHER_PRESETS: Record<WeatherType, Omit<WeatherEffect, 'intensity' | 'duration'>> = {
  clear: {
    type: 'clear',
    movementModifier: 1.0,
    combatModifier: 1.0,
  },
  snow: {
    type: 'snow',
    movementModifier: 1.5,
    combatModifier: 0.8,
  },
  fog: {
    type: 'fog',
    movementModifier: 1.1,
    combatModifier: 0.95,
  },
  storm: {
    type: 'storm',
    movementModifier: 1.8,
    combatModifier: 0.7,
  },
  wind: {
    type: 'wind',
    movementModifier: 1.3,
    combatModifier: 0.85,
  },
  heat: {
    type: 'heat',
    movementModifier: 1.4,
    combatModifier: 0.9,
  },
};

export function createWeatherEffect(
  type: WeatherType
): WeatherEffect {
  const preset = WEATHER_PRESETS[type];
  return {
    ...preset
  };
}

export function getWeatherParticleCount(weather: WeatherEffect): number {
  return 1500;
}

export function getWeatherParticleSpeed(weather: WeatherEffect): number {
  return 20;
}

/**
 * Generate a random weather effect for quest maps
 * @param intensity Optional intensity override (0.0 to 1.0)
 * @param duration Optional duration override (in turns)
 * @returns A random weather effect
 */
export function generateRandomWeather(): WeatherEffect {
  const weatherTypes: WeatherType[] = ['clear', 'snow', 'fog', 'storm', 'wind', 'heat'];
  
  // Weight the weather types - clear weather is more common
  const weatherWeights = [1.0, 0.0, 0.0, 0.0, 0.0, 0.0];
  const random = Math.random();
  
  let cumulativeWeight = 0;
  let selectedType: WeatherType = 'clear';
  
  for (let i = 0; i < weatherTypes.length; i++) {
    cumulativeWeight += weatherWeights[i];
    if (random <= cumulativeWeight) {
      selectedType = weatherTypes[i];
      break;
    }
  }
  
  return createWeatherEffect(selectedType);
}