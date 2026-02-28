export function getWeatherDescription(code: number): string {

  if (code === 0) return "Ciel dégagé";

  if ([1, 2, 3].includes(code)) return "Nuageux";

  if ([45, 48].includes(code)) return "Brouillard";

  if ([51, 53, 55, 56, 57].includes(code)) return "Bruine";

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Pluie";

  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Neige";

  if ([95, 96, 99].includes(code)) return "Orage";

  return "Conditions inconnues";
}

// Score de 0 à 7  en fonction des codes météo, pour faciliter l'analyse des tendances météo

export function getWeatherScore(code: number): number {
  if (code === 0) return 7; // ciel dégagé
  if ([1, 2, 3].includes(code)) return 6; // nuageux
  if ([45, 48].includes(code)) return 4; // brouillard
  if ([51, 53, 55, 56, 57].includes(code)) return 3; // bruine
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 2; // pluie
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 1;  // neige
  if ([95, 96, 99].includes(code)) return 0; // orage
  return -1; // code inconnu
}