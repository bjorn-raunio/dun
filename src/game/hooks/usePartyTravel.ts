import { useCallback } from 'react';
import { useGameContext } from '../GameContext';
import { Region as RegionClass } from '../../worldmap/Region';

export function usePartyTravel() {
  const { state, actions } = useGameContext();

  const travelToRegion = useCallback((regionId: string) => {
    // Update the party's current region
    actions.setParty(prevParty => {
      const newParty = prevParty;
      newParty.travelToRegion(regionId, state.worldMap);
      return newParty;
    });
  }, [actions, state.worldMap]);

  const canTravelToRegion = useCallback((regionId: string, regions: RegionClass[]) => {
    const currentRegion = regions.find(r => r.id === state.party.currentRegionId);
    if (!currentRegion) return false;
    
    return currentRegion.isConnectedTo(regionId);
  }, [state.party.currentRegionId]);

  const getTravelOptions = useCallback((regions: RegionClass[]) => {
    const currentRegion = regions.find(r => r.id === state.party.currentRegionId);
    if (!currentRegion) return [];
    
    return currentRegion.getAccessibleConnections();
  }, [state.party.currentRegionId]);

  return {
    currentRegionId: state.party.currentRegionId,
    party: state.party,
    travelToRegion,
    canTravelToRegion,
    getTravelOptions,
  };
}
