import { getWeatherDescription } from "../utils/weatherInterpreter.js";
function setupInitialEvents() {
    const btnSettings = document.getElementById('btn-settings');
    const filterMenu = document.getElementById('filter-menu');
    btnSettings?.addEventListener('click', (e) => {
        e.preventDefault();
        filterMenu?.classList.toggle('hidden');
    });
    const filters = [
        { cb: 'check-ressenti', row: 'info-ressenti' },
        { cb: 'check-humidite', row: 'info-humidite' },
        { cb: 'check-precip', row: 'info-precip' },
        { cb: 'check-vent', row: 'info-vent' }
    ];
    filters.forEach(item => {
        const checkbox = document.getElementById(item.cb);
        const infoRow = document.getElementById(item.row);
        if (checkbox && infoRow) {
            checkbox.onchange = () => {
                infoRow.style.display = checkbox.checked ? 'flex' : 'none';
            };
        }
    });
}
// ================= CURRENT WEATHER =================
export function renderCurrent(el, data) {
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
          <button id="btn-settings" class="circle-btn" title="Paramètres">⏳</button>

          <div id="filter-menu" class="hidden">
              <p>Afficher :</p>
              <div class="filter-options">
              <label><input type="checkbox" id="check-ressenti" checked> Ressenti</label>
              <label><input type="checkbox" id="check-humidite" checked> Humidité</label>
              <label><input type="checkbox" id="check-precip" checked> Précipitations</label>
              
              </div>
          </div>

    <div class="current-details ">
      <p id="info-heure">Heure : <span class="value">${data.time.split("T")[1]}</span></p>
      <p id="info-ressenti">Ressenti : <span class="value">${data.apparent_temperature} °C</span></p>
      <p id="info-humidite">Humidité : <span class="value">${data.relative_humidity_2m} %</span></p>
      <p id="info-precip">Précipitations : <span class="value">${data.precipitation} mm</span></p>
      
    </div>

      
    </div>

  `;
    setupInitialEvents();
}
// ================= DAILY WEATHER =================
export function renderDaily(el, data) {
    // On génère le HTML pour chaque jour (data.time contient les 7 dates)
    const dailyHtml = data.time.map((date, i) => {
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
export function renderHourly(el, data, currentTime) {
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
