import { CurrentWeather, DailyWeather } from "../models/weather";

export function renderCurrent(el: HTMLElement, data: CurrentWeather) {
  el.innerHTML = `
    <h2>Météo actuelle</h2>
    <p>Température : ${data.temperature} °C</p>
    <p>Vent : ${data.windspeed} km/h</p>
    <p>Heure : ${data.time}</p>
  `;
}

export function renderDaily(el: HTMLElement, data: DailyWeather) {
  el.innerHTML = `
    <h2>Aujourd'hui</h2>
    <p>Min : ${data.temperature_2m_min[0]} °C</p>
    <p>Max : ${data.temperature_2m_max[0]} °C</p>
  `;
}
