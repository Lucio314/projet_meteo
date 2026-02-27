// Oui mais laissons ça, pour le moment, c'est mon binome qui le fera, nous on va passer à la question 3 qui porte sur la géolocalisations
// 3) Vis à vis des localisations :
// • Permettre à l’utilisateur d’afficher la météo actuelle, journalière et future d’un endroit précis
// (utilisez les coordonnées latitude/longitude)
// • Permettre à l’utilisateur d’afficher les informations correspondantes à plusieurs localisations
// en même temps
// • Permettre à l’utilisateur d’enregistrer une localisation, et la stocker localement, pour pouvoir
// la proposer facilement à l’utilisateur lors d’un prochain passage sur la page.
// • Permettre à l’utilisateur de rechercher une localisation grâce à son nom. Pour cela, vous
// pouvez utiliser l’API https://nominatim.openstreetmap.org
const GEOCODING_URL = "https://nominatim.openstreetmap.org/search";
export async function geocodeLocation(query) {
    const url = `${GEOCODING_URL}?q=${encodeURIComponent(query)}&format=json&limit=5`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Erreur API géocoding: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
}
