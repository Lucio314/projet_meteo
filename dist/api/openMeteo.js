const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const TTL_MS = 10 * 60 * 1000; // 10 minutes
const weatherCache = new Map();
export async function fetchWeather(lat, lon) {
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation,wind_speed_10m` +
        `&hourly=temperature_2m,apparent_temperature,precipitation,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,sunrise,sunset` +
        `&timezone=auto` + `&forecast_days=14`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Erreur API météo: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.current || !data.daily || !data.hourly) {
        throw new Error("Réponse API incomplète");
    }
    return data;
}
export async function fetchWeatherCached(lat, lon) {
    const key = `${lat},${lon}`;
    const cached = weatherCache.get(key);
    if (cached && Date.now() - cached.cachedAt < TTL_MS)
        return cached.data; // Retourne les données en cache si elles sont encore valides
    const data = await fetchWeather(lat, lon);
    weatherCache.set(key, { data, cachedAt: Date.now() });
    return data;
}
