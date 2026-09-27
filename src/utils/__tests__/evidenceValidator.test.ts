import { describe, it, expect } from 'vitest';
import { validateEvidenceForgery } from '../evidenceValidator';
import { HEIST_MISSIONS } from '../heistMissions';

describe('Evidence Forgery Validator Engine', () => {
  it('should process vehicle_disguise mechanic and calculate heat meter reduction', async () => {
    const carMission = HEIST_MISSIONS[0];
    const result = await validateEvidenceForgery(carMission, carMission.evidenceCanvasSvg);
    expect(result).toBeDefined();
    expect(result.mechanicType).toBe('vehicle_disguise');
    expect(typeof result.heatLevelPct).toBe('number');
    expect(Array.isArray(result.feedbackNotes)).toBe(true);
  });

  it('should process identity_matrix mechanic for motorbikes with target region matching', async () => {
    const bikeMission = HEIST_MISSIONS[1];
    const result = await validateEvidenceForgery(bikeMission, bikeMission.evidenceCanvasSvg);
    expect(result).toBeDefined();
    expect(result.mechanicType).toBe('identity_matrix');
    expect(typeof result.vehicleMatchPct).toBe('number');
    expect(typeof result.riderMatchPct).toBe('number');
    expect(typeof result.overallIdentityPct).toBe('number');
  });

  it('should process multi_image_consistency mechanic for train cameras with pixel analysis', async () => {
    const trainMission = HEIST_MISSIONS[2];
    const result = await validateEvidenceForgery(trainMission, trainMission.evidenceCanvasSvg, {
      multiImages: {
        'cam-01': trainMission.evidencePhotos![0].svgDataUrl,
        'cam-02': trainMission.evidencePhotos![1].svgDataUrl,
        'cam-03': trainMission.evidencePhotos![2].svgDataUrl,
        'cam-04': trainMission.evidencePhotos![3].svgDataUrl,
      },
    });
    expect(result).toBeDefined();
    expect(result.mechanicType).toBe('multi_image_consistency');
    expect(result.imageConsistencyList?.length).toBe(4);
    expect(typeof result.consistencyScorePct).toBe('number');
  });

  it('should handle unedited images gracefully with failing score and feedback notes', async () => {
    const carMission = HEIST_MISSIONS[0];
    const result = await validateEvidenceForgery(carMission, carMission.evidenceCanvasSvg);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.feedbackNotes.some(note => note.includes('[WARNING]') || note.includes('ALERT'))).toBe(true);
  });
});
