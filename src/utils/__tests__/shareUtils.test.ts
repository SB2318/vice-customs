import { describe, it, expect } from 'vitest';
import { encodeLiveryToUrl, decodeLiveryFromUrl } from '../shareUtils';
import { LiveryState } from '../../types';

const mockState: LiveryState = {
  vehicle: 'infernus',
  primaryColor: '#ff0055',
  secondaryColor: '#00f0ff',
  finish: 'metallic',
  pearlescentColor: '#ffea00',
  decals: [],
  underglowColor: '#ff0055',
  underglowEnabled: true,
  headlightsColor: '#ffffff',
  headlightsOn: true,
  doorsOpen: false,
  hoodOpen: false,
  spoilerStyle: 'gt_wing',
  rimStyle: 'spoke',
  rimColor: '#ffffff',
  windowTint: 'dark_limo',
  isRainyWeather: false,
  isExhaustFlamesActive: false,
};

describe('Share Utilities', () => {
  it('should encode and decode livery state accurately', () => {
    const encoded = encodeLiveryToUrl(mockState);
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');

    const decoded = decodeLiveryFromUrl(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.vehicle).toBe('infernus');
    expect(decoded?.primaryColor).toBe('#ff0055');
  });

  it('should strip massive data URLs from encoded hash state', () => {
    const stateWithBigImage: LiveryState = {
      ...mockState,
      unlayerOverlayUrl: 'data:image/png;base64,' + 'A'.repeat(6000),
    };

    const encoded = encodeLiveryToUrl(stateWithBigImage);
    const decoded = decodeLiveryFromUrl(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.unlayerOverlayUrl).toBeUndefined();
  });

  it('should reject malformed or invalid vehicle models when decoding', () => {
    const invalidJson = JSON.stringify({ vehicle: 'invalid_vehicle', primaryColor: '#123456' });
    const encoded = btoa(encodeURIComponent(invalidJson));
    const decoded = decodeLiveryFromUrl(encoded);
    expect(decoded).toBeNull();
  });
});
