import React from 'react';
import { ICreature } from '../../creatures/index';
import { COLORS } from '../styles';

interface SkillsSectionProps {
  creature: ICreature;
}

export function SkillsSection({ creature }: SkillsSectionProps) {
  // Only show skills for player-controlled creatures
  if (!creature.isPlayerControlled()) {
    return null;
  }

  const skillsByType = creature.skills.reduce((acc, skill) => {
    if (!acc[skill.type]) {
      acc[skill.type] = [];
    }
    acc[skill.type].push(skill);
    return acc;
  }, {} as Record<string, typeof creature.skills>);

  const skillTypeLabels = {
    combat: 'Combat',
    stealth: 'Stealth', 
    academic: 'Academic',
    natural: 'Natural'
  };

  return (
    <div style={{ marginTop: 4, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: COLORS.text }}>Skills</div>
      
      {creature.skills.length === 0 ? (
        <div style={{ opacity: 0.6, fontSize: 12, color: COLORS.textMuted }}>
          No skills learned
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(skillsByType).map(([type, skills]) => (
            <div key={type}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: COLORS.textMuted,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
                marginBottom: 6
              }}>
                {skillTypeLabels[type as keyof typeof skillTypeLabels] || type}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {skills.map((skill, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '6px 8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '12px',
                      color: COLORS.text,
                      marginBottom: 2
                    }}>
                      {skill.name}
                    </div>
                    {skill.description && (
                      <div style={{ 
                        fontSize: '10px',
                        color: COLORS.textMuted,
                        lineHeight: '1.3'
                      }}>
                        {skill.description}
                      </div>
                    )}
                    {skill.attributeModifiers && skill.attributeModifiers.length > 0 && (
                      <div style={{ 
                        fontSize: '10px',
                        color: COLORS.primary,
                        marginTop: 2
                      }}>
                        {skill.attributeModifiers.map(mod => 
                          `${mod.value > 0 ? '+' : ''}${mod.value} ${mod.attribute}`
                        ).join(', ')}
                      </div>
                    )}
                    {skill.darkVision !== undefined && (
                      <div style={{ 
                        fontSize: '10px',
                        color: COLORS.primary,
                        marginTop: 2
                      }}>
                        Dark Vision: {skill.darkVision > 0 ? '+' : ''}{skill.darkVision}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
