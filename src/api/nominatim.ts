import type { GeocodingResponse } from "../models/geocoding.js";

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

}