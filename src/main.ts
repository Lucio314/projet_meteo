import { fetchWeather } from "./api/openMeteo.js";
import { renderCurrent, renderDaily } from "./ui/render.js";

const BLOIS_LAT = 47.5943;
const BLOIS_LON = 1.3291;

async function init() {
  const currentEl = document.getElementById("current")!;
  const dailyEl = document.getElementById("daily")!;

  try {
    const data = await fetchWeather(BLOIS_LAT, BLOIS_LON);

    renderCurrent(currentEl, data.current);
    renderDaily(dailyEl, data.daily);

  } catch (err) {
    currentEl.innerHTML = "Erreur chargement météo";
    console.error(err);
  }
}

init();
