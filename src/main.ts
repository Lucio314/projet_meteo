import { fetchWeather } from "./api/openMeteo.js";
import { renderCurrent, renderDaily, renderHourly } from "./ui/render.js";
import { renderDailyMorino } from "./ui/renderDailyUtils.js";

const BLOIS_LAT = 47.5943;
const BLOIS_LON = 1.3291;

async function init() {
  const currentEl = document.getElementById("current")!;
  const dailyEl = document.getElementById("daily")!;
  const hourlyEl = document.getElementById("hourly")!;
  


  try {
    const data = await fetchWeather(BLOIS_LAT, BLOIS_LON);

    renderCurrent(currentEl, data.current);
    // renderDaily(dailyEl, data.daily);
    renderDailyMorino(dailyEl, data.daily);
    renderHourly(hourlyEl, data.hourly, data.current.time);

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      if (!target.classList.contains("toggle-details")) return;

      const main = target.closest(".current-main"); // On suppose que le bouton est à l'intérieur de .current-main
      const details = main?.nextElementSibling as HTMLElement | null;

      if (!details || !details.classList.contains("current-details")) return;

      const isHidden = details.classList.toggle("hidden");

      target.textContent = isHidden ? "Voir plus" : "Voir moins";
    });

  } catch (err) {
    currentEl.innerHTML = "Erreur chargement météo";
    console.error(err);
  }
}

init();
