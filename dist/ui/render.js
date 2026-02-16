export function renderCurrent(el, data) {
    el.innerHTML = `
    <h2>Météo actuelle</h2>
    <p>Température : ${data.temperature_2m} °C</p>
    <p>Heure : ${data.time}</p>
  `;
}
export function renderDaily(el, data) {
    el.innerHTML = `
    <h2>Aujourd'hui</h2>
    <p>Min : ${data.temperature_2m_min[0]} °C </p>
    <p>Max : ${data.temperature_2m_max[0]} °C</p>
  `;
}
