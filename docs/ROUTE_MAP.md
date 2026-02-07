# Route Map Feature

Deze feature toont een interactieve kaart met alle routes door Tasmanië.

## Bestanden

- `public/blad4.html` - HTML export van routes spreadsheet (Soort route + Adressen)
- `src/pages/route.astro` - Route pagina
- `src/components/RouteMap.tsx` - React component voor de kaart
- `src/components/RouteMapLoader.tsx` - Data loading en geocoding
- `src/lib/routeParser.ts` - Parser voor HTML routes data
- `src/lib/geocoding.ts` - Geocoding met localStorage caching

## Hoe werkt het?

1. **Data parsing**: `routeParser.ts` leest `blad4.html` en parseert de routes
2. **Geocoding**: `geocoding.ts` zet adressen om naar coördinaten via Nominatim API
3. **Caching**: Geocoding resultaten worden opgeslagen in localStorage (30 dagen TTL)
4. **Rendering**: Leaflet kaart met dark theme matching de website stijl

## Routes Data Format

Het `blad4.html` bestand heeft deze structuur:

```html
<table>
  <thead>
    <tr>
      <th>Soort route</th>
      <th>Adres 1</th>
      <th>Adres 2</th>
      <th>Adres 3</th>
      <th>Adres 4</th>
      <th>Adres 5</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Hoofdroute</td>
      <td>Devonport Airport, TAS</td>
      <td>Campbell Town, Tasmanië</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <!-- more rows -->
  </tbody>
</table>
```

## Kleuren

- **Hoofdroute**: `#D4A03D` (Gold accent)
- **Subroute**: `#6B9AC4` (Blue accent)
- **Markers**: `#EAE6DD` (Cream)

## Cache beheer

De geocoding cache wordt automatisch beheerd:
- **TTL**: 30 dagen
- **Storage**: localStorage
- **Cache key**: `geocode_v1_<adres>`

### Cache handmatig legen

In development mode is er een "Clear Cache" knop. In productie kun je de cache legen via console:

```javascript
localStorage.clear();
// Of alleen geocoding cache:
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('geocode_')) {
    localStorage.removeItem(key);
  }
});
```

## Rate Limiting

Nominatim API heeft rate limits. De code gebruikt:
- 1 request per seconde
- Sequentiële requests (geen parallel)
- Caching om herhaalde requests te voorkomen

## Routes bijwerken

1. Update `public/blad4.html` met nieuwe routes
2. Clear de cache (zie hierboven)
3. Refresh de pagina - nieuwe routes worden automatisch geocoded en gecached

## Deployment (GitHub Pages / Static)

Geen extra configuratie nodig. De app gebruikt:
- **Nominatim** (OpenStreetMap) - geen API key vereist
- Client-side geocoding
- localStorage voor persistence

De eerste keer dat routes geladen worden kan enkele seconden duren door geocoding.
Daarna is het instant door caching.
