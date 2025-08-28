import React from "react";
import logo from './logo.svg';
import './App.css';

// --- Kartdefinition med olika rumstyper ---
type RoomType = {
  type: string; // t.ex. "room1", "room2", "corridor"
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  rotation?: 0 | 90 | 180 | 270; // Ny egenskap för rotation
};

type Terrain = {
  // Either use a reusable preset (preferred) or a raw type key
  preset?: string; // references a reusable terrain type definition
  type?: string; // legacy key; will be looked up in presets if present
  x?: number; // optional for preset definitions
  y?: number; // optional for preset definitions
  mapWidth?: number; // can be overridden; falls back to preset
  mapHeight?: number; // can be overridden; falls back to preset
  rotation?: 0 | 90 | 180 | 270;
  image?: string; // override image if desired
  height?: number; // optional vertical height/elevation of terrain
};

type CreatureBase = {
  id: string;
  name: string;
  x: number; // tile-koordinat (övre vänstra hörn)
  y: number; // tile-koordinat (övre vänstra hörn)
  image?: string; // valfritt, t.ex. "goblin.png"
  movement: number; // antal tiles varelse kan röra sig
  remainingMovement?: number; // återstående rörelse för denna runda
  attacks: number; // antal attacker per runda
  remainingAttacks?: number; // återstående attacker för denna runda
  mapWidth?: number; // default 1 tile bred
  mapHeight?: number; // default 1 tile hög
  size: "small" | "medium" | "large" | "huge";
  inventory: Item[];
  equipment: {
    mainHand?: Weapon | RangedWeapon;
    offHand?: Weapon | Armor; // shield considered Armor with armorType "shield"
    armor?: Armor;
    ranged?: RangedWeapon;
  };
  combat: number;
  ranged: number;
  strength: number;
  vitality: number;
};

type Hero = CreatureBase & { kind: "hero" };

type Monster = CreatureBase & { kind: "monster" };

type Creature = Hero | Monster;

// --- Items class hierarchy ---
class Item {
  id: string;
  name: string;
  weight?: number;
  value?: number;

  constructor(params: { id: string; name: string; weight?: number; value?: number }) {
    this.id = params.id;
    this.name = params.name;
    this.weight = params.weight;
    this.value = params.value;
  }
}

class Weapon extends Item {
  kind: "weapon" = "weapon";
  damage: number; // average or fixed damage value
  hands: 1 | 2;
  reach?: number; // in tiles or feet
  properties?: string[];

  constructor(params: {
    id: string;
    name: string;
    damage: number;
    hands: 1 | 2;
    reach?: number;
    properties?: string[];
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.damage = params.damage;
    this.hands = params.hands;
    this.reach = params.reach;
    this.properties = params.properties;
  }
}

class RangedWeapon extends Item {
  kind: "ranged_weapon" = "ranged_weapon";
  damage: number;
  range: { normal: number; long: number }; // e.g., tiles or feet
  ammoType?: string;
  hands: 1 | 2;
  properties?: string[];

  constructor(params: {
    id: string;
    name: string;
    damage: number;
    range: { normal: number; long: number };
    hands: 1 | 2;
    ammoType?: string;
    properties?: string[];
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.damage = params.damage;
    this.range = params.range;
    this.hands = params.hands;
    this.ammoType = params.ammoType;
    this.properties = params.properties;
  }
}

class Armor extends Item {
  kind: "armor" = "armor";
  armorClass: number; // base AC or bonus
  armorType: "light" | "medium" | "heavy" | "shield";
  stealthDisadvantage?: boolean;
  strengthRequirement?: number;

  constructor(params: {
    id: string;
    name: string;
    armorClass: number;
    armorType: "light" | "medium" | "heavy" | "shield";
    stealthDisadvantage?: boolean;
    strengthRequirement?: number;
    weight?: number;
    value?: number;
  }) {
    super({ id: params.id, name: params.name, weight: params.weight, value: params.value });
    this.armorClass = params.armorClass;
    this.armorType = params.armorType;
    this.stealthDisadvantage = params.stealthDisadvantage;
    this.strengthRequirement = params.strengthRequirement;
  }
}
// --- end Items class hierarchy ---

// --- Reusable item presets and factories ---
type WeaponPreset = { name: string; damage: number; hands: 1 | 2; reach?: number; properties?: string[]; weight?: number; value?: number };
const weaponPresets: Record<string, WeaponPreset> = {
  dagger: { name: "Dagger", damage: 4, hands: 1, properties: ["finesse", "light", "thrown"], weight: 1, value: 2 },
  scimitar: { name: "Scimitar", damage: 6, hands: 1, properties: ["finesse", "light"], weight: 3, value: 25 },
  longsword: { name: "Longsword", damage: 8, hands: 1, properties: ["versatile"], weight: 3, value: 15 },
};

function createWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof Weapon>[0]> & { id: string }): Weapon {
  const p = weaponPresets[presetId];
  const id = overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`;
  return new Weapon({
    id,
    name: overrides?.name ?? p.name,
    damage: overrides?.damage ?? p.damage,
    hands: overrides?.hands ?? p.hands,
    reach: overrides?.reach ?? p.reach,
    properties: overrides?.properties ?? p.properties,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}

type RangedWeaponPreset = { name: string; damage: number; range: { normal: number; long: number }; hands: 1 | 2; ammoType?: string; properties?: string[]; weight?: number; value?: number };
const rangedPresets: Record<string, RangedWeaponPreset> = {
  shortbow: { name: "Shortbow", damage: 6, range: { normal: 16, long: 64 }, hands: 2, properties: ["ammunition", "two-handed"], weight: 2, value: 25 },
  longbow: { name: "Longbow", damage: 8, range: { normal: 20, long: 80 }, hands: 2, properties: ["ammunition", "heavy", "two-handed"], weight: 2, value: 50 },
};

function createRangedWeapon(presetId: string, overrides?: Partial<ConstructorParameters<typeof RangedWeapon>[0]> & { id: string }): RangedWeapon {
  const p = rangedPresets[presetId];
  const id = overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`;
  return new RangedWeapon({
    id,
    name: overrides?.name ?? p.name,
    damage: overrides?.damage ?? p.damage,
    range: overrides?.range ?? p.range,
    hands: overrides?.hands ?? p.hands,
    ammoType: overrides?.ammoType ?? p.ammoType,
    properties: overrides?.properties ?? p.properties,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}

type ArmorPreset = { name: string; armorClass: number; armorType: "light" | "medium" | "heavy" | "shield"; stealthDisadvantage?: boolean; strengthRequirement?: number; weight?: number; value?: number };
const armorPresets: Record<string, ArmorPreset> = {
  leather: { name: "Leather Armor", armorClass: 11, armorType: "light", weight: 10, value: 10 },
  chainMail: { name: "Chain Mail", armorClass: 16, armorType: "heavy", strengthRequirement: 13, stealthDisadvantage: true, weight: 55, value: 75 },
  shield: { name: "Shield", armorClass: 2, armorType: "shield", weight: 6, value: 10 },
};

function createArmor(presetId: string, overrides?: Partial<ConstructorParameters<typeof Armor>[0]> & { id: string }): Armor {
  const p = armorPresets[presetId];
  const id = overrides?.id ?? `${presetId}-${Math.random().toString(36).slice(2, 8)}`;
  return new Armor({
    id,
    name: overrides?.name ?? p.name,
    armorClass: overrides?.armorClass ?? p.armorClass,
    armorType: overrides?.armorType ?? p.armorType,
    stealthDisadvantage: overrides?.stealthDisadvantage ?? p.stealthDisadvantage,
    strengthRequirement: overrides?.strengthRequirement ?? p.strengthRequirement,
    weight: overrides?.weight ?? p.weight,
    value: overrides?.value ?? p.value,
  });
}
// --- end reusable item presets ---

const mapDefinition = {
  name: "Exempelkarta med rumstyper",
  description: "En karta med olika rumstyper och korridorer.",
  width: 40,
  height: 30,
  rooms: [
    { type: "room3", x: 0, y: 0, mapWidth: 8, mapHeight: 10, rotation: 270 },
    { type: "room4", x: 10, y: 0, mapWidth: 8, mapHeight: 10, rotation: 90 },
  ] as RoomType[],
  terrain: [
    { preset: "tree", x: 10, y: 5 },
    { preset: "tree", x: 12, y: 1 },
    { preset: "tree", x: 17, y: 1 },
    { preset: "wagon", x: 16, y: 4, rotation: 90 },
    { preset: "horse", x: 18, y: 4, rotation: 270 },
  ] as Terrain[],
  creatures: [
    {
      id: "c1",
      name: "Bandit",
      x: 5,
      y: 5,
      image: "creature_bandit.png",
      movement: 6,
      remainingMovement: 6,
      attacks: 1,
      remainingAttacks: 1,
      kind: "monster",
      mapWidth: 1,
      mapHeight: 1,
      size: "medium",
      inventory: [
        createWeapon("scimitar", { id: "w1" }),
        createArmor("leather", { id: "a1" }),
      ],
      equipment: {
        mainHand: createWeapon("dagger", { id: "w1e" }),
        armor: createArmor("leather", { id: "a1e" }),
      },
      combat: 3,
      ranged: 1,
      strength: 2,
      vitality: 2,
    },
    {
      id: "c2",
      name: "Knight",
      x: 1,
      y: 1,
      image: "creature_knight.png",
      movement: 5,
      remainingMovement: 5,
      attacks: 2,
      remainingAttacks: 2,
      kind: "hero",
      mapWidth: 1,
      mapHeight: 1,
      size: "medium",
      inventory: [
        createRangedWeapon("longbow", { id: "r1" }),
        createArmor("shield", { id: "s1" }),
      ],
      equipment: {
        mainHand: createWeapon("longsword", { id: "sw1" }),
        offHand: createArmor("shield", { id: "sh1" }),
        armor: createArmor("chainMail", { id: "pl1" }),
      },
      combat: 4,
      ranged: 2,
      strength: 4,
      vitality: 5,
    },
  ] as Creature[],
};

// --- Generera tiles utifrån kartdefinition ---
const typeToImage: Record<string, string> = {
  room1: "room1.jpg",
  room2: "room2.jpg",
  room3: "room3.jpg",
  room4: "room4.jpg",
  corridor: "corridor1.jpg",
};

// Reusable terrain presets (use Terrain type)
const terrainPresets: Record<string, Terrain> = {
  tree: { image: "", mapWidth: 2, mapHeight: 2, height: 4 },
  wagon: { image: "wagon.jpg", mapWidth: 1, mapHeight: 2, height: 1 },
  horse: { image: "horse.jpg", mapWidth: 1, mapHeight: 2, height: 1 },
};

function resolveTerrain(t: Terrain) {
  const key = t.preset || t.type || "";
  const preset = key ? terrainPresets[key] : undefined;
  const image = t.image ?? preset?.image ?? "";
  const mapWidth = (typeof t.mapWidth === "number" ? t.mapWidth : (preset?.mapWidth ?? 1));
  const mapHeight = (typeof t.mapHeight === "number" ? t.mapHeight : (preset?.mapHeight ?? 1));
  const height = (typeof t.height === "number" ? t.height : (typeof preset?.height === "number" ? preset!.height! : 1));
  return { key, image, mapWidth, mapHeight, height, rotation: t.rotation ?? 0, x: t.x ?? 0, y: t.y ?? 0 };
}

function generateTilesFromDefinition(def: typeof mapDefinition): string[][] {
  const tiles = Array.from({ length: def.height }, () => Array(def.width).fill("empty.jpg"));
  for (const room of def.rooms) {
    const isRotated = room.rotation === 90 || room.rotation === 270;
    const w = isRotated ? room.mapHeight : room.mapWidth;
    const h = isRotated ? room.mapWidth : room.mapHeight;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const y = room.y + dy;
        const x = room.x + dx;
        if (y < def.height && x < def.width) {
          tiles[y][x] = typeToImage[room.type] || "empty.jpg";
        }
      }
    }
  }
  return tiles;
}

const tileMapData = {
  name: mapDefinition.name,
  description: mapDefinition.description,
  tiles: generateTilesFromDefinition(mapDefinition),
};

const TILE_SIZE = 50;

function TileMapView({ mapData }: { mapData: typeof tileMapData }) {
  // --- Hämta rum/korridor-data om det finns ---
  const mapDef = mapDefinition; // Används för att hitta rum/korridor-block

  // Creature state (rörlig layer)
  const [creatures, setCreatures] = React.useState(mapDefinition.creatures);
  const [selectedCreatureId, setSelectedCreatureId] = React.useState<string | null>(null);
  const [targetsInRangeIds, setTargetsInRangeIds] = React.useState<Set<string>>(new Set());
  const [messages, setMessages] = React.useState<string[]>(["Welcome to the map."]);

  // Håll koll på vilka tiles som redan är renderade som del av ett block
  const rendered: boolean[][] = Array.from({ length: mapData.tiles.length }, () => Array(mapData.tiles[0].length).fill(false));

  // Hjälpfunktion för att hitta om detta är top-left på ett block och dess storlek
  function getBlockAt(x: number, y: number): RoomType | null {
    for (const room of mapDefinition.rooms) {
      if (room.x === x && room.y === y) return room;
    }
    return null;
  }

  const rows = mapData.tiles.length;
  const cols = mapData.tiles[0].length;
  const gridItems: React.ReactNode[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (rendered[y][x]) continue;
      const block = getBlockAt(x, y);
      if (block) {
        // Justera width/height för rotation
        const isRotated = block.rotation === 90 || block.rotation === 270;
        const blockWidth = isRotated ? block.mapHeight : block.mapWidth;
        const blockHeight = isRotated ? block.mapWidth : block.mapHeight;
        // Markera alla tiles i blocket som renderade
        for (let dy = 0; dy < blockHeight; dy++) {
          for (let dx = 0; dx < blockWidth; dx++) {
            if (
              y + dy < rows &&
              x + dx < cols &&
              mapData.tiles[y + dy][x + dx] === typeToImage[block.type]
            ) {
              rendered[y + dy][x + dx] = true;
            }
          }
        }
        const wrapperWidth = TILE_SIZE * blockWidth;
        const wrapperHeight = TILE_SIZE * blockHeight;
        // Inre wrapper storlek före rotation
        const innerWidth = (block.rotation === 90 || block.rotation === 270) ? wrapperHeight : wrapperWidth;
        const innerHeight = (block.rotation === 90 || block.rotation === 270) ? wrapperWidth : wrapperHeight;
        gridItems.push(
          <div
            key={`${block.type}-${x}-${y}`}
            style={{
              gridColumn: `${x + 1} / span ${blockWidth}`,
              gridRow: `${y + 1} / span ${blockHeight}`,
              width: wrapperWidth,
              height: wrapperHeight,
              border: "1px solid #444",
              boxSizing: "border-box",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: innerWidth,
                height: innerHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform:
                  block.rotation === 90
                    ? `rotate(90deg)`
                    : block.rotation === 180
                    ? `rotate(180deg)`
                    : block.rotation === 270
                    ? `rotate(270deg)`
                    : undefined,
                transformOrigin: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                translate: "-50% -50%",
                transition: "transform 0.2s",
              }}
            >
              <img
                src={process.env.PUBLIC_URL + "/" + typeToImage[block.type]}
                alt={block.type}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  display: "block",
                  pointerEvents: "none",
                }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          </div>
        );
      } else {
        // Rendera endast tomma tiles som bakgrunds-rutor (om så önskas)
      }
    }
  }

  // --- FÖNSTERSTORLEK ---
  const [viewport, setViewport] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    function handleResize() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // --- SLUT FÖNSTERSTORLEK ---

  // --- PANNING LOGIK (optimerad) ---
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const panStart = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = React.useRef<HTMLDivElement>(null);
  const livePan = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafId = React.useRef<number | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const dragMoved = React.useRef<{dx: number; dy: number}>({dx: 0, dy: 0});

  // Sätt panRef till aktuell pan när React renderar
  React.useEffect(() => {
    livePan.current = { ...pan };
    if (panRef.current) {
      panRef.current.style.transform = `translate(${pan.x}px, ${pan.y}px)`;
    }
  }, [pan]);

  // Hjälp: Chebyshev-avstånd mellan två rektanglar (storleksmedveten, på tile-grid)
  function chebyshevDistanceRect(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): number {
    const aRight = ax + aw - 1;
    const aBottom = ay + ah - 1;
    const bRight = bx + bw - 1;
    const bBottom = by + bh - 1;
    const dx = Math.max(0, Math.max(bx - aRight, ax - bRight));
    const dy = Math.max(0, Math.max(by - aBottom, ay - bBottom));
    return Math.max(dx, dy);
  }

  function rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  // Räkna ut mål i räckvidd när en hjälte väljs eller listan ändras
  React.useEffect(() => {
    const sel = creatures.find(c => c.id === selectedCreatureId);
    if (!sel || sel.kind !== "hero") {
      setTargetsInRangeIds(new Set());
      return;
    }
    // Bestäm vapnets räckvidd (tiles)
    let rangeTiles = 1;
    let isRanged = false;
    const main = sel.equipment.mainHand;
    const ranged = sel.equipment.ranged;
    if (main instanceof Weapon) {
      rangeTiles = Math.max(1, main.reach ?? 1);
    } else if (main instanceof RangedWeapon) {
      isRanged = true;
      rangeTiles = Math.max(1, main.range.normal);
    } else if (ranged instanceof RangedWeapon) {
      isRanged = true;
      rangeTiles = Math.max(1, ranged.range.normal);
    }

    const selDims = (sel.size === "large" || sel.size === "huge") ? { w: 2, h: 2 } : { w: 1, h: 1 };
    const inRange = new Set<string>();
    for (const m of creatures) {
      if (m.kind !== "monster") continue;
      const mDims = (m.size === "large" || m.size === "huge") ? { w: 2, h: 2 } : { w: 1, h: 1 };
      const dist = chebyshevDistanceRect(sel.x, sel.y, selDims.w, selDims.h, m.x, m.y, mDims.w, mDims.h);
      if (dist <= rangeTiles) inRange.add(m.id);
    }
    setTargetsInRangeIds(inRange);
  }, [selectedCreatureId, creatures]);

  // Beräkna möjliga rutor för vald varelse
  const reachable = React.useMemo(() => {
    if (!selectedCreatureId) return { tiles: [] as Array<{x: number; y: number}>, costMap: new Map<string, number>() };
    const selected = creatures.find(c => c.id === selectedCreatureId);
    if (!selected || selected.kind !== "hero") return { tiles: [] as Array<{x: number; y: number}>, costMap: new Map<string, number>() };

    const selectedDims = (() => {
      const s = selected.size;
      if (s === "large" || s === "huge") return { w: 2, h: 2 };
      return { w: 1, h: 1 };
    })();

    // Helper: terrain height at tile (max of overlapping features)
    function terrainHeightAt(tx: number, ty: number): number {
      let h = 0;
      for (const t of mapDefinition.terrain) {
        const rt = resolveTerrain(t);
        const isRot = rt.rotation === 90 || rt.rotation === 270;
        const w = isRot ? rt.mapHeight : rt.mapWidth;
        const hgt = isRot ? rt.mapWidth : rt.mapHeight;
        if (tx >= rt.x && tx < rt.x + w && ty >= rt.y && ty < rt.y + hgt) {
          h = Math.max(h, rt.height ?? 1);
        }
      }
      return h;
    }

    function rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    // Check if area has at least one clear tile to stand on; optionally prevent overlapping creatures
    function areaStandable(tx: number, ty: number, dims: {w: number; h: number}, considerCreatures: boolean): boolean {
      if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return false;
      let hasStandTile = false;
      for (let oy = 0; oy < dims.h; oy++) {
        for (let ox = 0; ox < dims.w; ox++) {
          const cx = tx + ox;
          const cy = ty + oy;
          const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
          const lowTerrain = terrainHeightAt(cx, cy) <= 1;
          if (nonEmpty && lowTerrain) {
            hasStandTile = true;
          }
        }
      }
      if (!hasStandTile) return false;
      if (considerCreatures) {
        for (const c of creatures) {
          if (c.id === selectedCreatureId) continue;
          const cdims = (c.size === "large" || c.size === "huge") ? { w: 2, h: 2 } : { w: 1, h: 1 };
          if (rectsOverlap(tx, ty, dims.w, dims.h, c.x, c.y, cdims.w, cdims.h)) return false;
        }
      }
      return true;
    }

    // Blockerar diagonaler om någon tile i området är tom eller har height >= 1 (ignorerar varelser)
    function areaBlocksDiagonal(tx: number, ty: number, dims: {w: number; h: number}): boolean {
      if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return true;
      for (let oy = 0; oy < dims.h; oy++) {
        for (let ox = 0; ox < dims.w; ox++) {
          const cx = tx + ox;
          const cy = ty + oy;
          const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
          const th = terrainHeightAt(cx, cy);
          if (!nonEmpty || th >= 1) return true;
        }
      }
      return false;
    }

    // Rörelsekostnad för att kliva in i en area: bas 1, +1 om någon tile har height==1
    function moveCostInto(tx: number, ty: number, dims: {w: number; h: number}): number {
      if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return Infinity;
      let hasStandTile = false;
      let extra = 0;
      for (let oy = 0; oy < dims.h; oy++) {
        for (let ox = 0; ox < dims.w; ox++) {
          const cx = tx + ox;
          const cy = ty + oy;
          const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
          const th = terrainHeightAt(cx, cy);
          if (th > 1) return Infinity;
          if (nonEmpty) hasStandTile = true;
          if (th === 1) extra = 1; // om någon tile är height 1, kostar +1
        }
      }
      if (!hasStandTile) return Infinity;
      return 1 + extra;
    }

    // Hjälpare: max terränghöjd i en area (0 om ingen terräng), och om area innehåller tomma tiles
    function areaStats(tx: number, ty: number, dims: {w: number; h: number}) {
      let maxH = 0;
      let hasEmpty = false;
      if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return { maxH: Infinity, hasEmpty: true };
      for (let oy = 0; oy < dims.h; oy++) {
        for (let ox = 0; ox < dims.w; ox++) {
          const cx = tx + ox;
          const cy = ty + oy;
          const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
          if (!nonEmpty) hasEmpty = true;
          const th = terrainHeightAt(cx, cy);
          if (th > maxH) maxH = th;
        }
      }
      return { maxH, hasEmpty };
    }

    // Dijkstra-liknande sökning med 8 riktningar och hörnregel
    const maxBudget = selected.remainingMovement ?? selected.movement;
    const dist = new Map<string, number>();
    const result: Array<{x: number; y: number}> = [];
    const cmp = (a: {x:number;y:number;cost:number}, b: {x:number;y:number;cost:number}) => a.cost - b.cost;
    const pq: Array<{x:number;y:number;cost:number}> = [{ x: selected.x, y: selected.y, cost: 0 }];
    dist.set(`${selected.x},${selected.y}`, 0);

    const directions = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ];

    while (pq.length) {
      // Pop min-cost
      pq.sort(cmp);
      const current = pq.shift()!;
      if (current.cost > maxBudget) continue;
      // Lägg inte till startpositionen i result
      if (!(current.x === selected.x && current.y === selected.y)) {
        result.push({ x: current.x, y: current.y });
      }
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        // hörnregel för diagonal (ignorera varelser, blockera om ortogonal area är tom eller har annan höjd än destinationens höjd)
        if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
          // Beräkna destinationens maxhöjd (0 om plant, 1 om låg terräng etc.)
          const destStats = areaStats(nx, ny, selectedDims);
          if (destStats.hasEmpty && destStats.maxH === 0) {
            // tomma delar i destination är tillåtna så länge minst en standable, men för hörnkontroll behandlar vi som höjd 0
          }
          const destHeight = destStats.maxH === Infinity ? 0 : destStats.maxH;

          const sideA = areaStats(current.x + dx, current.y, selectedDims);
          const sideB = areaStats(current.x, current.y + dy, selectedDims);

          const sideABlocks = sideA.hasEmpty || (sideA.maxH >= 1 && sideA.maxH !== destHeight);
          const sideBBlocks = sideB.hasEmpty || (sideB.maxH >= 1 && sideB.maxH !== destHeight);
          if (sideABlocks || sideBBlocks) continue;
        }

        // kostnad och passbarhet (inkl. att inte överlappa andra varelser)
        const stepCost = moveCostInto(nx, ny, selectedDims);
        if (!isFinite(stepCost)) continue;
        if (!areaStandable(nx, ny, selectedDims, true)) continue;
        const newCost = current.cost + stepCost;
        if (newCost > maxBudget) continue;
        const key = `${nx},${ny}`;
        if (newCost < (dist.get(key) ?? Infinity)) {
          dist.set(key, newCost);
          pq.push({ x: nx, y: ny, cost: newCost });
        }
      }
    }

    return { tiles: result, costMap: dist };
  }, [selectedCreatureId, creatures, cols, rows, mapData.tiles]);

  const selectedCreature = React.useMemo(() => {
    return creatures.find(c => c.id === selectedCreatureId) || null;
  }, [selectedCreatureId, creatures]);

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...livePan.current };
    dragMoved.current = {dx: 0, dy: 0};
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragMoved.current = {dx, dy};
    const newPan = { x: panStart.current.x + dx, y: panStart.current.y + dy };
    livePan.current = newPan;
    if (rafId.current === null) {
      rafId.current = window.requestAnimationFrame(() => {
        if (panRef.current) {
          panRef.current.style.transform = `translate(${livePan.current.x}px, ${livePan.current.y}px)`;
        }
        rafId.current = null;
      });
    }
  }

  function tileFromPointer(clientX: number, clientY: number) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const worldX = x - livePan.current.x;
    const worldY = y - livePan.current.y;
    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);
    if (tileX < 0 || tileY < 0 || tileX >= cols || tileY >= rows) return null;
    return { tileX, tileY };
  }

  function onMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    const wasDrag = Math.hypot(dragMoved.current.dx, dragMoved.current.dy) > 3;
    setDragging(false);
    setPan({ ...livePan.current }); // Spara slutposition i React state
    dragStart.current = null;

    // Helper: terrain height at tile
    function terrainHeightAt(tx: number, ty: number): number {
      let h = 0;
      for (const t of mapDefinition.terrain) {
        const rt = resolveTerrain(t);
        const isRot = rt.rotation === 90 || rt.rotation === 270;
        const w = isRot ? rt.mapHeight : rt.mapWidth;
        const hgt = isRot ? rt.mapWidth : rt.mapHeight;
        if (tx >= rt.x && tx < rt.x + w && ty >= rt.y && ty < rt.y + hgt) {
          h = Math.max(h, rt.height ?? 1);
        }
      }
      return h;
    }

    function rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function areaStandable(tx: number, ty: number, dims: {w: number; h: number}, considerCreatures: boolean): boolean {
      if (tx < 0 || ty < 0 || tx + dims.w > cols || ty + dims.h > rows) return false;
      let hasStandTile = false;
      for (let oy = 0; oy < dims.h; oy++) {
        for (let ox = 0; ox < dims.w; ox++) {
          const cx = tx + ox;
          const cy = ty + oy;
          const nonEmpty = mapData.tiles[cy]?.[cx] && mapData.tiles[cy][cx] !== "empty.jpg";
          const lowTerrain = terrainHeightAt(cx, cy) <= 1;
          if (nonEmpty && lowTerrain) {
            hasStandTile = true;
          }
        }
      }
      if (!hasStandTile) return false;
      if (considerCreatures) {
        for (const c of creatures) {
          if (!selectedCreatureId || c.id === selectedCreatureId) continue;
          const cdims = (c.size === "large" || c.size === "huge") ? { w: 2, h: 2 } : { w: 1, h: 1 };
          if (rectsOverlap(tx, ty, dims.w, dims.h, c.x, c.y, cdims.w, cdims.h)) return false;
        }
      }
      return true;
    }

    // Om det inte var en drag, tolka som klick i vyn
    if (!wasDrag) {
      const pos = tileFromPointer(e.clientX, e.clientY);
      if (pos && selectedCreatureId) {
        const selected = creatures.find(c => c.id === selectedCreatureId);
        if (!selected || selected.kind !== "hero") {
          // behåll nuvarande selektion
          return;
        }

        const dims = (selected.size === "large" || selected.size === "huge") ? { w: 2, h: 2 } : { w: 1, h: 1 };

        const reachableKeySet = new Set(reachable.tiles.map(t => `${t.x},${t.y}`));
        const destKey = `${pos.tileX},${pos.tileY}`;

        let moved = false;
        if (reachableKeySet.has(destKey) && areaStandable(pos.tileX, pos.tileY, dims, true)) {
          const moveCost = (reachable.costMap.get(destKey) ?? 0);
          setCreatures(prev => prev.map(c => {
            if (c.id !== selectedCreatureId) return c;
            const budget = c.remainingMovement ?? c.movement;
            const newRemaining = Math.max(0, budget - moveCost);
            moved = true;
            return { ...c, x: pos.tileX, y: pos.tileY, remainingMovement: newRemaining } as typeof c;
          }));
        }
        if (moved) {
          setSelectedCreatureId(null);
        }
      }
    }
  }
  function onMouseLeave() {
    setDragging(false);
    setPan({ ...livePan.current });
    dragStart.current = null;
  }
  // --- SLUT PANNING LOGIK ---

  return (
    <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0, overflow: "hidden" }}>
      <div
        ref={viewportRef}
        style={{
          width: viewport.width,
          height: viewport.height,
          overflow: "hidden",
          border: "none",
          background: "#222",
          position: "relative",
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <div
          ref={panRef}
          style={{
            // transform sätts direkt i JS ovan
            width: TILE_SIZE * cols,
            height: TILE_SIZE * rows,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${rows}, ${TILE_SIZE}px)`,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {gridItems}
          {/* Terrain overlay (between rooms and creatures) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: TILE_SIZE * cols,
              height: TILE_SIZE * rows,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {mapDefinition.terrain.map((t, idx) => {
              const rt = resolveTerrain(t);
              const isRot = rt.rotation === 90 || rt.rotation === 270;
              const blockW = isRot ? rt.mapHeight : rt.mapWidth; // tiles occupied horizontally after rotation
              const blockH = isRot ? rt.mapWidth : rt.mapHeight;  // tiles occupied vertically after rotation
              const wrapperW = blockW * TILE_SIZE;
              const wrapperH = blockH * TILE_SIZE;
              const innerW = isRot ? wrapperH : wrapperW;
              const innerH = isRot ? wrapperW : wrapperH;
              return (
                <div
                  key={`terrain-${idx}`}
                  style={{
                    position: "absolute",
                    left: rt.x * TILE_SIZE,
                    top: rt.y * TILE_SIZE,
                    width: wrapperW,
                    height: wrapperH,
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      width: innerW,
                      height: innerH,
                      transform:
                        rt.rotation === 90
                          ? `rotate(90deg)`
                          : rt.rotation === 180
                          ? `rotate(180deg)`
                          : rt.rotation === 270
                          ? `rotate(270deg)`
                          : undefined,
                      transformOrigin: "center",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      translate: "-50% -50%",
                    }}
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/" + (rt.image || "terrain_unknown.png")}
                      alt={rt.key}
                      draggable={false}
                      style={{ width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", opacity: 0.9, display: "block" }}
                      onError={(e) => ((e.currentTarget.style.display = "none"))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Reachable tiles overlay */}
          {selectedCreatureId ? (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: TILE_SIZE * cols,
                height: TILE_SIZE * rows,
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              {reachable.tiles.map((t) => (
                <div
                  key={`reach-${t.x}-${t.y}`}
                  style={{
                    position: "absolute",
                    left: t.x * TILE_SIZE,
                    top: t.y * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    background: "rgba(0, 229, 255, 0.25)",
                    boxShadow: "inset 0 0 0 2px rgba(0, 229, 255, 0.7)",
                    borderRadius: 6,
                    pointerEvents: "none",
                  }}
                />)
              )}
            </div>
          ) : null}
          {/* Creatures overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: TILE_SIZE * cols,
              height: TILE_SIZE * rows,
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            {creatures.map((cr) => (
              <div
                key={cr.id}
                title={cr.name}
                onClick={(e) => {
                  e.stopPropagation();
                  const selected = creatures.find(c => c.id === selectedCreatureId);

                  // If a hero is selected and the clicked creature is a monster, handle attack and EXIT
                  if (selected && selected.kind === "hero" && cr.kind === "monster") {
                    if (!targetsInRangeIds.has(cr.id)) {
                      setMessages(m => [
                        `${selected.name} cannot reach ${cr.name}.`,
                        ...m,
                      ].slice(0, 50));
                      return; // keep hero selected
                    }
                    const remainingAttacks = selected.remainingAttacks ?? selected.attacks;
                    if (remainingAttacks <= 0) {
                      setMessages(m => [
                        `${selected.name} has no attacks remaining.`,
                        ...m,
                      ].slice(0, 50));
                      return; // keep hero selected
                    }
                    // Determine weapon and attack bonus
                    const main = selected.equipment.mainHand;
                    const ranged = selected.equipment.ranged;
                    const isRanged = main instanceof RangedWeapon || (!(main instanceof Weapon) && ranged instanceof RangedWeapon);
                    const atkBonus = isRanged ? selected.ranged : selected.combat;
                    const weapon = (main instanceof Weapon || main instanceof RangedWeapon) ? main : ranged;
                    const dmg = weapon ? (weapon as any).damage as number : 1;
                    const roll = rollD20();
                    const total = roll + atkBonus;
                    const defense = 10 + cr.combat; // simple defense formula
                    const hit = total >= defense;
                    const dmgText = hit ? ` Damage: ${dmg}.` : "";
                    setMessages(m => [
                      `${selected.name} attacks ${cr.name}: d20 ${roll} + ${atkBonus} = ${total} vs ${defense} → ${hit ? "HIT" : "MISS"}.${dmgText}`,
                      ...m,
                    ].slice(0, 50));
                    // Spend one attack
                    setCreatures(prev => prev.map(c => c.id === selected.id ? { ...c, remainingAttacks: (remainingAttacks - 1) } : c));
                    return; // DO NOT fall through to selection change
                  }

                  // If clicking a hero (or nothing selected), select clicked creature
                  setSelectedCreatureId(cr.id);
                }}
                style={{
                  position: "absolute",
                  left: cr.x * TILE_SIZE,
                  top: cr.y * TILE_SIZE,
                  width: ((cr.size === "large" || cr.size === "huge") ? 2 : 1) * TILE_SIZE,
                  height: ((cr.size === "large" || cr.size === "huge") ? 2 : 1) * TILE_SIZE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "auto",
                  boxShadow: selectedCreatureId === cr.id ? "0 0 0 3px #00e5ff inset, 0 0 8px #00e5ff" : undefined,
                  borderRadius: "50%",
                  cursor: (() => {
                    const selected = creatures.find(c => c.id === selectedCreatureId);
                    if (selected && selected.kind === "hero" && cr.kind === "monster") {
                      return targetsInRangeIds.has(cr.id) ? "crosshair" : "not-allowed";
                    }
                    return "pointer";
                  })(),
                }}
              >
                {cr.image ? (
                  <img
                    src={process.env.PUBLIC_URL + "/" + cr.image}
                    alt={cr.name}
                    draggable={false}
                    style={{ width: "80%", height: "80%", objectFit: "contain", pointerEvents: "none", borderRadius: "50%", border: selectedCreatureId === cr.id ? "2px solid #00e5ff" : (cr.kind === "hero" ? "2px solid #4caf50" : "2px solid #e53935"), boxSizing: "border-box" }}
                    onError={(e) => ((e.currentTarget.style.display = "none"))}
                  />
                ) : (
                  <div
                    style={{
                      width: Math.floor(TILE_SIZE * 0.8 * ((cr.size === "large" || cr.size === "huge") ? 2 : 1)),
                      height: Math.floor(TILE_SIZE * 0.8 * ((cr.size === "large" || cr.size === "huge") ? 2 : 1)),
                      borderRadius: "50%",
                      background: cr.kind === "hero" ? "#4caf50" : "#e53935",
                      border: selectedCreatureId === cr.id ? "2px solid #00e5ff" : "2px solid #fff",
                      boxSizing: "border-box",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, color: "#fff", background: "rgba(0,0,0,0.5)", padding: 8, zIndex: 10 }}>
        <h2 style={{ margin: 0 }}>{mapData.name}</h2>
        <p style={{ margin: 0 }}>{mapData.description}</p>
      </div>
      {/* Bottom bar with messages and End Turn */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 100,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          display: "flex",
          alignItems: "stretch",
          gap: 12,
          padding: 12,
          boxSizing: "border-box",
          zIndex: 12,
          borderTop: "2px solid #333",
          pointerEvents: "auto",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <div style={{ flex: 1, overflow: "auto", background: "rgba(255,255,255,0.06)", border: "1px solid #444", borderRadius: 6, padding: 8 }}>
          {messages.length === 0 ? (
            <div style={{ opacity: 0.8 }}>No messages</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => {
            setCreatures(prev => prev.map(c => ({ ...c, remainingMovement: c.movement, remainingAttacks: c.attacks })));
            setMessages(m => ["Turn ended. Movement reset.", ...m].slice(0, 50));
          }}
          style={{
            minWidth: 140,
            height: "100%",
            background: "#00e5ff",
            color: "#000",
            border: "none",
            borderRadius: 6,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          End Turn
        </button>
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "calc(100vh - 100px)",
          bottom: 100,
          width: 280,
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          padding: 16,
          boxSizing: "border-box",
          zIndex: 12,
          borderLeft: "2px solid #333",
          backdropFilter: "blur(2px)",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {selectedCreature ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {selectedCreature.image ? (
                <img
                  src={process.env.PUBLIC_URL + "/" + selectedCreature.image}
                  alt={selectedCreature.name}
                  draggable={false}
                  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "50%", border: selectedCreature.kind === "hero" ? "2px solid #4caf50" : "2px solid #e53935" }}
                />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: selectedCreature.kind === "hero" ? "#4caf50" : "#e53935", border: "2px solid #fff" }} />)
              }
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedCreature.name}</div>
                <div style={{ opacity: 0.8, textTransform: "capitalize" }}>{selectedCreature.kind}</div>
              </div>
            </div>
            <div style={{ marginTop: 4, borderTop: "1px solid #444", paddingTop: 12 }}>
              <div>Movement: <strong>{selectedCreature.movement}</strong></div>
              <div>Remaining: <strong>{selectedCreature.remainingMovement ?? selectedCreature.movement}</strong></div>
              <div>Attacks: <strong>{selectedCreature.attacks}</strong></div>
              <div>Remaining attacks: <strong>{selectedCreature.remainingAttacks ?? selectedCreature.attacks}</strong></div>
              <div>Position: <strong>({selectedCreature.x}, {selectedCreature.y})</strong></div>
              <div>Size: <strong>{selectedCreature.size}</strong></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
                <div>Combat: <strong>{selectedCreature.combat}</strong></div>
                <div>Ranged: <strong>{selectedCreature.ranged}</strong></div>
                <div>Strength: <strong>{selectedCreature.strength}</strong></div>
                <div>Vitality: <strong>{selectedCreature.vitality}</strong></div>
              </div>
            </div>
            <div style={{ marginTop: 12, borderTop: "1px solid #444", paddingTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Equipment</div>
              <div>Main hand: <strong>{selectedCreature.equipment.mainHand?.name ?? "-"}</strong></div>
              <div>Off hand: <strong>{selectedCreature.equipment.offHand?.name ?? "-"}</strong></div>
              <div>Armor: <strong>{selectedCreature.equipment.armor?.name ?? "-"}</strong></div>
              <div>Ranged: <strong>{selectedCreature.equipment.ranged?.name ?? "-"}</strong></div>
            </div>
            <div style={{ marginTop: 12, borderTop: "1px solid #444", paddingTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Inventory ({selectedCreature.inventory.length})</div>
              <ul style={{ margin: 0, paddingLeft: 16, maxHeight: 160, overflow: "auto" }}>
                {selectedCreature.inventory.map((it) => (
                  <li key={it.id}>{it.name}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setSelectedCreatureId(null)}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "8px 12px",
                background: "#00e5ff",
                border: "none",
                color: "#000",
                fontWeight: 700,
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Deselect
            </button>
          </>
        ) : (
          <div style={{ opacity: 0.8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No creature selected</div>
            <div>Click a creature token to see its stats here.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <TileMapView mapData={tileMapData} />
    </div>
  );
}

export default App;
