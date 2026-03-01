import { fetchWeather } from "./api/openMeteo.js";
import { geocodeLocation } from "./api/nominatim.js";
import { renderCurrent, renderHourly } from "./ui/render.js";
import { renderDaily } from "./ui/renderDailyUtils.js";
const BLOIS_LAT = 47.5943;
const BLOIS_LON = 1.3291;
const TTL_MS = 10 * 60 * 1000; // 10 minutes
async function loadWeather(lat, lon, cityName) {
    const currentEl = document.getElementById("current");
    const dailyEl = document.getElementById("daily");
    const hourlyEl = document.getElementById("hourly");
    const mainTitle = document.getElementById("main-title");
    const data = await fetchWeatherCached(lat, lon);
    renderCurrent(currentEl, data.current);
    renderDaily(dailyEl, data.daily);
    renderHourly(hourlyEl, data.hourly, data.current.time);
    if (mainTitle)
        mainTitle.textContent = `Météo – ${cityName}`;
}
const weatherCache = new Map();
async function fetchWeatherCached(lat, lon) {
    const key = `${lat},${lon}`;
    const cached = weatherCache.get(key);
    if (cached && Date.now() - cached.cachedAt < TTL_MS)
        return cached.data; // Retourne les données en cache si elles sont encore valides
    const data = await fetchWeather(lat, lon);
    weatherCache.set(key, { data, cachedAt: Date.now() });
    return data;
}
function loadLocations() {
    const stored = localStorage.getItem("saved_locations");
    if (!stored)
        return [];
    try {
        const parsed = JSON.parse(stored);
        return parsed.map((loc) => ({ name: loc.name, lat: loc.lat, lon: loc.lon }));
    }
    catch (err) {
        console.warn("Données de localisation corrompues, réinitialisation.");
        localStorage.removeItem("saved_locations");
        return [];
    }
}
function saveLocations(locations) {
    localStorage.setItem("saved_locations", JSON.stringify(locations));
}
const blois = { name: "Blois", lat: BLOIS_LAT, lon: BLOIS_LON };
// On charge les locations sauvegardées, en s'assurant que la localisation par défaut (Blois) est toujours présente
const locations = [
    blois,
    ...loadLocations().filter(l => l.lat !== BLOIS_LAT || l.lon !== BLOIS_LON)
];
// Ajoute une nouvelle location à la liste et la sauvegarde, en évitant les doublons
function addLocation(newLoc) {
    // vérifions s'il n'existe pas déjà une location avec le même nom ou les mêmes coordonnées
    for (const loc of locations) {
        if ((loc.lat === newLoc.lat && loc.lon === newLoc.lon))
            return; // Évite les doublons
    }
    locations.push(newLoc);
    saveLocations(locations);
    loadWeather(newLoc.lat, newLoc.lon, newLoc.name);
}
// Supprime une location de la liste et met à jour le stockage
function removeLocation(index) {
    if (index < 0 || index >= locations.length)
        return;
    if (index === 0)
        return; // on ne supprime pas la localisation par défaut
    locations.splice(index, 1);
    saveLocations(locations);
    if (locations.length > 0) {
        const last = locations[locations.length - 1];
        loadWeather(last.lat, last.lon, last.name);
    }
    else {
        loadWeather(BLOIS_LAT, BLOIS_LON, "Blois");
    }
}
// renderTabs gère l'affichage des onglets et les interactions avec le menu de filtre
function renderTabs(locations) {
    const tabsContainer = document.getElementById("tabs");
    tabsContainer.innerHTML = "";
    locations.forEach((loc, index) => {
        const tab = document.createElement("button");
        tab.className = "tab-btn";
        tab.textContent = loc.name.split(",")[0]; // Affiche seulement le nom de la ville, pas le pays
        if (index === 0)
            tab.classList.add("active");
        tab.onclick = () => {
            document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
            tab.classList.add("active");
            loadWeather(loc.lat, loc.lon, loc.name);
        };
        if (index > 0) {
            const closeBtn = document.createElement("span");
            closeBtn.textContent = " ✕";
            closeBtn.className = "tab-close";
            closeBtn.onclick = (e) => {
                e.stopPropagation(); // empêche le clic de déclencher le tab.onclick sinon le tab se réactive après suppression alors qu'on voulait juste supprimer
                removeLocation(index);
                renderTabs(locations);
            };
            tab.appendChild(closeBtn);
        }
        tabsContainer.appendChild(tab);
        tabsContainer.style.margin = "15px";
        tabsContainer.style.display = "flex";
        tabsContainer.style.gap = "5px";
    });
}
async function init() {
    const cityInput = document.getElementById("city-input");
    cityInput.onchange = async () => {
        const query = cityInput.value.trim();
        if (!query)
            return;
        try {
            const results = await geocodeLocation(query);
            if (results.length === 0) {
                alert("Aucun résultat trouvé.");
                return;
            }
            addLocation({ name: results[0].display_name, lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) });
            renderTabs(locations);
            cityInput.value = "";
        }
        catch (err) {
            alert("Erreur lors de la recherche.");
            console.error(err);
        }
    };
    document.addEventListener("click", (e) => {
        const target = e.target;
        if (!target.classList.contains("toggle-details"))
            return;
        const details = target.closest(".current-main")?.nextElementSibling;
        if (!details?.classList.contains("current-details"))
            return;
        const hidden = details.classList.toggle("hidden");
        target.textContent = hidden ? "Voir plus" : "Voir moins";
    });
    try {
        await loadWeather(BLOIS_LAT, BLOIS_LON, "Blois");
    }
    catch (err) {
        document.getElementById("current").innerHTML = "Erreur chargement météo";
        console.error(err);
    }
}
init();
