import React, { useRef, useEffect, useCallback } from 'react';
import { useGameState } from '../../game/GameContext';
import {
  WeatherEffect,
  getWeatherParticleCount,
  getWeatherParticleSpeed
} from '../../game/weather';
import { ViewportState } from '../../game';

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  distance: number; // Distance from viewer (0 = close, 1 = far)
}

interface WeatherOverlayProps {
  cols: number;
  rows: number;
}

function createParticle(viewport: ViewportState, speed: number, weather: WeatherEffect): WeatherParticle {
  const distance = Math.random(); // Random distance from 0 (close) to 1 (far)
  const particle: WeatherParticle = {
    x: Math.random() * viewport.width,
    y: -Math.random() * 500 - 1000,
    vx: (Math.random() - 0.5) * speed * 0.5,
    vy: Math.random() * speed + 0.5,
    size: (Math.random() * 1 + 0.5) * viewport.zoom, // Scale particle size with zoom
    opacity: 1,
    distance: distance
  };

  // Adjust particle behavior based on weather type and distance
  switch (weather.type) {
    case 'rain':
      // Higher distance = slower fall speed, smaller size, more transparent
      particle.vy = (speed * 2 + 2) * (1 - distance * 0.6); // Distance reduces speed by up to 60%
      particle.vx = (speed * 0.2 + 0.2) * (1 - distance * 0.6); // Consistent rightward drift for rain
      particle.size = (1 - distance * 0.5); // Distance reduces size by up to 50%
      particle.opacity = 1 - distance * 0.5; // Distance reduces opacity by up to 70%
      break;
    case 'snow':
      // Higher distance = slower fall speed, smaller size, more transparent
      particle.vy = (Math.random() * speed + 0.3) * (1 - distance * 0.7); // Distance reduces speed by up to 70%
      particle.vx = Math.sin(particle.y * 0.01) * 0.5;
      particle.size = ((Math.random() * 0.7 + 0.8) * viewport.zoom) * (1 - distance * 0.6); // Distance reduces size by up to 60%
      particle.opacity = 1 - distance * 0.8; // Distance reduces opacity by up to 80%
      break;
    case 'fog':
      // Higher distance = slower movement, smaller size, more transparent
      particle.vy = (Math.random() * speed * 0.1) * (1 - distance * 0.8); // Distance reduces speed by up to 80%
      particle.vx = (Math.random() * speed * 0.1) * (1 - distance * 0.8);
      particle.size = ((Math.random() * 5 + 3) * viewport.zoom) * (1 - distance * 0.4); // Distance reduces size by up to 40%
      particle.opacity = (Math.random() * 0.3 + 0.1) * (1 - distance * 0.9); // Distance reduces opacity by up to 90%
      break;
    case 'storm':
      // Higher distance = slower fall speed, smaller size, more transparent
      particle.vy = (Math.random() * speed * 3 + 3) * (1 - distance * 0.5); // Distance reduces speed by up to 50%
      particle.vx = (Math.random() - 0.5) * speed * 1.5;
      particle.size = ((Math.random() * 0.8 + 0.4) * viewport.zoom) * (1 - distance * 0.6); // Distance reduces size by up to 60%
      particle.opacity = (Math.random() * 0.7 + 0.3) * (1 - distance * 0.6); // Distance reduces opacity by up to 60%
      break;
  }
  return particle;
}

export function WeatherOverlay({ cols, rows }: WeatherOverlayProps) {
  const { weather, viewport } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<WeatherParticle[]>([]);
  const lastTimeRef = useRef<number>(0);

  const createParticles = useCallback((weather: WeatherEffect) => {
    if (weather.type === 'clear') {
      particlesRef.current = [];
      return;
    }

    const count = getWeatherParticleCount(weather);
    const speed = getWeatherParticleSpeed(weather);
    const newParticles: WeatherParticle[] = [];

    for (let i = 0; i < count; i++) {
      const particle: WeatherParticle = createParticle(viewport, speed, weather);
      newParticles.push(particle);
    }

    particlesRef.current = newParticles;
  }, [viewport.width, viewport.height, viewport.zoom]);

  const updateParticles = useCallback((deltaTime: number, weather: WeatherEffect) => {
    if (weather.type === 'clear') return;

    particlesRef.current.forEach(particle => {
      // Update position
      particle.x += particle.vx * deltaTime * 0.016; // 60 FPS approximation
      particle.y += particle.vy * deltaTime * 0.016;

      // Check if particle has fallen off the bottom of the screen
      if (particle.y > viewport.height + 20) {
        //particle = createParticle(viewport, 20, weather);
        // Respawn particle at the top with random x position
        particle.x = Math.random() * viewport.width;
        particle.y = -20; // Start slightly above the top edge
      }

      // Handle horizontal wrapping for some weather types
      if (particle.x < -20) particle.x = viewport.width + 20;
      if (particle.x > viewport.width + 20) particle.x = -20;
    });
  }, [viewport.width, viewport.height, viewport.zoom]);

  const renderParticles = useCallback((ctx: CanvasRenderingContext2D, weather: WeatherEffect) => {
    if (weather.type === 'clear') return;

    ctx.save();

    // Set global alpha based on weather intensity (reduced since we now use individual particle opacity)
    ctx.globalAlpha = weather.intensity * 0.4 + 0.1;

    particlesRef.current.forEach(particle => {
      // Use individual particle opacity (already set based on distance)
      ctx.globalAlpha = particle.opacity;

      switch (weather.type) {
        case 'rain':
          ctx.strokeStyle = '#6496ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Use consistent angle for all raindrops - they should all fall at the same angle
          // Fixed angle: rain falls at approximately 15 degrees from vertical (slight rightward drift)
          const rainAngle = Math.PI / 2 + 0.15; // 90 degrees + 15 degrees
          const rainLength = (1 - Math.random() * 0.3) * 60 * (1 - particle.distance * 0.5); // Consistent length for all raindrops
          const endX = particle.x - Math.cos(rainAngle) * rainLength;
          const endY = particle.y + Math.sin(rainAngle) * rainLength;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          break;

        case 'snow':
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'fog':
          ctx.fillStyle = '#c8c8c8';
          // Fog opacity is already set per particle, no need to multiply by 0.5
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'storm':
          ctx.strokeStyle = '#323264';
          ctx.lineWidth = particle.size;
          ctx.beginPath();
          // Use consistent angle for storm raindrops as well
          const stormRainAngle = Math.PI / 2 + 0.2; // Slightly more angled than regular rain
          const stormRainLength = 12; // Longer raindrops for storm
          const stormEndX = particle.x - Math.cos(stormRainAngle) * stormRainLength;
          const stormEndY = particle.y - Math.sin(stormRainAngle) * stormRainLength;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(stormEndX, stormEndY);
          ctx.stroke();
          break;
      }
    });

    ctx.restore();
  }, [viewport.zoom]);

  const animate = useCallback((currentTime: number) => {
    if (!canvasRef.current) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Update and render particles
    updateParticles(deltaTime, weather.current);
    renderParticles(ctx, weather.current);

    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  }, [weather.current, updateParticles, renderParticles, viewport.zoom]);

  // Initialize particles when weather changes
  useEffect(() => {
    createParticles(weather.current);
  }, [weather.current, createParticles, viewport.zoom]);

  // Start/stop animation
  useEffect(() => {
    if (weather.current.type !== 'clear') {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [weather.current.type, animate, viewport.zoom]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = viewport.width;
      canvas.height = viewport.height;
    };

    resizeCanvas();
  }, [viewport.width, viewport.height, viewport.zoom]);

  if (weather.current.type === 'clear') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      height={viewport.height}
      width={viewport.width}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}
