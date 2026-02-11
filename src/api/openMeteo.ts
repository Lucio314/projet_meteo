import { CurrentWeather, DailyWeather } from "../models/weather"

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather(lat: number, lon: number) {
  const url =
    `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&daily=temperature_2m_max,temperature_2m_min`;

  const res = await fetch(url);

  if (!res.ok) throw new Error("Erreur API");

  const data = await res.json();

  if (!data.current_weather || !data.daily) {
    throw new Error("Réponse incomplète API");
  }

  return {
    current: data.current_weather as CurrentWeather,
    daily: data.daily as DailyWeather,
  };
}
