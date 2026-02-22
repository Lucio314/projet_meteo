export function getWeatherDescription(code) {
    if (code === 0)
        return "Ciel dégagé";
    if ([1, 2, 3].includes(code))
        return "Nuageux";
    if ([45, 48].includes(code))
        return "Brouillard";
    if ([51, 53, 55, 56, 57].includes(code))
        return "Bruine";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
        return "Pluie";
    if ([71, 73, 75, 77, 85, 86].includes(code))
        return "Neige";
    if ([95, 96, 99].includes(code))
        return "Orage";
    return "Conditions inconnues";
}
