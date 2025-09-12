import React from 'react';
import { COLORS, createConditionalButtonStyle } from '../styles';

interface IconButtonProps {
  onClick: () => void;
  disabled?: boolean;
  iconSrc: string;
  iconAlt: string;
  title: string;
  variant?: 'small' | 'smallIcon' | 'medium' | 'action';
  iconSize?: number;
}

export function IconButton({ 
  onClick, 
  disabled = false, 
  iconSrc, 
  iconAlt, 
  title,
  variant = 'medium',
  iconSize = 20
}: IconButtonProps) {
  const buttonStyle = createConditionalButtonStyle(variant, !disabled, 'disabled');
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      title={title}
    >
      <img 
        src={iconSrc} 
        style={{ 
          width: `${iconSize}px`, 
          height: `${iconSize}px`,
          filter: disabled ? 'grayscale(100%)' : 'none'
        }} 
        alt={iconAlt}
      />
    </button>
  );
}
