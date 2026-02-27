/*
On va se baser sur les données de dailyWeather pour faire une analyse de tendance météo sur les 7 prochains  jours à partir d'aujourd'hui et dire si le temps est à l'amélioration ou
à la détérioration.
  "daily": {
        "time": [
            "2026-02-24",
            "2026-02-25",
            "2026-02-26",
            "2026-02-27",
            "2026-02-28",
            "2026-03-01",
            "2026-03-02"
        ],
        "weather_code": [
            45,
            45,
            3,
            61,
            61,
            61,
            61
        ],
        "temperature_2m_max": [
            17.2,
            19.1,
            14.2,
            13.5,
            11.6,
            12.2,
            10.7
        ],
        "temperature_2m_min": [
            9.9,
            7.5,
            8.7,
            8.2,
            5.0,
            6.8,
            7.3
        ]
    }
   
*/
import { getWeatherScore } from "./weatherInterpreter.js";
// Cette fonction analyse les codes météo sur une période donnée et retourne une tendance : amélioration, détérioration ou stable
export function analyzeWeatherTrend(weatherCodes) {
    if (weatherCodes.length < 2)
        return "Données insuffisantes";
    const scores = weatherCodes.map(getWeatherScore);
    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid);
    const secondHalf = scores.slice(mid + (scores.length % 2 === 1 ? 1 : 0));
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const delta = avg(secondHalf) - avg(firstHalf);
    const SEUIL = 0.5;
    if (delta > SEUIL)
        return "Amélioration";
    if (delta < -SEUIL)
        return "Dégradation";
    return "Stable";
}
