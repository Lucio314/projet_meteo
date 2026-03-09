import type { DailyWeather } from "../models/weather.js";
import { formatDate } from "../utils/formData.js";
import { getWeatherDescription, getWeatherEmoji } from "../utils/weatherInterpreter.js";
import { analyzeWeatherTrend } from "../utils/weatherTrend.js";

function createDailyCard(date: string, code: number, max: number, min: number): string {
  const { day, num } = formatDate(date);
  const today = num === new Date().getDate().toString() ? "Aujour." : day;


  return `
    <div class="day-card">
      <div class="day-header">
        <span class="day-num">${num}</span>
        <span class="day-name">${today}</span>
      </div>
      <p class="day-desc" title="${getWeatherDescription(code)}">${getWeatherEmoji(code)}</p>
      <p class="day-max">${max}°</p>
      <p class="day-min">${min}°</p>
    </div>
  `;
}
function renderDailyCards(dates: string[], codes: number[], maxTemps: number[], minTemps: number[]): string {
  return dates.map((date, i) => createDailyCard(date, codes[i], maxTemps[i], minTemps[i])).join("");
}

export function renderDaily(el: HTMLElement, data: DailyWeather) {
  let currentBlock = 0;
  const blockCount = Math.ceil(data.time.length / 7);

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
      currentBlock = Math.max(0, currentBlock - 1);
      updateView();
    });
    el.querySelector(".next-block")?.addEventListener("click", () => {
      currentBlock = Math.min(blockCount - 1, currentBlock + 1);
      updateView();
    });
  }

  updateView();
}