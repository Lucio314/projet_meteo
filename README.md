# Projet Météo -- Open-Meteo + TypeScript

Petite application web permettant d'afficher des informations
météorologiques à partir de l'API Open-Meteo.

------------------------------------------------------------------------

## API utilisée

Open-Meteo (aucune clé API requise)

<https://open-meteo.com/>

------------------------------------------------------------------------

## Fonctionnalités

L'application permet :

- Afficher la météo actuelle
- Afficher les températures minimales et maximales du jour
- Afficher l'évolution de la température heure par heure
- Visualiser les températures sur un graphe
- Filtrer les informations affichées
- etc

------------------------------------------------------------------------

## Technologies

- TypeScript
- JavaScript (généré dans `/dist`)
- HTML / CSS
- API Open-Meteo
- Chart.js (graphes)

L'application fonctionne entièrement dans le navigateur.

------------------------------------------------------------------------

## Structure du projet

src/
  api/ → appels à l'API météo
  models/ → interfaces TypeScript
  ui/ → affichage et rendu HTML
  main.ts → point d'entrée

dist/ → fichiers JavaScript compilés

------------------------------------------------------------------------

## Compilation TypeScript

Compiler le projet :

    node node_modules/typescript/bin/tsc

Mode développement continu :

    npm run watch

Mode server web en local :

    npx serve
------------------------------------------------------------------------

## Fuseau horaire

Les requêtes utilisent le fuseau :

    timezone=Europe/Paris

pour garantir un affichage correct des heures.

------------------------------------------------------------------------

## Travail en équipe

Organisation des branches :

- main → version stable
- dev → version de développement
- feature/api (dévellopper par Morino)
- feature/ui (développer par Carlos)

Chaque membre travaille sur sa branche.

------------------------------------------------------------------------

## Règles importantes

- Ne pas modifier directement main
- Toujours récupérer dev avant de coder
- Faire des commits courts et explicites

------------------------------------------------------------------------

## Remarque

Les interfaces TypeScript reflètent strictement les réponses de l'API
Open-Meteo.

## Pour Carlos et Morino

Avant de commencer à coder pour éviter les mauvaises surprises!

    git checkout dev
    git pull
    git checkout feature/xxx
    git merge dev
