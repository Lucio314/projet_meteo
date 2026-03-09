/* Cette interface sert de passerelle entre les données de openmétéo et de nominatim
En effet, lat/lon sont des strings dans la réponse de nominatim, mais des nombres dans la réponse d'openmétéo, du coup on convertit
les lat/lon de nominatim en nombre pour les utiliser ensuite dans les appels à openmétéo */
export {};
