
# Tasmanië 2026

Reiswebsite voor de Tasmanië rondreis van 2026.
Volledig statisch gegenereerd (SSG) met Astro + React + Leaflet.

## Features
- **Planning**: Fullscreen dag-tot-dag overzicht.
- **Verblijven**: Interactieve kaart en grid met accommodaties.
- **Vluchten**: Visuele tijdlijn van de reis.
- **Data**: Excel als single source of truth (automatische conversie).

## Tech Stack
- **Framework**: Astro 5 (+ React integratie)
- **Styling**: Vanilla CSS (Custom Properties / Design Tokens)
- **Map**: Leaflet / React Leaflet
- **Data Pipeline**: XLSX -> JSON script
- **Testing**: Vitest + Playwright

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```
   Dit script voert eerst `npm run data:build` uit om de Excel data om te zetten naar JSON.

## Data Workflow

De inhoud van de site wordt beheerd via `assets/Tasmanië 2026-2027.xlsx`.

Om de site bij te werken:
1. Pas het Excel bestand aan.
2. Run `npm run data:build` lokaal om JSON te verversen.
3. Commit de wijzigingen (zowel `.xlsx` als `.json` updates).
   - *Optioneel*: De JSON wordt ook automatisch gegenereerd tijdens de build in CI.

## Deployment

De site wordt gehost op GitHub Pages via GitHub Actions.
Elke push naar `main` triggert een build & deploy workflow.

Zie `.github/workflows/deploy.yml` voor details.

## Testing

- **Unit Tests**: `npm run test` (Vitest)
- **E2E Tests**: `npm run test:e2e` (Playwright)
