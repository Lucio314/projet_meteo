const GEOCODING_URL = "https://nominatim.openstreetmap.org/search";
export async function geocodeLocation(query) {
    const url = `${GEOCODING_URL}?q=${encodeURIComponent(query)}&format=json&limit=5`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Erreur géocoding: ${res.status} ${res.statusText}`);
    return res.json();
}
