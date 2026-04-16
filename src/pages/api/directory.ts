import type { APIRoute } from 'astro';

const ADVENTIST_API_URL = 'https://adventist-scraper-api.vercel.app';

// Comprehensive fallback static data for when API is unresponsive
const FALLBACK_DATA = [
  {
    name: "Central Philippine Union Conference",
    address: "Manila, Philippines",
    phone: "+63 2 123-4567",
    email: "cpu@adventist.org",
    org_status: "Union",
    conference: "Southern Asia-Pacific",
    field: "Administration",
  },
  {
    name: "Manila Seventh-day Adventist Church",
    address: "Manila, Metro Manila",
    phone: "+63 2 234-5678",
    email: "manila@adventist.org",
    org_status: "Church",
    conference: "North Philippines",
    field: "Church",
  },
  {
    name: "Quezon City Seventh-day Adventist Church",
    address: "Quezon City, Metro Manila",
    phone: "+63 2 345-6789",
    email: "quezon@adventist.org",
    org_status: "Church",
    conference: "North Philippines",
    field: "Church",
  },
  {
    name: "Cebu Adventist Hospital",
    address: "Cebu City, Philippines",
    phone: "+63 32 123-4567",
    email: "cebu@adventist.org",
    org_status: "Institution",
    conference: "Central Philippines",
    field: "Healthcare",
  },
  {
    name: "Davao Adventist Hospital",
    address: "Davao City, Philippines",
    phone: "+63 82 123-4567",
    email: "davao@adventist.org",
    org_status: "Institution",
    conference: "Southern Philippines",
    field: "Healthcare",
  },
  {
    name: "Baguio Adventist Clinic",
    address: "Baguio City, Benguet",
    phone: "+63 74 123-4567",
    email: "baguio@adventist.org",
    org_status: "Church",
    conference: "North Philippines",
    field: "Church",
  },
  {
    name: "Iloilo Adventist Hospital",
    address: "Iloilo City, Philippines",
    phone: "+63 33 123-4567",
    email: "iloilo@adventist.org",
    org_status: "Institution",
    conference: "Central Philippines",
    field: "Healthcare",
  },
  {
    name: "Bacolod Seventh-day Adventist Church",
    address: "Bacolod City, Negros Occidental",
    phone: "+63 34 123-4567",
    email: "bacolod@adventist.org",
    org_status: "Church",
    conference: "Central Philippines",
    field: "Church",
  },
  {
    name: "Tagbilaran Seventh-day Adventist Church",
    address: "Tagbilaran City, Bohol",
    phone: "+63 38 123-4567",
    email: "tagbilaran@adventist.org",
    org_status: "Church",
    conference: "Central Philippines",
    field: "Church",
  },
  {
    name: "General Santos Seventh-day Adventist Church",
    address: "General Santos City, South Cotabato",
    phone: "+63 83 123-4567",
    email: "gensan@adventist.org",
    org_status: "Church",
    conference: "Southern Philippines",
    field: "Church",
  },
];

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint') || 'scrape';
  const start = url.searchParams.get('start') || '0';
  const end = url.searchParams.get('end') || '4';
  const q = url.searchParams.get('q') || '';

  try {
    let data;
    let apiUrl = '';

    if (endpoint === 'info') {
      apiUrl = `${ADVENTIST_API_URL}/`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('API unavailable');
      data = await response.json();
    } else if (endpoint === 'search') {
      apiUrl = `${ADVENTIST_API_URL}/api/directory/search?q=${encodeURIComponent(q)}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('API unavailable');
      data = await response.json();
    } else {
      // scrape endpoint
      apiUrl = `${ADVENTIST_API_URL}/api/directory/scrape?start=${start}&end=${end}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('API unavailable');
      data = await response.json();
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Return fallback data on error
    console.warn('Directory API unavailable, using fallback data:', error);

    let fallbackResult = FALLBACK_DATA;

    // Filter by search query if provided
    if (q) {
      const query = q.toLowerCase();
      fallbackResult = FALLBACK_DATA.filter(entry =>
        entry.name.toLowerCase().includes(query) ||
        entry.address.toLowerCase().includes(query) ||
        entry.field?.toLowerCase().includes(query) ||
        entry.org_status?.toLowerCase().includes(query)
      );
    }

    // Slice by page if scrape endpoint
    if (endpoint === 'scrape') {
      const startNum = parseInt(start) || 0;
      const endNum = parseInt(end) || 4;
      const pageSize = 25;
      const startIdx = startNum * pageSize;
      const endIdx = endNum * pageSize;
      fallbackResult = fallbackResult.slice(startIdx, endIdx);
    }

    return new Response(JSON.stringify({
      data: fallbackResult,
      total: FALLBACK_DATA.length,
      fallback: true,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};