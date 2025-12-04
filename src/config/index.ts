const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const LONDON_LATITUDE = Number(import.meta.env.VITE_LATITUDE)
const LONDON_LONGITUDE = Number(import.meta.env.VITE_LONGITUDE)

export const config = {
	locale: 'en-GB' as const,
	unit: 'metric' as const,
	openweatherApiKey: OPENWEATHER_API_KEY,
	latitude: LONDON_LATITUDE,
	longitude: LONDON_LONGITUDE
}
