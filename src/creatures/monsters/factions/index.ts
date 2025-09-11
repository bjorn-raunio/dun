import { MonsterGroup } from "../Faction";
import { faction_bandits, BanditType } from "./bandits";
import { faction_undead, UndeadType } from "./undead";
import { faction_goblins, GoblinType } from "./goblins";
import { faction_orcs } from "./orcs";
import { faction_barbarians } from "./barbarians";
import { faction_demons } from "./demons";
import { faction_devastators } from "./devastators";
import { faction_ratfolk } from "./ratfolk";
import { faction_beastmen } from "./beastmen";
import { faction_catfolk } from "./catfolk";
import { faction_dogfolk } from "./dogfolk";
import { faction_darkElves } from "./darkElves";
import { faction_lizardmen } from "./lizardmen";
import { faction_dwarfs } from "./dwarfs";
import { faction_highElves } from "./highElves";
import { faction_humans } from "./humans";
import { faction_pulseEmpire } from "./pulseEmpire";
import { faction_jupitersSons } from "./jupitersSons";
import { faction_trecians } from "./trecians";
import { faction_thaiShiang } from "./thaiShiang";
import { faction_risingSun } from "./risingSun";
import { faction_corsairs } from "./corsairs";
import { faction_fomrorClans } from "./fomrorClans";
import { faction_insects } from "./insects";
import { faction_birds } from "./birds";
import { faction_vermin } from "./vermin";
import { faction_reptiles } from "./reptiles";
import { faction_caninesFelines } from "./caninesFelines";
import { faction_forests } from "./forests";
import { faction_desert } from "./desert";
import { faction_aquatic } from "./aquatic";
import { faction_trolls } from "./trolls";
import { faction_giants } from "./giants";
import { faction_dragons } from "./dragons";
import { faction_elementals } from "./elementals";
import { faction_miscellaneousCreatures } from "./miscellaneousCreatures";

// Export all faction types
export type AllMonsterTypes = BanditType | UndeadType | GoblinType;

// Export all factions
export const MONSTER_FACTIONS = {
  bandits: faction_bandits,
  undead: faction_undead,
  goblins: faction_goblins, 
  orcs: faction_orcs,
  barbarians: faction_barbarians,
  demons: faction_demons,
  devastators: faction_devastators,
  ratfolk: faction_ratfolk,
  beastmen: faction_beastmen,   
  catfolk: faction_catfolk,
  dogfolk: faction_dogfolk, 
  darkElves: faction_darkElves,
  lizardmen: faction_lizardmen, 
  dwarfs: faction_dwarfs,
  highElves: faction_highElves,
  humans: faction_humans,
  empire: faction_pulseEmpire,
  jupitersSons: faction_jupitersSons,
  trecians: faction_trecians,
  thaiShiang: faction_thaiShiang,
  risingSun: faction_risingSun,
  corsairs: faction_corsairs,
  fomrorClans: faction_fomrorClans,
  insects: faction_insects,
  birds: faction_birds,
  vermin: faction_vermin,
  reptiles: faction_reptiles,
  caninesFelines: faction_caninesFelines,
  forests: faction_forests,
  desert: faction_desert,
  aquatic: faction_aquatic,
  trolls: faction_trolls,
  giants: faction_giants,
  dragons: faction_dragons,
  elementals: faction_elementals,
  miscellaneousCreatures: faction_miscellaneousCreatures,
} as const;

// Helper function to get all monster presets from all factions
export function getAllMonsterPresets() {
  const allPresets: Record<string, any> = {};
  
  Object.values(MONSTER_FACTIONS).forEach(faction => {
    faction.monsters.forEach(monster => {
      allPresets[monster.type] = monster;
    });
  });
  
  return allPresets;
}

// Helper function to get monsters by faction
export function getMonstersByFaction(factionName: keyof typeof MONSTER_FACTIONS) {
  return MONSTER_FACTIONS[factionName].monsters;
}

// Helper function to get a specific monster preset by type
export function getMonsterPresetByType(type: AllMonsterTypes) {
  for (const faction of Object.values(MONSTER_FACTIONS)) {
    // Cast to any to avoid union type issues
    const monsters = faction.monsters as any[];
    const monster = monsters.find((m: any) => m.type === type);
    if (monster) {
      return monster;
    }
  }
  return undefined;
}
