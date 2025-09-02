export type WeatherType = 'clear' | 'rain' | 'snow' | 'fog' | 'storm';

export interface WeatherEffect {
  type: WeatherType;
  intensity: number; // 0.0 to 1.0
  duration: number; // in turns
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
  rain: {
    type: 'rain',
    movementModifier: 1.2,
    combatModifier: 0.9,
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
};

export function createWeatherEffect(
  type: WeatherType, 
  intensity: number = 0.5, 
  duration: number = 5
): WeatherEffect {
  const preset = WEATHER_PRESETS[type];
  return {
    ...preset,
    intensity: Math.max(0, Math.min(1, intensity)),
    duration,
  };
}

export function getWeatherIntensityColor(weather: WeatherEffect): string {
  const alpha = weather.intensity * 0.6 + 0.1; // 0.1 to 0.7 alpha
  
  switch (weather.type) {
    case 'rain':
      return `rgba(100, 150, 255, ${alpha})`;
    case 'snow':
      return `rgba(255, 255, 255, ${alpha})`;
    case 'fog':
      return `rgba(200, 200, 200, ${alpha})`;
    case 'storm':
      return `rgba(50, 50, 100, ${alpha})`;
    default:
      return 'transparent';
  }
}

export function getWeatherParticleCount(weather: WeatherEffect): number {
  const baseCount = 500; // Increased from 100 to 500 for more particles
  return Math.floor(baseCount * weather.intensity);
}

export function getWeatherParticleSpeed(weather: WeatherEffect): number {
  const baseSpeed = 20;
  return baseSpeed;
}
