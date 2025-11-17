import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  const svc = new GeocodingService();
  const origFetch = global.fetch as any;

  beforeEach(() => {
    (global as any).fetch = jest.fn(async () => ({
      json: async () => [
        { lat: '36.8', lon: '10.18', display_name: 'Mock Address' },
      ],
    }));
  });
  afterEach(() => {
    (global as any).fetch = origFetch;
  });

  it('returns lat/lon/fullAddress on success', async () => {
    const res = await svc.geocode({ street: 'x', city: 'y' });
    expect(res).toMatchObject({
      latitude: 36.8,
      longitude: 10.18,
      fullAddress: 'Mock Address',
    });
  });

  it('returns null on empty results', async () => {
    (global as any).fetch = jest.fn(async () => ({ json: async () => [] }));
    const res = await svc.geocode({ fullAddress: 'unknown' });
    expect(res).toBeNull();
  });
});
