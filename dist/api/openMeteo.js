const BASE_URL = "https://api.open-meteo.com/v1/forecast";
export async function fetchWeather(lat, lon) {
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation,wind_speed_10m` +
        `&hourly=temperature_2m,apparent_temperature,precipitation,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,sunrise,sunset` +
        `&timezone=Europe/Paris`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Erreur API météo");
    }
    const data = await res.json();
    if (!data.current || !data.daily || !data.hourly) {
        throw new Error("Réponse API incomplète");
    }
    return data;
}
