import { getWeatherDescription } from "../utils/weatherInterpreter.js";
import type { CurrentWeather, DailyWeather, HourlyWeather } from "../models/weather.js";



function setupInitialEvents() {
  const btnAdd = document.getElementById('btn-add-city');
  const btnSettings = document.getElementById('btn-settings');
  const searchBar = document.getElementById('search-bar');
  const details = document.querySelector('.current-details');


  // Action du bouton Settings (Filtres)
  btnSettings?.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (details) {
      details.classList.toggle('hidden');
      console.log("Filtres activés");
    }
  });
}

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
      </div>
        <div class="toolbar">
          <button id="btn-add-city" class="circle-btn" title="Ajouter une ville">➕</button>
          <button id="btn-settings" class="circle-btn" title="Paramètres">⚙️</button>
        </div>
      
    </div>

    <div class="current-details hidden">
      <p>Ressenti : <span class="value">${data.apparent_temperature} °C</span></p>
      <p>Humidité : <span class="value">${data.relative_humidity_2m} %</span></p>
      <p>Précipitations : <span class="value">${data.precipitation} mm</span></p>
      <p>Heure : ${data.time.split("T")[1]}</p>
    </div>
  `;
  setupInitialEvents();
}



// ================= DAILY WEATHER =================

export function renderDaily(el: HTMLElement, data: DailyWeather) {
  // On génère le HTML pour chaque jour (data.time contient les 7 dates)
  const dailyHtml = data.time.map((date, i) => {
    // On formate un peu la date pour qu'elle soit plus jolie (ex: 2024-03-12)
    const shortDate = date.split("-").slice(1).join("/"); 
    const description = getWeatherDescription(data.weather_code[i]);

    return `
      <div class="daily-card">
        <span class="day-date">${shortDate}</span>
        <span class="day-desc">${description}</span>
        <div class="day-temps">
          <span class="max">${data.temperature_2m_max[i]}°</span>
          <span class="min">${data.temperature_2m_min[i]}°</span>
        </div>
      </div>
    `;
  }).join("");

  el.innerHTML = `
    <h2>Prévisions sur 7 jours</h2>
    <div class="daily-container">
      ${dailyHtml}
    </div>
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
