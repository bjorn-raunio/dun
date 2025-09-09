import React from 'react';
import { useGameState } from '../game/GameContext';
import { WeatherType } from '../game/weather';
import { COLORS, COMMON_STYLES } from './styles';

interface WeatherIndicatorProps {
  className?: string;
}

export function WeatherIndicator({ className }: WeatherIndicatorProps) {
  const { weather } = useGameState();
  const currentWeather = weather.current;

  const getWeatherIcon = (weatherType: WeatherType): string => {
    switch (weatherType) {
      case 'clear':
        return '☀️';
      case 'snow':
        return '❄️';
      case 'fog':
        return '🌫️';
      case 'storm':
        return '⛈️';
      case 'wind':
        return '💨';
      case 'heat':
        return '🔥';
      default:
        return '☀️';
    }
  };

  const getWeatherName = (weatherType: WeatherType): string => {
    switch (weatherType) {
      case 'clear':
        return 'Clear';
      case 'snow':
        return 'Snow';
      case 'fog':
        return 'Fog';
      case 'storm':
        return 'Storm';
      case 'wind':
        return 'Wind';
      case 'heat':
        return 'Extreme Heat';
      default:
        return 'Clear';
    }
  };

  const getWeatherColor = (weatherType: WeatherType): string => {
    switch (weatherType) {
      case 'clear':
        return '#FFD700'; // Gold
      case 'snow':
        return '#E6F3FF'; // Light blue
      case 'fog':
        return '#D3D3D3'; // Light gray
      case 'storm':
        return '#4169E1'; // Royal blue
      case 'wind':
        return '#87CEEB'; // Sky blue
      case 'heat':
        return '#FF4500'; // Orange red
      default:
        return '#FFD700';
    }
  };

  return (
    <div
      className={className}
      style={{
        ...COMMON_STYLES.messageBox,
        height: "fit-content",
        maxHeight: "60px",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100px",
        padding: "8px",
      }}
      title={`Weather: ${getWeatherName(currentWeather.type)}`}
    >
      <div
        style={{
          fontSize: "24px",
          marginBottom: "4px",
          filter: `drop-shadow(0 0 3px ${getWeatherColor(currentWeather.type)})`,
        }}
      >
        {getWeatherIcon(currentWeather.type)}
      </div>
      <div
        style={{
          fontSize: "10px",
          color: getWeatherColor(currentWeather.type),
          fontWeight: "bold",
          textAlign: "center",
          lineHeight: "1.2",
        }}
      >
        {getWeatherName(currentWeather.type)}
      </div>
    </div>
  );
}
