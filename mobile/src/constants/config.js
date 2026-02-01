// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
};

// MapTiler Configuration
export const MAPTILER_API_KEY = 'quVrJDcYbgVNrDgIF5R5';
export const MAPTILER_TILE_URL = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`;

// Default Map Region (Thu Dau Mot / Ho Chi Minh area)
export const DEFAULT_MAP_REGION = {
  latitude: 10.8231,
  longitude: 106.6297,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
