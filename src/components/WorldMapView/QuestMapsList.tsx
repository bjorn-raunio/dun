import React from 'react';
import { COLORS, LAYOUT_PATTERNS, COMMON_STYLES } from '../styles';
import { RegionClass } from '../../worldmap';
import { questMapPresets } from '../../maps/presets/questMapPresets';

interface QuestMapsListProps {
  currentRegion: RegionClass | null;
  onQuestMapSelect?: (questMapId: string) => void;
}

export function QuestMapsList({ currentRegion, onQuestMapSelect }: QuestMapsListProps) {
  if (!currentRegion || !currentRegion.questMapPresets || currentRegion.questMapPresets.length === 0) {
    return (
      <div style={{
        ...LAYOUT_PATTERNS.flexColumn,
        gap: 8,
        padding: 12,
        ...COMMON_STYLES.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        background: COLORS.backgroundLight,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 4,
        }}>
          Locations
        </div>
        <div style={{
          fontSize: 12,
          color: COLORS.textMuted,
          fontStyle: 'italic',
        }}>
        </div>
      </div>
    );
  }

  const availableQuestMaps = currentRegion.questMapPresets
    .map(presetId => questMapPresets[presetId])
    .filter(Boolean);

  return (
    <div style={{
      ...LAYOUT_PATTERNS.flexColumn,
      gap: 8,
      padding: 12,
      ...COMMON_STYLES.panel,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      background: COLORS.backgroundLight,
    }}>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: COLORS.text,
        marginBottom: 4,
      }}>
        Locations
      </div>
      
      <div style={{
        ...LAYOUT_PATTERNS.flexColumn,
        gap: 6,
        maxHeight: 200,
        overflowY: 'auto',
      }}>
        {availableQuestMaps.map((questMap) => (
          <div
            key={questMap.name}
            onClick={() => onQuestMapSelect?.(currentRegion.questMapPresets!.find(id => questMapPresets[id] === questMap)!)}
            style={{
              ...LAYOUT_PATTERNS.flexColumn,
              gap: 4,
              padding: 8,
              ...LAYOUT_PATTERNS.card,
              cursor: onQuestMapSelect ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              background: COLORS.background,
            }}
            onMouseEnter={(e) => {
              if (onQuestMapSelect) {
                e.currentTarget.style.background = COLORS.backgroundLight;
                e.currentTarget.style.borderColor = COLORS.borderDark;
              }
            }}
            onMouseLeave={(e) => {
              if (onQuestMapSelect) {
                e.currentTarget.style.background = COLORS.background;
                e.currentTarget.style.borderColor = COLORS.border;
              }
            }}
          >
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {questMap.name}
            </div>                    
          </div>
        ))}
      </div>
    </div>
  );
}
