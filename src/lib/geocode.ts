// Nominatim geocoding utilities with rate limiting

import type { LatLng } from './distance';

// Rate limiter: 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

async function rateLimitedFetch(url: string, headers: Record<string, string>): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();

  return fetch(url, { headers });
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Geocode an address using Nominatim
 * Requires a proper User-Agent header identifying your application
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  try {
    const response = await rateLimitedFetch(url.toString(), {
      'User-Agent': 'TransportDirectoryWeb/1.0 (Astro React App)',
      'Accept': 'application/json',
    });

    if (!response.ok) {
      console.warn(`Geocoding failed for "${address}": ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (error) {
    console.warn(`Geocoding error for "${address}":`, error);
    return null;
  }
}

/**
 * Batch geocode addresses with rate limiting
 */
export async function geocodeAddresses(
  addresses: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const result = await geocodeAddress(address);

    if (result) {
      results.set(address, result);
    }

    onProgress?.(i + 1, addresses.length);

    // Small delay between requests to be nice to the API
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }

  return results;
}