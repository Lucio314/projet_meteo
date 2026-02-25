import { fetchWeather } from "./api/openMeteo.js";
import { renderCurrent, renderDaily, renderHourly, } from "./ui/render.js";

const BLOIS_LAT = 47.5943;
const BLOIS_LON = 1.3291;

async function init() {
  const currentEl = document.getElementById("current")!;
  const dailyEl = document.getElementById("daily")!;
  const hourlyEl = document.getElementById("hourly")!;
  


  try {
    const data = await fetchWeather(BLOIS_LAT, BLOIS_LON);

    renderCurrent(currentEl, data.current);
    renderDaily(dailyEl, data.daily);
    renderHourly(hourlyEl, data.hourly, data.current.time);

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains("toggle-details")) {
        const container = target.closest(".current-weather");
        const details = container?.querySelector(".current-details");

        details?.classList.toggle("hidden");
      }
    });

  } catch (err) {
    currentEl.innerHTML = "Erreur chargement météo";
    console.error(err);
  }
}

init();
