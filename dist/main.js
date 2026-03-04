import { geocodeLocation, reverseGeocode } from "./api/nominatim.js";
import { renderCurrent, renderHourly } from "./ui/render.js";
import { renderDaily } from "./ui/renderDailyUtils.js";
import { loadLocations, saveLocations } from "./utils/locationUtils.js";
import { fetchWeatherCached } from "./api/openMeteo.js";
const BLOIS_LAT = 47.5943;
const BLOIS_LON = 1.3291;
const blois = { name: "Blois", lat: BLOIS_LAT, lon: BLOIS_LON, region: "Centre-Val de Loire" };
// On charge les locations sauvegardées, en s'assurant que la localisation par défaut (Blois) est toujours présente
const locations = [
    blois,
    ...loadLocations().filter(l => l.lat !== BLOIS_LAT || l.lon !== BLOIS_LON)
];
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
    });
}
async function init() {
    const cityInput = document.getElementById("city-input");
    // cityInput.onchange = async () => {
    //   const query = cityInput.value.trim();
    //   if (!query) return;
    //   try {
    //     const results = await geocodeLocation(query);
    //     if (results.length === 0) { alert("Aucun résultat trouvé."); return; }
    //     addLocation({ name: results[0].display_name, lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon), region: results[0].address?.state || "Inconnu" });
    //     renderTabs(locations);
    //     cityInput.value = "";
    //   } catch (err) {
    //     alert("Erreur lors de la recherche.");
    //     console.error(err);
    //   }
    // };
    // Handler du bouton Ajouter
    const latInput = document.getElementById("lat-input");
    const lonInput = document.getElementById("lon-input");
    const btnAdd = document.getElementById("btn-add-location");
    btnAdd.onclick = async () => {
        const cityQuery = cityInput.value.trim();
        const latVal = latInput.value.trim();
        const lonVal = lonInput.value.trim();
        if (cityQuery) {
            // cas nom de ville
            try {
                const results = await geocodeLocation(cityQuery);
                if (results.length === 0) {
                    alert("Aucun résultat trouvé.");
                    return;
                }
                const lat = parseFloat(results[0].lat);
                const lon = parseFloat(results[0].lon);
                const { name, region } = await reverseGeocode(lat, lon);
                addLocation({ name: name, lat, lon, region });
                renderTabs(locations);
                cityInput.value = "";
            }
            catch (err) {
                alert("Erreur lors de la recherche.");
                console.error(err);
            }
        }
        else if (latVal && lonVal) {
            // cas coordonnées
            const lat = parseFloat(latVal);
            const lon = parseFloat(lonVal);
            if (isNaN(lat) || isNaN(lon)) {
                alert("Coordonnées invalides.");
                return;
            }
            const { name, region } = await reverseGeocode(lat, lon);
            addLocation({ name, lat, lon, region });
            renderTabs(locations);
            latInput.value = "";
            lonInput.value = "";
        }
        else {
            alert("Entrez un nom de ville ou des coordonnées.");
        }
    };
    // on change les modes d'affichage (region ou bounding box) 
    const modeButtons = document.querySelectorAll(".mode-btn");
    modeButtons.forEach(btn => {
        btn.onclick = () => {
            modeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const mode = btn.getAttribute("data-mode");
            document.querySelectorAll(".mode-panel").forEach(panel => {
                if (panel.id === `mode-${mode}`) {
                    panel.classList.remove("hidden");
                }
                else {
                    panel.classList.add("hidden");
                }
            });
            // Cacher le bouton reset quand on change de mode
            document.getElementById("filter-results")?.classList.add("hidden");
        };
    });
    // filtrage par bounding box (on teste les villes de france avec 45 51 -5 10)
    const btnFilterBbox = document.getElementById("btn-filter-bbox");
    btnFilterBbox.onclick = () => {
        const minLat = parseFloat(document.getElementById("min-lat").value);
        const maxLat = parseFloat(document.getElementById("max-lat").value);
        const minLon = parseFloat(document.getElementById("min-lon").value);
        const maxLon = parseFloat(document.getElementById("max-lon").value);
        if ([minLat, maxLat, minLon, maxLon].some(v => isNaN(v))) {
            alert("Veuillez entrer des coordonnées valides.");
            return;
        }
        if (minLat > maxLat || minLon > maxLon) {
            alert("Les valeurs minimales doivent être inférieures aux valeurs maximales.");
            return;
        }
        const filtered = locations.filter(loc => loc.lat >= minLat && loc.lat <= maxLat && loc.lon >= minLon && loc.lon <= maxLon);
        if (filtered.length === 0) {
            alert("Aucune location trouvée dans cette bounding box.");
            return;
        }
        renderTabs(filtered);
        // bouton de retour à la liste complète
        const filterResults = document.getElementById("filter-results");
        filterResults.innerHTML = `<button id="btn-clear-filter">Reset</button>`;
        filterResults.classList.remove("hidden");
        document.getElementById("btn-clear-filter").onclick = () => {
            renderTabs(locations);
            filterResults.classList.add("hidden");
            loadWeather(locations[0].lat, locations[0].lon, locations[0].name);
        };
        document;
        // on affiche les détails de la première location filtrée
        loadWeather(filtered[0].lat, filtered[0].lon, filtered[0].name);
    };
    // filtrage par région
    const btnFilterRegion = document.getElementById("btn-filter-region");
    btnFilterRegion.onclick = () => {
        const regionQuery = document.getElementById("region-input").value.trim().toLowerCase();
        if (!regionQuery) {
            alert("Veuillez entrer un nom de région ou département.");
            return;
        }
        const filtered = locations.filter(loc => loc?.name.toLowerCase().includes(regionQuery));
        if (filtered.length === 0) {
            alert("Aucune location trouvée pour cette région.");
            return;
        }
        renderTabs(filtered);
        // bouton de retour à la liste complète
        const filterResults = document.getElementById("filter-results");
        filterResults.innerHTML = `<button id="btn-clear-filter">Reset</button>`;
        filterResults.classList.remove("hidden");
        document.getElementById("btn-clear-filter").onclick = () => {
            renderTabs(locations);
            filterResults.classList.add("hidden");
            loadWeather(locations[0].lat, locations[0].lon, locations[0].name);
        };
        // on affiche les détails de la première location filtrée
        loadWeather(filtered[0].lat, filtered[0].lon, filtered[0].name);
    };
    try {
        await loadWeather(BLOIS_LAT, BLOIS_LON, "Blois");
        renderTabs(locations);
    }
    catch (err) {
        document.getElementById("current").innerHTML = "Erreur chargement météo";
        console.error(err);
    }
}
init();
