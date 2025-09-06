import React, { useState } from 'react';
import { heroPresets } from '../creatures/heroes/presets';
import { HeroPreset } from '../creatures/presets/types';
import { createHero } from '../creatures/heroes/factory';
import { Hero } from '../creatures/heroes/hero';
import { COLORS, COMMON_STYLES, BUTTON_VARIANTS } from './styles';

interface HeroSelectionProps {
  onHeroSelected: (hero: Hero) => void;
}

interface HeroCardProps {
  preset: HeroPreset;
  presetId: string;
  isSelected: boolean;
  onSelect: () => void;
}

function HeroCard({ preset, presetId, isSelected, onSelect }: HeroCardProps) {
  return (
    <div 
      style={{
        ...COMMON_STYLES.section,
        width: 300,
        cursor: 'pointer',
        border: isSelected ? `2px solid ${COLORS.hero}` : `2px solid ${COLORS.border}`,
        background: isSelected ? 'rgba(76, 175, 80, 0.1)' : COLORS.backgroundLight,
      }}
      onClick={onSelect}
    >
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <img 
          src={preset.image} 
          alt={preset.name}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: `2px solid ${COLORS.border}`,
            objectFit: 'cover',
          }}
        />
      </div>
      <div>
        <h3 style={{
          ...COMMON_STYLES.sectionHeader,
          textAlign: 'center',
          margin: '0 0 12px 0',
          color: COLORS.primary,
        }}>
          {preset.name}
        </h3>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Movement:</span>
            <span style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '12px' }}>{preset.attributes.movement}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Combat:</span>
            <span style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '12px' }}>{preset.attributes.combat}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Strength:</span>
            <span style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '12px' }}>{preset.attributes.strength}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Agility:</span>
            <span style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '12px' }}>{preset.attributes.agility}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Courage:</span>
            <span style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '12px' }}>{preset.attributes.courage}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Intelligence:</span>
            <span style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '12px' }}>{preset.attributes.intelligence}</span>
          </div>
        </div>
        <div style={{ 
          marginBottom: 12, 
          paddingTop: 8, 
          borderTop: `1px solid ${COLORS.border}` 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Vitality:</span>
            <span style={{ color: COLORS.warning, fontWeight: 'bold', fontSize: '12px' }}>{preset.vitality}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Mana:</span>
            <span style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: '12px' }}>{preset.mana}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Fortune:</span>
            <span style={{ color: COLORS.success, fontWeight: 'bold', fontSize: '12px' }}>{preset.fortune}</span>
          </div>
        </div>
        {preset.equipment && (
          <div style={{ marginBottom: 8 }}>
            <h4 style={{
              color: COLORS.primary,
              fontSize: '14px',
              margin: '0 0 6px 0',
              fontWeight: 'bold',
            }}>
              Starting Equipment:
            </h4>
            <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'none' }}>
              {preset.equipment.mainHand && (
                <li style={{ color: COLORS.text, fontSize: '11px', marginBottom: 2, position: 'relative' }}>
                  <span style={{ color: COLORS.hero, position: 'absolute', left: -12 }}>•</span>
                  Main Hand: {preset.equipment.mainHand.preset}
                </li>
              )}
              {preset.equipment.offHand && (
                <li style={{ color: COLORS.text, fontSize: '11px', marginBottom: 2, position: 'relative' }}>
                  <span style={{ color: COLORS.hero, position: 'absolute', left: -12 }}>•</span>
                  Off Hand: {preset.equipment.offHand.preset}
                </li>
              )}
              {preset.equipment.armor && (
                <li style={{ color: COLORS.text, fontSize: '11px', marginBottom: 2, position: 'relative' }}>
                  <span style={{ color: COLORS.hero, position: 'absolute', left: -12 }}>•</span>
                  Armor: {preset.equipment.armor.preset}
                </li>
              )}
            </ul>
          </div>
        )}
        {preset.skills && preset.skills.length > 0 && (
          <div>
            <h4 style={{
              color: COLORS.primary,
              fontSize: '14px',
              margin: '0 0 6px 0',
              fontWeight: 'bold',
            }}>
              Skills:
            </h4>
            <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'none' }}>
              {preset.skills.map((skill, index) => (
                <li key={index} style={{ color: COLORS.text, fontSize: '11px', marginBottom: 2, position: 'relative' }}>
                  <span style={{ color: COLORS.hero, position: 'absolute', left: -12 }}>•</span>
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroSelection({ onHeroSelected }: HeroSelectionProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const handleStartGame = () => {
    if (selectedPresetId) {
      const hero = createHero(selectedPresetId);
      onHeroSelected(hero);
    }
  };

  const presetEntries = Object.entries(heroPresets);

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      color: COLORS.text,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          fontSize: '2.5rem',
          margin: '0 0 10px 0',
          color: COLORS.primary,
          fontWeight: 'bold',
        }}>
          Choose character
        </h1>
      </div>
      
      <div style={{
        display: 'flex',
        gap: 20,
        marginBottom: 40,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {presetEntries.map(([presetId, preset]) => (
          <HeroCard
            key={presetId}
            preset={preset}
            presetId={presetId}
            isSelected={selectedPresetId === presetId}
            onSelect={() => setSelectedPresetId(presetId)}
          />
        ))}
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button 
          style={{
            ...BUTTON_VARIANTS.action,
            padding: '12px 32px',
            fontSize: '16px',
            opacity: selectedPresetId ? 1 : 0.5,
            cursor: selectedPresetId ? 'pointer' : 'not-allowed',
            backgroundColor: selectedPresetId ? COLORS.hero : COLORS.border,
            border: `1px solid ${selectedPresetId ? COLORS.hero : COLORS.border}`,
          }}
          onClick={handleStartGame}
          disabled={!selectedPresetId}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
