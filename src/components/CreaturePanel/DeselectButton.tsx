import React from 'react';
import { COMMON_STYLES } from '../styles';

interface DeselectButtonProps {
  onClick: () => void;
}

export function DeselectButton({ onClick }: DeselectButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 4,
        width: "100%",
        ...COMMON_STYLES.button,
      }}
    >
      Deselect
    </button>
  );
}
