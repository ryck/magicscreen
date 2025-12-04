export type ComplimentsConfig = {
	refreshIntervalSeconds?: number
}

export type ComplimentsData = {
	anytime: string[]
	morning: string[]
	afternoon: string[]
	evening: string[]
	snow: string[]
	day_sunny: string[]
	day_cloudy: string[]
	cloudy: string[]
	cloudy_windy: string[]
	showers: string[]
	rain: string[]
	thunderstorm: string[]
	fog: string[]
	night_clear: string[]
	night_cloudy: string[]
	night_showers: string[]
	night_rain: string[]
	night_thunderstorm: string[]
	night_alt_cloudy_windy: string[]
	[key: string]: string[]
}
