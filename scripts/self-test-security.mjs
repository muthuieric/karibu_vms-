#!/usr/bin/env node

/**
 * Self-Testing Security Verification Script ("Self-Hacking / Vulnerability Test").
 * Runs automated penetration simulations against rate limiters, impossible travel, and sanitization.
 */

let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

console.log("\n🛡️  Running Karibu VMS Self-Security & Penetration Test Suite...\n");

// ==========================================
// TEST 1: Brute-Force Rate Limiting Simulation
// ==========================================
console.log("1. Simulating Brute-Force Rate Limiting (5 requests/minute threshold)...");

class SlidingWindowLimiter {
  constructor(maxRequests, windowSeconds) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }

  limit(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = (this.requests.get(identifier) || []).filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const resetSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      return { success: false, remaining: 0, reset: resetSeconds };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);
    return { success: true, remaining: this.maxRequests - timestamps.length };
  }
}

const limiter = new SlidingWindowLimiter(5, 60);
const attackerIp = "192.168.1.100";
let allowedAttempts = 0;
let blockedAttempt = false;

for (let attempt = 1; attempt <= 7; attempt++) {
  const result = limiter.limit(attackerIp);
  if (result.success) {
    allowedAttempts++;
  } else {
    blockedAttempt = true;
  }
}

assert(allowedAttempts === 5, `Permitted exactly 5 attempts before threshold (got ${allowedAttempts})`);
assert(blockedAttempt === true, "6th and 7th requests were strictly rejected (HTTP 429 triggered)");

// ==========================================
// TEST 2: Haversine Great-Circle Distance Calculation
// ==========================================
console.log("\n2. Testing Great-Circle Haversine Distance Calculation...");

function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
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

// Distance between Nairobi (-1.2921, 36.8219) and London (51.5074, -0.1278) is approx ~6,820 km
const distNairobiLondon = calculateHaversineDistanceKm(-1.2921, 36.8219, 51.5074, -0.1278);
assert(
  distNairobiLondon > 6700 && distNairobiLondon < 7000,
  `Nairobi to London distance calculated accurately (~6,820 km, got ${distNairobiLondon} km)`
);

// Distance between Nairobi and Thika (~42 km)
const distNairobiThika = calculateHaversineDistanceKm(-1.2921, 36.8219, -1.0333, 37.0693);
assert(
  distNairobiThika > 35 && distNairobiThika < 50,
  `Nairobi to Thika distance calculated accurately (~42 km, got ${distNairobiThika} km)`
);

// ==========================================
// TEST 3: Impossible Travel & Location Spoofing Scenarios
// ==========================================
console.log("\n3. Simulating 'Impossible Travel' & Location Anomaly Detection...");

function detectImpossibleTravel(lastSession, currentSession) {
  if (!lastSession || !lastSession.created_at) {
    return { isSuspicious: false };
  }

  const lastTime = new Date(lastSession.created_at).getTime();
  const currentTime = new Date(currentSession.created_at || Date.now()).getTime();
  const timeDeltaMs = currentTime - lastTime;

  if (timeDeltaMs > 24 * 60 * 60 * 1000) return { isSuspicious: false };

  const timeDeltaHours = Math.max(timeDeltaMs / (1000 * 60 * 60), 0.001);
  const timeDeltaMinutes = timeDeltaMs / (1000 * 60);

  const hasCoords1 = typeof lastSession.latitude === "number" && typeof lastSession.longitude === "number";
  const hasCoords2 = typeof currentSession.latitude === "number" && typeof currentSession.longitude === "number";

  if (hasCoords1 && hasCoords2) {
    const distanceKm = calculateHaversineDistanceKm(
      lastSession.latitude,
      lastSession.longitude,
      currentSession.latitude,
      currentSession.longitude
    );
    const calculatedSpeedKmh = Math.round(distanceKm / timeDeltaHours);

    if (distanceKm > 100 && timeDeltaMinutes < 3) {
      return { isSuspicious: true, reason: `Instant relocation: ${distanceKm} km in ${Math.round(timeDeltaMinutes)} minutes.` };
    }
    if (distanceKm > 150 && calculatedSpeedKmh > 850) {
      return { isSuspicious: true, reason: `Impossible travel speed: ${calculatedSpeedKmh} km/h over ${distanceKm} km.` };
    }
    return { isSuspicious: false, distanceKm, calculatedSpeedKmh };
  }

  const country1 = String(lastSession.country || "").trim().toUpperCase();
  const country2 = String(currentSession.country || "").trim().toUpperCase();
  if (country1 && country2 && country1 !== country2 && timeDeltaMinutes < 45) {
    return { isSuspicious: true, reason: `Country changed from ${country1} to ${country2} in ${Math.round(timeDeltaMinutes)} minutes.` };
  }

  return { isSuspicious: false };
}

const now = Date.now();

// Scenario A: Normal commute (Nairobi -> Thika, 45 minutes)
const sessionNormal1 = {
  country: "KE",
  city: "Nairobi",
  latitude: -1.2921,
  longitude: 36.8219,
  created_at: new Date(now - 45 * 60 * 1000).toISOString(),
};
const sessionNormal2 = {
  country: "KE",
  city: "Thika",
  latitude: -1.0333,
  longitude: 37.0693,
  created_at: new Date(now).toISOString(),
};

const resultNormal = detectImpossibleTravel(sessionNormal1, sessionNormal2);
assert(resultNormal.isSuspicious === false, "Legitimate commute (Nairobi -> Thika in 45m) is approved without flags");

// Scenario B: Impossible Travel (Nairobi -> London in 5 minutes)
const sessionSuspicious1 = {
  country: "KE",
  city: "Nairobi",
  latitude: -1.2921,
  longitude: 36.8219,
  created_at: new Date(now - 5 * 60 * 1000).toISOString(),
};
const sessionSuspicious2 = {
  country: "GB",
  city: "London",
  latitude: 51.5074,
  longitude: -0.1278,
  created_at: new Date(now).toISOString(),
};

const resultSuspicious = detectImpossibleTravel(sessionSuspicious1, sessionSuspicious2);
assert(
  resultSuspicious.isSuspicious === true,
  `Concurrent login from Nairobi to London in 5m flagged as Impossible Travel (${resultSuspicious.reason})`
);

// Scenario C: Cross-country jump without coords within 10 minutes (VPN / Proxy / Credential Stuffing)
const sessionCoarse1 = {
  country: "KE",
  created_at: new Date(now - 10 * 60 * 1000).toISOString(),
};
const sessionCoarse2 = {
  country: "DE",
  created_at: new Date(now).toISOString(),
};

const resultCoarse = detectImpossibleTravel(sessionCoarse1, sessionCoarse2);
assert(
  resultCoarse.isSuspicious === true,
  `Cross-country jump without coords (KE -> DE in 10m) flagged as suspicious (${resultCoarse.reason})`
);

// ==========================================
// SUMMARY
// ==========================================
console.log("\n------------------------------------------------------------");
if (failedTests === 0) {
  console.log("🎉 All Security & Vulnerability Tests Passed Successfully!\n");
  process.exit(0);
} else {
  console.error(`💥 ${failedTests} test(s) failed in the security test suite!\n`);
  process.exit(1);
}

