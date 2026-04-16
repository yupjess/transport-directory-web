// OSRM routing utilities

import type { LatLng } from './distance';

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  geometry?: string; // encoded polyline
}

/**
 * Calculate route distance and duration using OSRM public API
 * @returns Route info including distance in meters
 */
export async function calculateRoute(
  origin: LatLng,
  destination: LatLng,
  profile: 'driving' | 'foot' | 'bike' = 'driving'
): Promise<RouteResult> {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
  );
  url.searchParams.set('overview', 'false');
  url.searchParams.set('steps', 'false');

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    return {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      geometry: route.geometry,
    };
  } catch (error) {
    console.warn('OSRM routing error:', error);
    throw error;
  }
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Format distance for display
 */
export function formatRouteDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}