import { getWeatherDescription } from "../utils/weatherInterpreter.js";
import { analyzeWeatherTrend } from "../utils/weatherTrend.js";
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
// ================= DAILY CARD COMPONENT =================
function createDailyCard(date, code, max, min) {
    return `
    <div class="day-card">
      <p class="day-date">${date}</p>
      <p>${getWeatherDescription(code)}</p>
      <p>Max : <span class="value">${max} °C</span></p>
      <p>Min : <span class="value">${min} °C</span></p>
     
    </div>
  `;
}
// ================= DAILY CARDS RENDERER =================
function renderDailyCards(dates, codes, maxTemps, minTemps) {
    return dates.map((date, i) => createDailyCard(date, codes[i], maxTemps[i], minTemps[i])).join("");
}
// ================= DAILY WEATHER =================
export function renderDaily(el, data) {
    let currentBlock = 0;
    const blockCount = Math.ceil(data.time.length / 7); // On affiche 7 jours par bloc
    function updateView() {
        const start = currentBlock * 7;
        const end = start + 7;
        const dates = data.time.slice(start, end);
        const codes = data.weather_code.slice(start, end);
        const maxTemps = data.temperature_2m_max.slice(start, end);
        const minTemps = data.temperature_2m_min.slice(start, end);
        const trend = analyzeWeatherTrend(codes);
        const cardsHtml = renderDailyCards(dates, codes, maxTemps, minTemps);
        el.innerHTML = `
      <div class="daily-header">
        <button class="prev-block" ${currentBlock === 0 ? "disabled" : ""}>◀</button>
        <h2>Prévisions — Semaine ${currentBlock + 1}</h2>
        <button class="next-block" ${currentBlock === blockCount - 1 ? "disabled" : ""}>▶</button>
      </div>

      <p class="trend">Tendance : <span class="value">${trend}</span></p>
      <div class="days-grid">${cardsHtml}</div>
    `;
        el.querySelector(".prev-block")?.addEventListener("click", () => {
            currentBlock--;
            updateView();
        });
        el.querySelector(".next-block")?.addEventListener("click", () => {
            currentBlock++;
            updateView();
        });
    }
    updateView();
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
