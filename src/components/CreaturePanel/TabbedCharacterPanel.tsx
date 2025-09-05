import React, { useState } from 'react';
import { ICreature } from '../../creatures/index';
import { TabButton } from './TabButton';
import { SimpleCreatureStats } from './SimpleCreatureStats';
import { EquipmentSection } from './EquipmentSection';
import { InventorySection } from './InventorySection';
import { SkillsSection } from './SkillsSection';
import { COLORS } from '../styles';

interface TabbedCharacterPanelProps {
  creature: ICreature;
  onUpdate?: (creature: ICreature) => void;
  onAttack?: (creature: ICreature, offhand?: boolean) => void;
  canAttack?: (creature: ICreature) => boolean;
}

type TabType = 'stats' | 'equipment' | 'skills';

export function TabbedCharacterPanel({ 
  creature, 
  onUpdate, 
  onAttack, 
  canAttack
}: TabbedCharacterPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <SimpleCreatureStats creature={creature} />;
      case 'equipment':
        return (
          <>
            <EquipmentSection 
              creature={creature} 
              onUpdate={onUpdate}
              onAttack={onAttack}
              canAttack={canAttack}
            />
            <InventorySection 
              creature={creature} 
              onUpdate={onUpdate} 
            />
          </>
        );
      case 'skills':
        return <SkillsSection creature={creature} />;
      default:
        return <SimpleCreatureStats creature={creature} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${COLORS.border}`,
        marginBottom: 12,
      }}>
        <TabButton 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </TabButton>
        <TabButton 
          active={activeTab === 'equipment'} 
          onClick={() => setActiveTab('equipment')}
        >
          Equipment
        </TabButton>
        <TabButton 
          active={activeTab === 'skills'} 
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </TabButton>
      </div>

      {/* Tab Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto' as const,
        paddingRight: 4, // Add some padding for scrollbar
      }}>
        {renderTabContent()}
      </div>

    </div>
  );
}
