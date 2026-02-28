import { getWeatherDescription } from "../utils/weatherInterpreter.js";
import type { CurrentWeather, HourlyWeather } from "../models/weather.js";

function setupFilterEvents() {
  const btnSettings = document.getElementById("btn-settings");
  const filterMenu = document.getElementById("filter-menu");

  btnSettings?.addEventListener("click", (e) => {
    e.preventDefault();
    filterMenu?.classList.toggle("hidden");
  });

  const filters = [
    { cb: "check-ressenti", row: "info-ressenti" },
    { cb: "check-humidite", row: "info-humidite" },
    { cb: "check-precip", row: "info-precip" },
    { cb: "check-vent", row: "info-vent" }
  ];

  filters.forEach(({ cb, row }) => {
    const checkbox = document.getElementById(cb) as HTMLInputElement;
    const infoRow = document.getElementById(row);
    if (checkbox && infoRow) {
      checkbox.onchange = () => {
        infoRow.style.display = checkbox.checked ? "flex" : "none";
        // Si le bouton de filtre perds le focus après clic, on masque le menu
        btnSettings?.addEventListener("focusout", () => {
          setTimeout(() => {
            if (!filterMenu?.contains(document.activeElement)) {
              filterMenu?.classList.add("hidden");
            }
          }, 100);
        });
      };
    }

  });
}

export function renderCurrent(el: HTMLElement, data: CurrentWeather) {
  el.innerHTML = `
    <h2>Météo actuelle</h2>
    <div class="current-main">
      <div class="current-temp">${data.temperature_2m} °C</div>
      <div class="current-desc">${getWeatherDescription(data.weather_code)}</div>
      <div class="toolbar">
        <button id="btn-settings" class="circle-btn" title="Filtres">⚙️</button>
        <div id="filter-menu" class="hidden">
          <p>Afficher :</p>
          <div class="filter-options">
            <label><input type="checkbox" id="check-ressenti" checked> Ressenti</label>
            <label><input type="checkbox" id="check-humidite" checked> Humidité</label>
            <label><input type="checkbox" id="check-precip" checked> Précipitations</label>
            <label><input type="checkbox" id="check-vent" checked> Vent</label>
          </div>
        </div>
      </div>
    </div>
    <div class="current-details">
      <p id="info-heure">Heure : <span class="value">${data.time.split("T")[1]}</span></p>
      <p id="info-ressenti" style="display:flex">Ressenti : <span class="value">${data.apparent_temperature} °C</span></p>
      <p id="info-humidite" style="display:flex">Humidité : <span class="value">${data.relative_humidity_2m} %</span></p>
      <p id="info-precip" style="display:flex">Précipitations : <span class="value">${data.precipitation} mm</span></p>
      <p id="info-vent" style="display:flex">Vent : <span class="value">${data.wind_speed_10m} km/h</span></p>
    </div>
  `;
  setupFilterEvents();
}

export function renderHourly(el: HTMLElement, data: HourlyWeather, currentTime: string) {
  const startIndex = data.time.findIndex(t => t >= currentTime);
  if (startIndex === -1) {
    el.innerHTML = "<p>Aucune donnée horaire disponible</p>";
    return;
  }

  const times = data.time.slice(startIndex, startIndex + 24);
  const temps = data.temperature_2m.slice(startIndex, startIndex + 24);

  el.innerHTML = `
    <h2>Heure par heure</h2>
    <ul class="hourly-row">
      ${times.map((t, i) => `
        <li>
          <span class="hour">${t.split("T")[1]}</span>
          <span class="temp">${temps[i]} °C</span>
        </li>
      `).join("")}
    </ul>
  `;
}