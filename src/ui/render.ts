import { getWeatherDescription } from "../utils/weatherInterpreter.js";
import type { CurrentWeather, DailyWeather, HourlyWeather } from "../models/weather.js";


// ================= CURRENT WEATHER =================

export function renderCurrent(el: HTMLElement, data: CurrentWeather) {

  const description = getWeatherDescription(data.weather_code);

  el.innerHTML = `
    <h2>Météo actuelle</h2>

    <div class="current-main">
      <div class="current-temp">${data.temperature_2m} °C</div>
      <div class="current-desc">${description}</div>
      <div class="current-wind">
        Vent : <span class="value">${data.wind_speed_10m} km/h</span>
        <button class="toggle-details">Voir plus</button>
      </div>
    </div>

    <div class="current-details hidden">
      <p>Ressenti : <span class="value">${data.apparent_temperature} °C</span></p>
      <p>Humidité : <span class="value">${data.relative_humidity_2m} %</span></p>
      <p>Précipitations : <span class="value">${data.precipitation} mm</span></p>
      <p>Heure : ${data.time.split("T")[1]}</p>
    </div>
  `;
}



// ================= DAILY WEATHER =================

export function renderDaily(el: HTMLElement, data: DailyWeather) {
  el.innerHTML = `
    <h2>Aujourd'hui</h2>
    <p>Min : <span class="value">${data.temperature_2m_min[0]} °C</span></p>
    <p>Max : <span class="value">${data.temperature_2m_max[0]} °C</span></p>
    <p>Précipitations : <span class="value">${data.precipitation_sum[0]} mm</span></p>
    <p>Lever du soleil : ${data.sunrise[0].split("T")[1]}</p>
    <p>Coucher du soleil : ${data.sunset[0].split("T")[1]}</p>
  `;
}


// ================= HOURLY WEATHER =================

export function renderHourly(
  el: HTMLElement,
  data: HourlyWeather,
  currentTime: string
) {
  const hoursToShow = 24;

  const startIndex = data.time.findIndex(t => t >= currentTime);

  if (startIndex === -1) {
    el.innerHTML = "<p>Aucune donnée horaire disponible</p>";
    return;
  }

  const endIndex = startIndex + hoursToShow;

  const hourlyTimes = data.time.slice(startIndex, endIndex);
  const hourlyTemps = data.temperature_2m.slice(startIndex, endIndex);

  const hourlyHtml = hourlyTimes.map((time, i) => {
    const hour = time.split("T")[1];

    return `
      <li>
        <span class="hour">${hour}</span>
        <span class="temp">${hourlyTemps[i]} °C</span>
      </li>
    `;
  }).join("");

  el.innerHTML = `
    <h2>Heure par heure</h2>
    <ul class="hourly-row">
      ${hourlyHtml}
    </ul>
  `;
}
