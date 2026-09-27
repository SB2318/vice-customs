import { describe, it, expect } from 'vitest';
import { HEIST_MISSIONS } from '../heistMissions';

describe('Heist Mission Definitions', () => {
  it('should define exactly 6 getaway story missions', () => {
    expect(HEIST_MISSIONS.length).toBe(6);
  });

  it('should have required vehicle types for all 6 paths', () => {
    const types = HEIST_MISSIONS.map(m => m.vehicleType);
    expect(types).toEqual(['car', 'bike', 'train', 'boat', 'helicopter', 'final']);
  });

  it('should ensure all missions have valid mechanics and objective target regions', () => {
    HEIST_MISSIONS.forEach(mission => {
      expect(mission.id).toBeDefined();
      expect(mission.mechanicType).toBeDefined();
      expect(mission.objectives.length).toBeGreaterThan(0);

      mission.objectives.forEach(obj => {
        expect(obj.id).toBeDefined();
        expect(obj.category).toBeDefined();
        expect(obj.targetRegionLabel).toBeDefined();
        expect(obj.targetRegion).toBeDefined();
      });
    });
  });

  it('should contain evidence canvas SVG data URLs for all missions', () => {
    HEIST_MISSIONS.forEach(mission => {
      expect(mission.evidenceCanvasSvg).toContain('data:image/svg+xml');
    });
  });

  it('should define 4 evidence photos for the Train mission', () => {
    const trainMission = HEIST_MISSIONS.find(m => m.id === 'mission-train');
    expect(trainMission).toBeDefined();
    expect(trainMission?.evidencePhotos?.length).toBe(4);
    trainMission?.evidencePhotos?.forEach(photo => {
      expect(photo.id).toBeDefined();
      expect(photo.svgDataUrl).toContain('data:image/svg+xml');
    });
  });
});
