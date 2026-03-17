import type { GeocodingResponse } from "../models/geocoding.js";
import type { Location } from "../models/location.js";
const GEOCODING_URL = "https://nominatim.openstreetmap.org/search";
const REVERSE_GEOCODING_URL = "https://nominatim.openstreetmap.org/reverse";

export async function geocodeLocation(query: string): Promise<GeocodingResponse[]> {
  const url = `${GEOCODING_URL}?q=${encodeURIComponent(query)}&format=json&limit=5`;
  const res = await fetch(url);


  if (!res.ok) throw new Error(`Erreur géocoding: ${res.status} ${res.statusText}`);
  return res.json();

}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; region: string }> {
  const url = `${REVERSE_GEOCODING_URL}?lat=${lat}&lon=${lon}&zoom=10&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur reverse géocoding: ${res.status} ${res.statusText}`);
  const data = await res.json();
  // maintenant , il va retourner un objet aveec le nale et la région (si disponible) pour une meilleure lisibilité
  const name = data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.state ?? "Lieu inconnu";
  const region = data.address?.state ?? "Région inconnue";
  return { name, region };

} export async function getCitiesInBBox(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): Promise<Location[]> {

  const url =
    `${GEOCODING_URL}?format=json` +
    `&q=city` +
    `&bounded=1` +
    `&limit=20` +
    `&viewbox=${minLon},${maxLat},${maxLon},${minLat}` +
    `&featuretype=city`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "meteo-app-student-project"
    }
  });
  if (!res.ok) {
    throw new Error(`Erreur bbox: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const locations: Location[] = data
    .map((place: any) => {

      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);

      const parts = place.display_name.split(",");

      return {
        name: parts[0].trim(),
        lat,
        lon,
        region: parts[1]?.trim() ?? ""
      };

    })

  return locations;
}