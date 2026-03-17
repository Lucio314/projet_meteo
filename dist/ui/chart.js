let weatherChart = null; // stocker instance du graphique
export function renderWeatherChart(canvasId, data, currentTime) {
    const canvas = document.getElementById(canvasId);
    if (!canvas)
        return;
    const ctx = canvas.getContext('2d'); //moteur de dessin en 2d du nav ( outil utilisé pour dessiner le graphe)
    const startIndex = data.time.findIndex(t => t >= currentTime);
    const subsetLabels = data.time.slice(startIndex, startIndex + 12).map(t => t.split("T")[1]); // prendre les 12 premières heures  , avec map laissé la date et conserver juste l'heure
    const subsetTemps = data.temperature_2m.slice(startIndex, startIndex + 12);
    const subsetApparent = data.apparent_temperature.slice(startIndex, startIndex + 12);
    const subsetPrecip = data.precipitation.slice(startIndex, startIndex + 12);
    const subsetCodes = data.weather_code.slice(startIndex, startIndex + 12);
    if (weatherChart)
        weatherChart.destroy(); // si weather contient un graphique actuel on supprime de la mémoire
    const gradient = ctx.createLinearGradient(0, 0, 0, 400); //remplissage qui part du haut vers le bas
    gradient.addColorStop(0, 'rgba(233, 197, 137, 0.4)');
    gradient.addColorStop(1, 'rgba(32, 34, 49, 0)');
    // @ts-ignore
    weatherChart = new Chart(canvas, {
        data: {
            labels: subsetLabels,
            datasets: [
                {
                    type: 'line',
                    label: 'Température',
                    data: subsetTemps,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: '#E9C589',
                    tension: 0.4,
                    pointRadius: 0,
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: 'Ressentie',
                    data: subsetApparent,
                    borderColor: 'rgba(233, 197, 137, 0.3)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointRadius: 0,
                    yAxisID: 'y' // utilise l'echelle de gauche , axe température
                },
                {
                    type: 'bar',
                    label: 'Précipitations',
                    data: subsetPrecip,
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    yAxisID: 'y1', //utilise l'échelle de droite - axe pluie
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            //maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#aaa', callback: (v) => v + '°' } //callback pour unité à coté des chiffres
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { display: false },
                    beginAtZero: true,
                    ticks: { color: '#60a5fa', callback: (v) => v + 'mm' }
                },
                x: { grid: { display: false }, ticks: { color: '#aaa' } }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#aaa', usePointStyle: true, boxWidth: 6 }
                },
            }
        }
    });
}
