import type { WeatherResponse } from "../models/weather.js";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url =
    `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m` +
    `&daily=temperature_2m_max,temperature_2m_min`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Erreur API météo");
  }

  const data = await res.json();

  if (!data.current || !data.daily) {
    throw new Error("Réponse API incomplète");
  }

  return data as WeatherResponse;
}
