import React from 'react';
import { ICreature } from '../../creatures/index';
import { COLORS, LAYOUT_PATTERNS, COMMON_STYLES } from '../styles';
import { RegionClass } from '../../worldmap';
import { QuestMapsList } from './QuestMapsList';

interface WorldMapCharacterBarProps {
    heroes: ICreature[];
    onSelect?: (creature: ICreature) => void;
    currentRegion?: RegionClass | null;
    onQuestMapSelect?: (questMapId: string) => void;
}

export function WorldMapCharacterBar({ heroes, onSelect, currentRegion, onQuestMapSelect }: WorldMapCharacterBarProps) {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 280,
                height: "100vh",
                ...COMMON_STYLES.panel,
                zIndex: 10,
                padding: 16,
                boxSizing: "border-box",
                overflow: "auto",
                pointerEvents: "auto",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
        >
            <div style={{ 
                ...LAYOUT_PATTERNS.flexColumn, 
                gap: 16, 
                height: '100%',
                overflow: 'hidden'
            }}>
                {/* Heroes Section - Top Half */}
                {heroes.length > 0 && (
                    <div style={{ 
                        ...LAYOUT_PATTERNS.flexColumn, 
                        gap: 12,
                        flex: '0 0 auto',
                        maxHeight: '50%',
                        overflowY: 'auto'
                    }}>
                        {heroes.map((hero) => (
                            <div
                                key={hero.id}
                                onClick={() => onSelect?.(hero)}
                                style={{
                                    ...LAYOUT_PATTERNS.flexRowCenter,
                                    gap: 12,
                                    padding: 8,
                                    ...LAYOUT_PATTERNS.card,
                                    cursor: onSelect ? "pointer" : "default",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (onSelect) {
                                        e.currentTarget.style.background = COLORS.background;
                                        e.currentTarget.style.borderColor = COLORS.borderDark;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (onSelect) {
                                        e.currentTarget.style.background = COLORS.backgroundLight;
                                        e.currentTarget.style.borderColor = COLORS.border;
                                    }
                                }}
                            >
                                {hero.image ? (
                                    <img
                                        src={process.env.PUBLIC_URL + "/" + hero.image}
                                        alt={hero.name}
                                        draggable={false}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            objectFit: "cover" as const,
                                            borderRadius: "50%",
                                            border: "2px solid #00ff00",
                                            filter: hero.isDead() ? "grayscale(100%)" : "none",
                                            opacity: hero.isDead() ? 0.6 : 1
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        background: COLORS.hero,
                                        border: "2px solid #fff",
                                        filter: hero.isDead() ? "grayscale(100%)" : "none",
                                        opacity: hero.isDead() ? 0.6 : 1
                                    }} />
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {hero.name}
                                    </div>

                                    <div style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.4 }}>
                                        <div>
                                            Vitality: <strong style={{
                                                color: hero.isDead() ? COLORS.error :
                                                    hero.isWounded() ? COLORS.warning : COLORS.text
                                            }}>
                                                {hero.remainingVitality}/{hero.vitality}
                                            </strong>
                                        </div>
                                        <div>
                                            Mana: <strong>
                                                {hero.mana > 0 ? `${hero.remainingMana}/${hero.mana}` : '-'}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quest Maps Section - Bottom Half */}
                <div style={{ 
                    flex: '1 1 auto',
                    minHeight: 0,
                    overflow: 'hidden'
                }}>
                    <QuestMapsList 
                        currentRegion={currentRegion || null}
                        onQuestMapSelect={onQuestMapSelect}
                    />
                </div>
            </div>
        </div>
    );
}
