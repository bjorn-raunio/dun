import React from 'react';
import { Creature, ICreature } from '../../../creatures/index';

interface SkillsSectionProps {
  creature: ICreature;
}

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

  const skillNames = skills.map(skill => skill.name).join(', ');

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Skills</div>
      <div style={{ fontSize: 14, lineHeight: 1.4 }}>{skillNames}</div>
    </div>
  );
};

export default SkillsSection;
