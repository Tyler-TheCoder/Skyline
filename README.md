# Skyline

A weather dashboard that shows current conditions and a 7-day forecast. Built with vanilla JavaScript and Webpack.

## Features

- Search by city name, ZIP code, or coordinates
- Geolocation button to auto-detect your location
- Toggle between °C and °F
- Current conditions: temperature, feels-like, humidity, wind, UV index, sunrise/sunset
- 7-day forecast cards
- Responsive layout for desktop, tablet, and mobile

## API

Uses [Visual Crossing Weather](https://www.visualcrossing.com/weather-api) (free tier) for weather data. Geolocation reverse lookup uses [Nominatim](https://nominatim.openstreetmap.org/) (OpenStreetMap).

## Development

```bash
npm install
npm start        # dev server on localhost:8080
npm run build    # production build to dist/
```

## License

MIT