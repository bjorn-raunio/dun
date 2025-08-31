import React from 'react';
import { Creature } from '../../../creatures/index';
import { Skill, SkillType } from '../../../creatures/types';
import { COLORS } from '../../styles';

interface SkillsSectionProps {
  creature: Creature;
}



const SKILL_TYPE_COLORS: Record<SkillType, string> = {
  combat: "#ff6b6b",
  stealth: "#4ecdc4",
  academic: "#45b7d1", 
  natural: "#96ceb4"
};

const SkillsSection: React.FC<SkillsSectionProps> = ({ creature }) => {
  const skills = creature.getAllSkills();
  
  if (skills.length === 0) {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Skills</div>
        <div style={{ opacity: 0.6, fontSize: 14 }}>No skills</div>
      </div>
    );
  }

  // Group skills by type
  const skillsByType = skills.reduce((acc, skill) => {
    if (!acc[skill.type]) {
      acc[skill.type] = [];
    }
    acc[skill.type].push(skill);
    return acc;
  }, {} as Record<SkillType, Skill[]>);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Skills</div>
      {Object.entries(skillsByType).map(([type, typeSkills]) => (
        <div key={type} style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {typeSkills.map((skill) => (
              <div key={skill.name} style={{
                padding: 8,
                borderRadius: 6,
                background: COLORS.backgroundLight,
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  {skill.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsSection;
