# Resource Hub | PH Transport & Directory

A modern Astro web application with React islands that provides real-time Philippine fuel prices, fare calculations, and Adventist organization directory with map visualization.

## Features

- **Transport Hub**: Real-time fuel prices and fare calculator
  - Live fuel prices from major brands (Shell, Petron, Caltex)
  - Commuter fare calculation based on LTFRB rates
  - Vehicle trip cost estimation

- **Directory Explorer**: Search and browse Adventist organization records
  - Search by name, city, field, or type
  - Cascading region/province/city filters
  - Pagination support

- **Directory Map**: OpenStreetMap visualization
  - Interactive map with markers for directory entries
  - Geocoding using Nominatim (OpenStreetMap)
  - Distance calculation from your location
  - Route calculation using OSRM

## Tech Stack

- [Astro](https://astro.build/) - Static site generation with islands architecture
- [React](https://react.dev/) - Interactive islands
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [@tanstack/react-query](https://tanstack.com/query) - Data fetching and caching
- [react-leaflet](https://react-leaflet.js.org/) - OpenStreetMap integration
- [Leaflet Routing Machine](https://github.com/perryedwards/leaflet-routing-machine) - Route visualization

## Prerequisites

- Node.js 18.14.1 or higher
- npm or pnpm

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/transport-directory-web.git
   cd transport-directory-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API base URLs (or use the defaults):
   ```env
   PUBLIC_TRANSPORT_API_URL=https://ph-transport-api.vercel.app
   PUBLIC_ADVENTIST_API_URL=https://adventist-scraper-api.vercel.app
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:4321`

## Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Geocoding Directory Data

To pre-geocode directory entries for the map (optional):

```bash
npm run geocode
```

This fetches directory entries and geocodes their addresses using Nominatim. Results are saved to `public/geocoded-directory.json`.

**Note**: Nominatim requires a valid User-Agent header and has rate limits (1 request/second). This script respects those limits but may take several minutes for large datasets.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `PUBLIC_TRANSPORT_API_URL`
   - `PUBLIC_ADVENTIST_API_URL`
4. Deploy!

Automatic deployments are set up for the main branch.

### Manual Deploy

```bash
npm run build
vercel deploy
```

## Project Structure

```
/
├── src/
│   ├── components/          # React islands (client:load)
│   │   ├── TransportWidget.tsx
│   │   ├── DirectoryWidget.tsx
│   │   ├── MapWidget.tsx
│   │   ├── regions.ts
│   │   └── ui/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/
│   │       ├── geocode.ts    # Nominatim proxy with rate limiting
│   │       └── directory.ts  # Directory API proxy with fallback
│   ├── lib/
│   │   ├── api.ts            # API client functions
│   │   ├── distance.ts       # Haversine distance calculation
│   │   ├── geocode.ts        # Nominatim geocoding utilities
│   │   └── routing.ts        # OSRM routing utilities
│   └── styles/
│       └── global.css
├── public/
│   └── geocoded-directory.json  # Pre-geocoded directory data
├── scripts/
│   └── geocode.mjs          # Geocoding script
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── tsconfig.json
```

## API Endpoints

### PH Transport API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/fuel/latest` | GET | Get latest fuel prices |
| `/fuel/brands` | GET | List available fuel brands |
| `/fare/commuter/types` | GET | Get commuter transport types |
| `/fare/commuter/calculate` | GET | Calculate fare by type and distance |

### Adventist Directory API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Get directory metadata |
| `/api/directory/scrape` | GET | Get paginated directory records |
| `/api/directory/search` | GET | Search directory by query |

### Internal API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/geocode` | GET | Proxy for Nominatim geocoding |
| `/api/directory` | GET | Proxy for Adventist Directory API |

## Distance Calculation

The map widget calculates distances in two ways:

1. **Straight-line distance** (Haversine formula): Uses Leaflet's `distanceTo()` method
2. **Travel distance** (OSRM): Routes through road networks using the [OSRM public API](https://router.project-osrm.org)

Travel distance requires valid road networks and may be unavailable for remote areas. Falls back gracefully to straight-line distance on error.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_TRANSPORT_API_URL` | Base URL for PH Transport API | `https://ph-transport-api.vercel.app` |
| `PUBLIC_ADVENTIST_API_URL` | Base URL for Adventist Directory API | `https://adventist-scraper-api.vercel.app` |

**Note**: Variables prefixed with `PUBLIC_` are exposed to the client-side code. This is intentional for Astro's static site generation.

## License

MIT