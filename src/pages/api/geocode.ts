import type { APIRoute } from 'astro';

// Rate limiting state (in production, use Redis or similar)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const address = url.searchParams.get('q');

  if (!address) {
    return new Response(JSON.stringify({ error: 'Missing address parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  try {
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', address);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', '1');

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'TransportDirectoryWeb/1.0 (Astro React App)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Geocoding service error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Address not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to geocode address' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};