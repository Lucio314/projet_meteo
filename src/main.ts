import { fetchWeather } from "./api/openMeteo.js";
import { geocodeLocation } from "./api/geocoding.js";
import { renderCurrent, renderHourly } from "./ui/render.js";
import { renderDaily } from "./ui/renderDailyUtils.js";

const BLOIS_LAT = 47.5943;
const BLOIS_LON = 1.3291;

async function loadWeather(lat: number, lon: number, cityName: string) {
  const currentEl = document.getElementById("current")!;
  const dailyEl = document.getElementById("daily")!;
  const hourlyEl = document.getElementById("hourly")!;
  const mainTitle = document.getElementById("main-title");

  const data = await fetchWeather(lat, lon);
  renderCurrent(currentEl, data.current);
  renderDaily(dailyEl, data.daily);
  renderHourly(hourlyEl, data.hourly, data.current.time);
  if (mainTitle) mainTitle.textContent = `Météo – ${cityName}`;
}

async function init() {
  const cityInput = document.getElementById("city-input") as HTMLInputElement;

  cityInput.onchange = async () => {
    const query = cityInput.value.trim();
    if (!query) return;
    try {
      const results = await geocodeLocation(query);
      if (results.length === 0) { alert("Aucun résultat trouvé."); return; }
      await loadWeather(parseFloat(results[0].lat), parseFloat(results[0].lon), results[0].name);
    } catch (err) {
      alert("Erreur lors de la recherche.");
      console.error(err);
    }
  };

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("toggle-details")) return;
    const details = target.closest(".current-main")?.nextElementSibling as HTMLElement;
    if (!details?.classList.contains("current-details")) return;
    const hidden = details.classList.toggle("hidden");
    target.textContent = hidden ? "Voir plus" : "Voir moins";
  });

  try {
    await loadWeather(BLOIS_LAT, BLOIS_LON, "Blois");
  } catch (err) {
    document.getElementById("current")!.innerHTML = "Erreur chargement météo";
    console.error(err);
  }
}

init();