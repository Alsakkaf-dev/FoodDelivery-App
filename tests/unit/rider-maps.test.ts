import { describe, it, expect } from 'vitest';
import { buildMapsLink } from '@/components/rider/delivery-card';

// FR-R-04 / US-041 — the map deep-link comes from a saved pin, falling back to the
// typed address; no paid maps API. (Mirrors the server `mapsLink` in rider.ts.)
describe('buildMapsLink', () => {
  it('uses the saved pin coordinates when present', () => {
    expect(buildMapsLink(1.4927, 103.7414, 'ignored')).toBe(
      'https://www.google.com/maps/search/?api=1&query=1.4927,103.7414',
    );
  });

  it('falls back to the URL-encoded address when there is no pin', () => {
    expect(buildMapsLink(null, null, 'No 12, Jalan Pulai, Skudai')).toBe(
      'https://www.google.com/maps/search/?api=1&query=No%2012%2C%20Jalan%20Pulai%2C%20Skudai',
    );
  });

  it('produces an empty query when neither pin nor address exists', () => {
    expect(buildMapsLink(null, null, null)).toBe('https://www.google.com/maps/search/?api=1&query=');
  });

  it('treats a 0,0 pin as a valid coordinate (not missing)', () => {
    expect(buildMapsLink(0, 0, 'addr')).toBe('https://www.google.com/maps/search/?api=1&query=0,0');
  });
});
