
import type { Location } from "../models/location.js";

export function loadLocations(): Location[] {
  const stored = localStorage.getItem("saved_locations");
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as Location[];
    return parsed.map((loc) => ({ name: loc.name, lat: loc.lat, lon: loc.lon, region: loc.region }));
  } catch (err) {
    console.warn("Données de localisation corrompues, réinitialisation.");
    localStorage.removeItem("saved_locations");
    return [];
  }
}
export function saveLocations(locations: Location[]) {
  localStorage.setItem("saved_locations", JSON.stringify(locations));
}
