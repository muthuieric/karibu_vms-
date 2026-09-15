/**
 * Geographic anomaly & "Impossible Travel" detection.
 * Calculates physical distance and velocity between consecutive user sessions.
 */

export interface SessionLocation {
  country?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string | Date;
}

export interface ImpossibleTravelCheckResult {
  isSuspicious: boolean;
  reason?: string;
  distanceKm?: number;
  timeDeltaHours?: number;
  calculatedSpeedKmh?: number;
}

/**
 * Calculates great-circle distance between two geographic coordinates in kilometers (Haversine formula).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Evaluates whether two consecutive logins represent impossible travel or an account takeover.
 *
 * Rules:
 * 1. If distance > 100 km and time delta < 3 minutes -> Impossible Travel.
 * 2. If calculated travel speed exceeds 850 km/h (commercial flight limit) and distance > 150 km -> Impossible Travel.
 * 3. If country changes in less than 45 minutes when coordinates are coarse/unavailable -> Impossible Travel.
 */
export function detectImpossibleTravel(
  lastSession: SessionLocation | null | undefined,
  currentSession: SessionLocation
): ImpossibleTravelCheckResult {
  if (!lastSession || !lastSession.created_at) {
    return { isSuspicious: false };
  }

  const lastTime = new Date(lastSession.created_at).getTime();
  const currentTime = new Date(currentSession.created_at || Date.now()).getTime();
  const timeDeltaMs = currentTime - lastTime;

  // If previous session is older than 24 hours, ignore velocity checks
  if (timeDeltaMs > 24 * 60 * 60 * 1000) {
    return { isSuspicious: false };
  }

  // Prevent division by zero for near-simultaneous concurrent requests
  const timeDeltaHours = Math.max(timeDeltaMs / (1000 * 60 * 60), 0.001);
  const timeDeltaMinutes = timeDeltaMs / (1000 * 60);

  const hasCoords1 =
    typeof lastSession.latitude === "number" &&
    typeof lastSession.longitude === "number" &&
    !Number.isNaN(lastSession.latitude) &&
    !Number.isNaN(lastSession.longitude);

  const hasCoords2 =
    typeof currentSession.latitude === "number" &&
    typeof currentSession.longitude === "number" &&
    !Number.isNaN(currentSession.latitude) &&
    !Number.isNaN(currentSession.longitude);

  if (hasCoords1 && hasCoords2) {
    const distanceKm = calculateHaversineDistanceKm(
      lastSession.latitude!,
      lastSession.longitude!,
      currentSession.latitude!,
      currentSession.longitude!
    );

    const calculatedSpeedKmh = Math.round(distanceKm / timeDeltaHours);

    // Rule 1: Instantaneous relocation across significant distance
    if (distanceKm > 100 && timeDeltaMinutes < 3) {
      return {
        isSuspicious: true,
        reason: `Instant relocation: ${distanceKm} km in ${Math.round(timeDeltaMinutes)} minutes.`,
        distanceKm,
        timeDeltaHours,
        calculatedSpeedKmh,
      };
    }

    // Rule 2: Exceeds standard commercial jet speeds (>850 km/h)
    if (distanceKm > 150 && calculatedSpeedKmh > 850) {
      return {
        isSuspicious: true,
        reason: `Impossible travel speed: ${calculatedSpeedKmh} km/h over ${distanceKm} km.`,
        distanceKm,
        timeDeltaHours,
        calculatedSpeedKmh,
      };
    }

    return {
      isSuspicious: false,
      distanceKm,
      timeDeltaHours,
      calculatedSpeedKmh,
    };
  }

  // Fallback check: country change within short time window (< 45 minutes)
  const country1 = String(lastSession.country || "").trim().toUpperCase();
  const country2 = String(currentSession.country || "").trim().toUpperCase();

  if (country1 && country2 && country1 !== country2 && timeDeltaMinutes < 45) {
    return {
      isSuspicious: true,
      reason: `Country changed from ${country1} to ${country2} in ${Math.round(timeDeltaMinutes)} minutes.`,
      timeDeltaHours,
    };
  }

  return { isSuspicious: false };
}

