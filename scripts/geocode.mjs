// Script to pre-geocode directory entries using Nominatim
// Run with: node scripts/geocode.mjs

import { readFileSync, writeFileSync } from 'fs';

const ADVENTIST_API_URL = 'https://adventist-scraper-api.vercel.app';

// Rate limiting: 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100;

async function rateLimitedFetch(url, options = {}) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
  return fetch(url, options);
}

async function geocodeAddress(address) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address + ', Philippines');
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  try {
    const response = await rateLimitedFetch(url.toString(), {
      headers: {
        'User-Agent': 'TransportDirectoryWeb/1.0 (Build Script)',
        'Accept': 'application/json',
      },
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

async function main() {
  console.log('Fetching directory entries...');

  // Fetch a sample of directory entries
  const res = await fetch(`${ADVENTIST_API_URL}/api/directory/scrape?start=0&end=10`);
  const { data: entries } = await res.json();

  console.log(`Found ${entries.length} entries. Geocoding...`);

  const geocoded = {};

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const address = entry.address;

    console.log(`[${i + 1}/${entries.length}] Geocoding: ${address}`);

    const result = await geocodeAddress(address);

    if (result) {
      geocoded[entry.name] = result;
      console.log(`  ✓ ${result.lat}, ${result.lng}`);
    } else {
      console.log(`  ✗ Not found`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Save to public directory
  const outputPath = './public/geocoded-directory.json';
  writeFileSync(outputPath, JSON.stringify(geocoded, null, 2));
  console.log(`\nSaved geocoded data to ${outputPath}`);
  console.log(`Geocoded ${Object.keys(geocoded).length} entries`);
}

main().catch(console.error);