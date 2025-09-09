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
    y: -Math.random() * viewport.height,
    vx: (Math.random() - 0.5) * speed * 0.5,
    vy: Math.random() * speed + 0.5,
    size: Math.random() * 1 + 0.5, // Base size without zoom scaling
    opacity: 1,
    distance: distance
  };

  // Adjust particle behavior based on weather type and distance
  switch (weather.type) {
    case 'storm':
      // Higher distance = slower fall speed, smaller size, more transparent
      particle.vy = (speed * 4 + 4) * (1 - distance * 0.6); // Distance reduces speed by up to 60%
      particle.vx = (speed * 0.4 + 0.4) * (1 - distance * 0.6); // Consistent rightward drift for rain
      particle.size = (1 - distance * 0.5); // Distance reduces size by up to 50%
      particle.opacity = 1 - distance * 0.5; // Distance reduces opacity by up to 70%
      break;
    case 'snow':
      // Higher distance = slower fall speed, smaller size, more transparent
      particle.vy = (Math.random() * speed + 0.3) * (1 - distance * 0.6); // Distance reduces speed by up to 70%
      particle.vx = Math.sin(particle.y * 0.01) * (1 - distance * 0.6);
      particle.size = (Math.random() * 3 + 3) * (1 - distance * 0.6); // Distance reduces size by up to 60%
      particle.opacity = 1 - distance * 0.5; // Distance reduces opacity by up to 80%
      break;
    case 'wind':
      // Wind particles move horizontally with some vertical variation
      particle.vy = (Math.random() - 0.5) * speed * 0.3 * (1 - distance * 0.5); // Small vertical movement
      particle.vx = (Math.random() * speed * 2 + speed) * (1 - distance * 0.3); // Strong horizontal movement
      particle.size = (Math.random() * 2 + 1) * (1 - distance * 0.4); // Small, varying size
      particle.opacity = (Math.random() * 0.4 + 0.3) * (1 - distance * 0.6); // Semi-transparent
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
    if (weather.type === 'clear' || weather.type === 'fog' || weather.type === 'heat') {
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
  }, []);

  const updateParticles = useCallback((deltaTime: number, weather: WeatherEffect) => {
    if (weather.type === 'clear' || weather.type === 'fog' || weather.type === 'heat') return;

    particlesRef.current.forEach(particle => {
      // Update position
      particle.x += particle.vx * deltaTime * 0.016; // 60 FPS approximation
      particle.y += particle.vy * deltaTime * 0.016;

      // Handle particle respawning based on weather type
      if (weather.type === 'wind') {
        // Wind particles wrap horizontally and respawn vertically
        if (particle.x < -20) particle.x = viewport.width + 20;
        if (particle.x > viewport.width + 20) particle.x = -20;
        if (particle.y < -20 || particle.y > viewport.height + 20) {
          particle.x = Math.random() * viewport.width;
          particle.y = Math.random() * viewport.height;
        }
      } else {
        // For rain and snow, check if particle has fallen off the bottom of the screen
        if (particle.y > viewport.height + 20) {
          // Respawn particle at the top with random x position
          particle.x = Math.random() * viewport.width;
          particle.y = -Math.random() * viewport.height;
        }

        // Handle horizontal wrapping for some weather types
        if (particle.x < -20) particle.x = viewport.width + 20;
        if (particle.x > viewport.width + 20) particle.x = -20;
      }
    });
  }, []);

  const renderParticles = useCallback((ctx: CanvasRenderingContext2D, weather: WeatherEffect) => {
    if (weather.type === 'clear' || weather.type === 'fog' || weather.type === 'heat') return;

    ctx.save();

    // Set global alpha based on weather intensity (reduced since we now use individual particle opacity)
    ctx.globalAlpha = 0.5;

    particlesRef.current.forEach(particle => {
      // Use individual particle opacity (already set based on distance)
      ctx.globalAlpha = particle.opacity;

      switch (weather.type) {
        case 'storm':
          ctx.strokeStyle = '#B4C3FF';
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

        case 'wind':
          // Draw wind streaks as small lines moving horizontally
          ctx.strokeStyle = '#E8F4FD';
          ctx.lineWidth = 1;
          ctx.beginPath();
          const windLength = particle.size * 8;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + windLength, particle.y);
          ctx.stroke();
          break;

      }
    });

    ctx.restore();
  }, []);

  const animate = useCallback((currentTime: number) => {
    if (!canvasRef.current) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Update and render particles for weather types that need animation
    updateParticles(deltaTime, weather.current);
    renderParticles(ctx, weather.current);

    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  }, [weather.current, updateParticles, renderParticles]);

  // Initialize particles when weather changes
  useEffect(() => {
    createParticles(weather.current);
  }, [weather.current, createParticles]);

  // Start/stop animation
  useEffect(() => {
    if (weather.current.type !== 'clear' && weather.current.type !== 'fog' && weather.current.type !== 'heat') {
      // Start continuous animation for particle-based weather
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
  }, [weather.current.type, animate]);

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
    <>
      {/* Canvas for particle-based weather effects */}
      {(weather.current.type === 'snow' || weather.current.type === 'storm' || weather.current.type === 'wind') && (
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
      )}
      
      {/* CSS-based fog effect */}
      {weather.current.type === 'fog' && (
        <div className="fogwrapper">
          <div id="foglayer_01">
            <div className="image01"></div>
            <div className="image02"></div>
          </div>
          <div id="foglayer_02">
            <div className="image01"></div>
            <div className="image02"></div>
          </div>
          <div id="foglayer_03">
            <div className="image01"></div>
            <div className="image02"></div>
          </div>
        </div>
      )}

      {/* CSS-based heat effect */}
      {weather.current.type === 'heat' && (
        <>
          <div className="heatwrapper">
            <div id="heatlayer_01">
              <div className="image01"></div>
              <div className="image02"></div>
            </div>
            <div id="heatlayer_02">
              <div className="image01"></div>
              <div className="image02"></div>
            </div>
            <div id="heatlayer_03">
              <div className="image01"></div>
              <div className="image02"></div>
            </div>
          </div>
          {/* Additional heat distortion overlay */}
          <div className="heatdistortion">
            <div className="heatwave"></div>
            <div className="heatwave"></div>
            <div className="heatwave"></div>
          </div>
        </>
      )}
    </>
  );
}
