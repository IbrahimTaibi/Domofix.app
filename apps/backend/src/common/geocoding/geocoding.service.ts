import { Injectable } from '@nestjs/common';

type GeocodeResult = {
  latitude: number;
  longitude: number;
  fullAddress: string;
};

@Injectable()
export class GeocodingService {
  async geocode(address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    fullAddress?: string;
  }): Promise<GeocodeResult | null> {
    const query =
      address.fullAddress ||
      [
        address.street,
        address.city,
        address.state,
        address.postalCode,
        address.country,
      ]
        .filter(Boolean)
        .join(', ');
    if (!query) return null;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'darigo-app/1.0' },
      });
      const data: any[] = await res.json();
      const best = data?.[0];
      if (!best) return null;
      return {
        latitude: Number(best.lat),
        longitude: Number(best.lon),
        fullAddress: String(best.display_name || query),
      };
    } catch {
      return null;
    }
  }
}
