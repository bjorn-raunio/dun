import React, { useState } from 'react';
import { ICreature } from '../../creatures/index';
import { TabButton } from './TabButton';
import { CreatureStats } from './CreatureStats';
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
        return <CreatureStats creature={creature} />;
      case 'equipment':
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1,
            minHeight: 0 // Allow flex item to shrink below content size
          }}>
            <div style={{ flexShrink: 0 }}>
              <EquipmentSection 
                creature={creature} 
                onUpdate={onUpdate}
                onAttack={onAttack}
                canAttack={canAttack}
              />
            </div>
            <div style={{ 
              flex: 1, 
              overflow: 'hidden', 
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <InventorySection 
                creature={creature} 
                onUpdate={onUpdate} 
              />
            </div>
          </div>
        );
      case 'skills':
        return <SkillsSection creature={creature} />;
      default:
        return <CreatureStats creature={creature} />;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1,
      marginTop: 12,
      minHeight: 0
    }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${COLORS.border}`,
        marginBottom: 8,
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
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0 // Allow flex item to shrink below content size
      }}>
        {renderTabContent()}
      </div>

    </div>
  );
}
