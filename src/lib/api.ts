// API client functions for PH Transport API and Adventist Directory API

const TRANSPORT_API_URL = 'https://ph-transport-api.vercel.app';
const ADVENTIST_API_URL = 'https://adventist-scraper-api.vercel.app';

export interface FuelPrice {
  brand: string;
  ron91: number;
  ron95: number;
  diesel: number;
}

export interface CommuterType {
  type: string;
}

export interface DirectoryEntry {
  id?: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  org_status?: string;
  conference?: string;
  union?: string;
  field?: string;
  lat?: number;
  lng?: number;
}

export interface DirectorySearchResult {
  data: DirectoryEntry[];
  total?: number;
  page?: number;
  pageSize?: number;
}

// Transport API
export async function fetchFuelPrices(): Promise<{ data: FuelPrice[] }> {
  const res = await fetch(`${TRANSPORT_API_URL}/fuel/latest`);
  if (!res.ok) throw new Error('Failed to fetch fuel prices');
  return res.json();
}

export async function fetchFuelBrands(): Promise<{ brands: string[] }> {
  const res = await fetch(`${TRANSPORT_API_URL}/fuel/brands`);
  if (!res.ok) throw new Error('Failed to fetch fuel brands');
  return res.json();
}

export async function fetchCommuterTypes(): Promise<{ types: string[] }> {
  const res = await fetch(`${TRANSPORT_API_URL}/fare/commuter/types`);
  if (!res.ok) throw new Error('Failed to fetch commuter types');
  return res.json();
}

export async function calculateCommuterFare(type: string, km: number): Promise<{ fare: number }> {
  const res = await fetch(`${TRANSPORT_API_URL}/fare/commuter/calculate?type=${encodeURIComponent(type)}&km=${km}`);
  if (!res.ok) throw new Error('Failed to calculate fare');
  return res.json();
}

export async function calculateVehicleFare(profile: string, km: number): Promise<{ cost: number }> {
  const res = await fetch(`${TRANSPORT_API_URL}/fare/vehicle/calculate?profile=${encodeURIComponent(profile)}&km=${km}`);
  if (!res.ok) throw new Error('Failed to calculate vehicle fare');
  return res.json();
}

// Adventist Directory API
export async function fetchDirectoryInfo(): Promise<{ total: number; api_name: string }> {
  const res = await fetch(`${ADVENTIST_API_URL}/`);
  if (!res.ok) throw new Error('Failed to fetch directory info');
  return res.json();
}

export async function scrapeDirectory(start: number, end: number): Promise<{ data: DirectoryEntry[] }> {
  const res = await fetch(`${ADVENTIST_API_URL}/api/directory/scrape?start=${start}&end=${end}`);
  if (!res.ok) throw new Error('Failed to scrape directory');
  return res.json();
}

export async function searchDirectory(query: string): Promise<DirectorySearchResult> {
  const res = await fetch(`${ADVENTIST_API_URL}/api/directory/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search directory');
  return res.json();
}

// Fallback static data (used if API is unresponsive)
export function getStaticFallbackData(): DirectoryEntry[] {
  return [
    {
      name: "Central Philippine Union Conference",
      address: " Manila",
      phone: "+63 2 123-4567",
      email: "cpu@adventist.org",
      org_status: "Union",
      conference: "Southern Asia-Pacific",
    },
    {
      name: "Manila Seventh-day Adventist Church",
      address: " Manila, Metro Manila",
      phone: "+63 2 234-5678",
      email: "manila@adventist.org",
      org_status: "Church",
      conference: "North Philippines",
    },
  ];
}