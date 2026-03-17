import { geocodeLocation, getCitiesInBBox, reverseGeocode } from "./api/nominatim.js";
import { renderCurrent, renderHourly } from "./ui/render.js";
import { renderDaily } from "./ui/renderDailyUtils.js";
import { loadLocations, saveLocations } from "./utils/locationUtils.js";
import { fetchWeatherCached } from "./api/openMeteo.js";
import { renderWeatherChart } from "./ui/chart.js";
const BLOIS_LAT = 47.5943;
const BLOIS_LON = 1.3291;
const blois = { name: "Blois", lat: BLOIS_LAT, lon: BLOIS_LON, region: "Centre-Val de Loire" };
// On charge les locations sauvegardées, en s'assurant que la localisation par défaut (Blois) est toujours présente
const locations = [
    //blois,
    ...loadLocations() //.filter(l => l.lat !== BLOIS_LAT || l.lon !== BLOIS_LON)
];
async function loadWeather(lat, lon, cityName) {
    const currentEl = document.getElementById("current");
    const dailyEl = document.getElementById("daily");
    const hourlyEl = document.getElementById("hourly");
    const mainTitle = document.getElementById("main-title");
    const data = await fetchWeatherCached(lat, lon);
    // on garde les données globalement pour les clics sur les jours
    window.weatherData = data;
    // rendu des composants
    renderCurrent(currentEl, data.current);
    renderDaily(dailyEl, data.daily);
    renderHourly(hourlyEl, data.hourly, data.current.time);
    renderWeatherChart("chart", data.hourly, data.current.time);
    // mise à jour du titre
    if (mainTitle) {
        mainTitle.textContent = `Météo – ${cityName}`;
    }
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
    updateRegionDatalist();
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
    updateRegionDatalist();
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
        // par défaut on active la dernière location ajoutée
        if (index === locations.length - 1) {
            document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
            tab.classList.add("active");
        }
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
function updateRegionDatalist() {
    const datalist = document.getElementById("regions-list");
    const regions = [...new Set(locations
            .map(l => l.region)
            .filter((r) => !!r))];
    datalist.innerHTML = regions.map(r => `<option value="${r}">`).join("");
}
async function getInitialLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(blois);
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const { name, region } = await reverseGeocode(lat, lon);
                const loc = { name, lat, lon, region };
                addLocation(loc);
                resolve(loc);
            }
            catch {
                resolve(blois);
            }
        }, () => resolve(blois));
    });
}
async function init() {
    //  INPUTS 
    const cityInput = document.getElementById("city-input");
    // Handler du bouton Ajouter
    const latInput = document.getElementById("lat-input");
    const lonInput = document.getElementById("lon-input");
    const addTabByCoords = document.getElementById("btn-add-coords");
    const addTabByLocation = document.getElementById("btn-add-location");
    const btnBBoxApi = document.getElementById("btn-bbox-api");
    const btnFilterBbox = document.getElementById("btn-filter-bbox");
    //  AJOUT PAR NOM DE VILLE 
    addTabByLocation.onclick = async () => {
        const cityQuery = cityInput.value.trim();
        // cas nom de ville
        if (!cityQuery) {
            alert("Veuillez entrer un nom de ville.");
            return;
        }
        try {
            const results = await geocodeLocation(cityQuery);
            if (results.length === 0) {
                alert("Aucun résultat trouvé.");
                return;
            }
            const lat = parseFloat(results[0].lat);
            const lon = parseFloat(results[0].lon);
            // reverseGeocode pour récupérer un nom propre + région
            const { name, region } = await reverseGeocode(lat, lon);
            addLocation({ name, lat, lon, region });
            renderTabs(locations);
            cityInput.value = "";
        }
        catch (err) {
            window.alert("Erreur lors de la recherche.");
            console.error(err);
        }
    };
    //  AJOUT PAR COORDONNÉES 
    addTabByCoords.onclick = async () => {
        const latVal = latInput.value.trim();
        const lonVal = lonInput.value.trim();
        // cas coordonnées
        const lat = parseFloat(latVal);
        const lon = parseFloat(lonVal);
        if (isNaN(lat) || isNaN(lon)) {
            alert("Coordonnées invalides.");
            return;
        }
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            alert("Les coordonnées doivent être dans les limites valides (lat: -90 à 90, lon: -180 à 180).");
            return;
        }
        const { name, region } = await reverseGeocode(lat, lon);
        addLocation({ name, lat, lon, region });
        renderTabs(locations);
        latInput.value = "";
        lonInput.value = "";
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
    // Fonction commune pour récupérer et valider les coordonnées bbox
    function getBBoxValues() {
        const minLat = parseFloat(document.getElementById("min-lat").value);
        const maxLat = parseFloat(document.getElementById("max-lat").value);
        const minLon = parseFloat(document.getElementById("min-lon").value);
        const maxLon = parseFloat(document.getElementById("max-lon").value);
        if ([minLat, maxLat, minLon, maxLon].some(v => isNaN(v))) {
            alert("Veuillez entrer des coordonnées valides.");
            return null;
        }
        if (minLat > maxLat || minLon > maxLon) {
            alert("Les valeurs minimales doivent être inférieures aux valeurs maximales.");
            return null;
        }
        return { minLat, maxLat, minLon, maxLon };
    }
    // ================= FILTRAGE LOCAL PAR BBOX =================
    // filtrage par bounding box (ex: villes de France 45 51 -5 10)
    // ce filtre agit UNIQUEMENT sur les locations déjà enregistrées (localStorage)
    btnFilterBbox.onclick = () => {
        const bbox = getBBoxValues();
        if (!bbox)
            return;
        const { minLat, maxLat, minLon, maxLon } = bbox;
        // filtrage uniquement sur les villes déjà présentes dans "locations"
        const filtered = locations.filter(loc => loc.lat >= minLat &&
            loc.lat <= maxLat &&
            loc.lon >= minLon &&
            loc.lon <= maxLon);
        if (filtered.length === 0) {
            alert("Aucune location trouvée dans cette bounding box.");
            return;
        }
        // on affiche uniquement les tabs filtrés
        renderTabs(filtered);
        // bouton de retour à la liste complète
        const filterResults = document.getElementById("filter-results");
        filterResults.innerHTML = `<button id="btn-clear-filter">Reset</button>`;
        filterResults.classList.remove("hidden");
        document.getElementById("btn-clear-filter").onclick = () => {
            // on restaure les tabs complets (localStorage)
            renderTabs(locations);
            filterResults.classList.add("hidden");
            loadWeather(locations[0].lat, locations[0].lon, locations[0].name);
        };
        // on affiche la météo de la première ville filtrée
        loadWeather(filtered[0].lat, filtered[0].lon, filtered[0].name);
    };
    // ================= RECHERCHE API PAR BBOX =================
    // récupération de nouvelles villes via Nominatim
    // IMPORTANT : cette action NE MODIFIE PAS les tabs ni le localStorage
    // elle sert uniquement à proposer des villes dans la datalist
    btnBBoxApi.onclick = async () => {
        const bbox = getBBoxValues();
        if (!bbox)
            return;
        const { minLat, maxLat, minLon, maxLon } = bbox;
        try {
            const cities = await getCitiesInBBox(minLat, maxLat, minLon, maxLon);
            // Suppression des doublons par nom de ville
            const uniqueCities = Array.from(new Map(cities.map(c => [c.name.toLowerCase(), c])).values());
            // stocké temporairement pour permettre la sélection via la datalist
            // ceci ne touche pas les tabs ni le localStorage
            window.bboxCities = uniqueCities;
            const datalist = document.getElementById("city-datalist");
            // mise à jour de la datalist avec les villes trouvées
            datalist.innerHTML = uniqueCities
                .map(c => `<option value="${c.name}">`)
                .join("");
        }
        catch (err) {
            console.error(err);
            alert("Erreur lors de la recherche des villes.");
        }
    };
    // FILTRAGE PAR RÉGION 
    const btnFilterRegion = document.getElementById("btn-filter-region");
    btnFilterRegion.onclick = () => {
        let regionQuery = document.getElementById("region-input")
            .value
            .trim()
            .toLowerCase();
        if (!regionQuery) {
            alert("Veuillez entrer un nom de région ou département.");
            return;
        }
        const filtered = locations.filter(loc => loc?.region?.toLowerCase().includes(regionQuery));
        if (filtered.length === 0) {
            alert("Aucune location trouvée pour cette région.");
            return;
        }
        renderTabs(filtered);
        const filterResults = document.getElementById("filter-results");
        filterResults.innerHTML = `<button id="btn-clear-filter">Reset</button>`;
        filterResults.classList.remove("hidden");
        document.getElementById("btn-clear-filter").onclick = () => {
            renderTabs(locations);
            filterResults.classList.add("hidden");
            loadWeather(locations[0].lat, locations[0].lon, locations[0].name);
        };
        // afficher la première ville filtrée
        loadWeather(filtered[0].lat, filtered[0].lon, filtered[0].name);
    };
    try {
        const currentLoc = await getInitialLocation();
        await loadWeather(currentLoc.lat, currentLoc.lon, currentLoc.name);
        renderTabs(locations);
        updateRegionDatalist(); // pour peupler le datalist avec les régions déjà sauvegardées.
    }
    catch (err) {
        document.getElementById("current").innerHTML = "Erreur chargement météo";
        console.error(err);
    }
}
init();
