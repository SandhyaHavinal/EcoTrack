// Emission factors (kg CO2 equivalent)
export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.192,     // per km
    car_diesel: 0.171,     // per km
    ev: 0.053,             // per km (average grid mix)
    motorbike: 0.103,      // per km
    bus: 0.096,            // per passenger-km
    train: 0.035,          // per passenger-km
    flight: 0.150,         // per passenger-km
    walk_bike: 0.0         // zero emissions
  },
  electricity: 0.42,       // per kWh
  water: 0.0003,           // per liter
  food: {
    vegan: 2.9,            // per day
    vegetarian: 3.8,       // per day
    mixed: 5.6,            // per day (average meat eater)
    heavy_meat: 7.2        // per day
  },
  waste: {
    unsorted: 0.52,        // per kg
    recycled: 0.12,        // per kg (manufacturing/transport of recyclables)
    composted: 0.05        // per kg (aerobic composting emissions)
  }
};

// Benchmarks for average monthly emissions (kg CO2 per capita per month)
// Global average is roughly ~400kg. US/EU can be higher (800kg-1200kg). EcoTrack target is <200kg.
export const BENCHMARKS = {
  monthlyAverage: 450,
  monthlyTarget: 200,
  dailyAverage: 15,
};

/**
 * Calculates travel emissions in kg CO2.
 */
export function calculateTransportEmissions(
  mode: keyof typeof EMISSION_FACTORS.transport,
  distanceKm: number
): number {
  const factor = EMISSION_FACTORS.transport[mode] || 0;
  return Number((distanceKm * factor).toFixed(2));
}

/**
 * Calculates electricity emissions in kg CO2.
 */
export function calculateElectricityEmissions(kwh: number): number {
  return Number((kwh * EMISSION_FACTORS.electricity).toFixed(2));
}

/**
 * Calculates water emissions in kg CO2.
 */
export function calculateWaterEmissions(liters: number): number {
  return Number((liters * EMISSION_FACTORS.water).toFixed(2));
}

/**
 * Calculates food emissions in kg CO2 for a given number of days.
 */
export function calculateFoodEmissions(
  dietType: keyof typeof EMISSION_FACTORS.food,
  days: number = 1
): number {
  const factor = EMISSION_FACTORS.food[dietType] || EMISSION_FACTORS.food.mixed;
  return Number((factor * days).toFixed(2));
}

/**
 * Calculates waste emissions in kg CO2.
 * Recycling and composting reduce emissions compared to pure landfill (unsorted).
 */
export function calculateWasteEmissions(
  unsortedKg: number,
  recycledKg: number = 0,
  compostedKg: number = 0
): number {
  const unsortedEmissions = unsortedKg * EMISSION_FACTORS.waste.unsorted;
  const recycledEmissions = recycledKg * EMISSION_FACTORS.waste.recycled;
  const compostedEmissions = compostedKg * EMISSION_FACTORS.waste.composted;
  return Number((unsortedEmissions + recycledEmissions + compostedEmissions).toFixed(2));
}

/**
 * Calculates a sustainability score from 0 to 100 based on monthly total emissions.
 * 100 is best (zero emissions), 0 is worst (excessive emissions).
 * Average emissions (~450 kg) maps to a score of ~50.
 */
export function calculateSustainabilityScore(monthlyEmissionsKg: number): number {
  if (monthlyEmissionsKg <= 0) return 100;
  
  // Calculate relative to the target and average
  // Under target (200kg) -> 80 - 100
  // Between target (200kg) and average (450kg) -> 50 - 80
  // Above average -> 0 - 50
  
  let score = 50;
  if (monthlyEmissionsKg <= BENCHMARKS.monthlyTarget) {
    // Linear interpolation between 0kg (score 100) and target (score 80)
    const ratio = monthlyEmissionsKg / BENCHMARKS.monthlyTarget;
    score = 100 - (ratio * 20);
  } else if (monthlyEmissionsKg <= BENCHMARKS.monthlyAverage) {
    // Linear interpolation between target (score 80) and average (score 50)
    const ratio = (monthlyEmissionsKg - BENCHMARKS.monthlyTarget) / (BENCHMARKS.monthlyAverage - BENCHMARKS.monthlyTarget);
    score = 80 - (ratio * 30);
  } else {
    // Above average, decaying asymptotically towards 0
    // At double average (900kg), score is ~15.
    const excessRatio = (monthlyEmissionsKg - BENCHMARKS.monthlyAverage) / BENCHMARKS.monthlyAverage;
    score = 50 * Math.exp(-excessRatio);
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate weekly sustainability level progression points
 */
export function calculateEarnedPoints(emissionsReducedKg: number, challengesCompletedCount: number): number {
  const basePoints = Math.round(emissionsReducedKg * 10); // 10 points per kg CO2 saved
  const challengeBonus = challengesCompletedCount * 100; // 100 points per challenge completed
  return basePoints + challengeBonus;
}
