export type WeatherId =
	// Thunderstorm
	| 200
	| 201
	| 202
	| 210
	| 211
	| 212
	| 221
	| 230
	| 231
	| 232
	// Drizzle
	| 300
	| 301
	| 302
	| 310
	| 311
	| 312
	| 313
	| 314
	| 321
	// Rain
	| 500
	| 501
	| 502
	| 503
	| 504
	| 511
	| 520
	| 521
	| 522
	| 531
	// Snow
	| 600
	| 601
	| 602
	| 611
	| 612
	| 613
	| 615
	| 616
	| 620
	| 621
	| 622
	// Atmosphere
	| 701
	| 711
	| 721
	| 731
	| 741
	| 751
	| 761
	| 762
	| 771
	| 781
	// Clear
	| 800
	// Clouds
	| 801
	| 802
	| 803
	| 804

type WeatherMain =
	| 'Ash'
	| 'Clear'
	| 'Clouds'
	| 'Drizzle'
	| 'Dust'
	| 'Fog'
	| 'Haze'
	| 'Mist'
	| 'Rain'
	| 'Sand'
	| 'Smoke'
	| 'Snow'
	| 'Squall'
	| 'Thunderstorm'
	| 'Tornado'

type WeatherDescription =
	// Thunderstorm
	| 'thunderstorm with light rain'
	| 'thunderstorm with rain'
	| 'thunderstorm with heavy rain'
	| 'light thunderstorm'
	| 'thunderstorm'
	| 'heavy thunderstorm'
	| 'ragged thunderstorm'
	| 'thunderstorm with light drizzle'
	| 'thunderstorm with drizzle'
	| 'thunderstorm with heavy drizzle'
	// Drizzle
	| 'light intensity drizzle'
	| 'drizzle'
	| 'heavy intensity drizzle'
	| 'light intensity drizzle rain'
	| 'drizzle rain'
	| 'heavy intensity drizzle rain'
	| 'shower rain and drizzle'
	| 'heavy shower rain and drizzle'
	| 'shower drizzle'
	// Rain
	| 'light rain'
	| 'moderate rain'
	| 'heavy intensity rain'
	| 'very heavy rain'
	| 'extreme rain'
	| 'freezing rain'
	| 'light intensity shower rain'
	| 'shower rain'
	| 'heavy intensity shower rain'
	| 'ragged shower rain'
	// Snow
	| 'light snow'
	| 'snow'
	| 'heavy snow'
	| 'sleet'
	| 'light shower sleet'
	| 'shower sleet'
	| 'light rain and snow'
	| 'rain and snow'
	| 'light shower snow'
	| 'shower snow'
	| 'heavy shower snow'
	// Atmosphere
	| 'mist'
	| 'smoke'
	| 'haze'
	| 'sand/dust whirls'
	| 'fog'
	| 'sand'
	| 'dust'
	| 'volcanic ash'
	| 'squalls'
	| 'tornado'
	// Clear
	| 'clear sky'
	// Clouds
	| 'few clouds: 11-25%'
	| 'scattered clouds: 25-50%'
	| 'broken clouds: 51-84%'
	| 'overcast clouds: 85-100%'

type WeatherIcon =
	| '01d'
	| '01n'
	| '02d'
	| '02n'
	| '03d'
	| '03n'
	| '04d'
	| '04n'
	| '09d'
	| '10d'
	| '11d'
	| '13d'
	| '50d'

type Weather = {
	id: WeatherId
	main: WeatherMain
	description: WeatherDescription
	icon: WeatherIcon
}

type WeatherCondition = {
	main: WeatherMain
	description: WeatherDescription
	icon: WeatherIcon
}

export const WEATHER_CONDITIONS: Record<WeatherId, WeatherCondition> = {
	// Thunderstorm
	200: {
		main: 'Thunderstorm',
		description: 'thunderstorm with light rain',
		icon: '11d'
	},
	201: {
		main: 'Thunderstorm',
		description: 'thunderstorm with rain',
		icon: '11d'
	},
	202: {
		main: 'Thunderstorm',
		description: 'thunderstorm with heavy rain',
		icon: '11d'
	},
	210: { main: 'Thunderstorm', description: 'light thunderstorm', icon: '11d' },
	211: { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
	212: { main: 'Thunderstorm', description: 'heavy thunderstorm', icon: '11d' },
	221: {
		main: 'Thunderstorm',
		description: 'ragged thunderstorm',
		icon: '11d'
	},
	230: {
		main: 'Thunderstorm',
		description: 'thunderstorm with light drizzle',
		icon: '11d'
	},
	231: {
		main: 'Thunderstorm',
		description: 'thunderstorm with drizzle',
		icon: '11d'
	},
	232: {
		main: 'Thunderstorm',
		description: 'thunderstorm with heavy drizzle',
		icon: '11d'
	},
	// Drizzle
	300: { main: 'Drizzle', description: 'light intensity drizzle', icon: '09d' },
	301: { main: 'Drizzle', description: 'drizzle', icon: '09d' },
	302: { main: 'Drizzle', description: 'heavy intensity drizzle', icon: '09d' },
	310: {
		main: 'Drizzle',
		description: 'light intensity drizzle rain',
		icon: '09d'
	},
	311: { main: 'Drizzle', description: 'drizzle rain', icon: '09d' },
	312: {
		main: 'Drizzle',
		description: 'heavy intensity drizzle rain',
		icon: '09d'
	},
	313: { main: 'Drizzle', description: 'shower rain and drizzle', icon: '09d' },
	314: {
		main: 'Drizzle',
		description: 'heavy shower rain and drizzle',
		icon: '09d'
	},
	321: { main: 'Drizzle', description: 'shower drizzle', icon: '09d' },
	// Rain
	500: { main: 'Rain', description: 'light rain', icon: '10d' },
	501: { main: 'Rain', description: 'moderate rain', icon: '10d' },
	502: { main: 'Rain', description: 'heavy intensity rain', icon: '10d' },
	503: { main: 'Rain', description: 'very heavy rain', icon: '10d' },
	504: { main: 'Rain', description: 'extreme rain', icon: '10d' },
	511: { main: 'Rain', description: 'freezing rain', icon: '13d' },
	520: {
		main: 'Rain',
		description: 'light intensity shower rain',
		icon: '09d'
	},
	521: { main: 'Rain', description: 'shower rain', icon: '09d' },
	522: {
		main: 'Rain',
		description: 'heavy intensity shower rain',
		icon: '09d'
	},
	531: { main: 'Rain', description: 'ragged shower rain', icon: '09d' },
	// Snow
	600: { main: 'Snow', description: 'light snow', icon: '13d' },
	601: { main: 'Snow', description: 'snow', icon: '13d' },
	602: { main: 'Snow', description: 'heavy snow', icon: '13d' },
	611: { main: 'Snow', description: 'sleet', icon: '13d' },
	612: { main: 'Snow', description: 'light shower sleet', icon: '13d' },
	613: { main: 'Snow', description: 'shower sleet', icon: '13d' },
	615: { main: 'Snow', description: 'light rain and snow', icon: '13d' },
	616: { main: 'Snow', description: 'rain and snow', icon: '13d' },
	620: { main: 'Snow', description: 'light shower snow', icon: '13d' },
	621: { main: 'Snow', description: 'shower snow', icon: '13d' },
	622: { main: 'Snow', description: 'heavy shower snow', icon: '13d' },
	// Atmosphere
	701: { main: 'Mist', description: 'mist', icon: '50d' },
	711: { main: 'Smoke', description: 'smoke', icon: '50d' },
	721: { main: 'Haze', description: 'haze', icon: '50d' },
	731: { main: 'Dust', description: 'sand/dust whirls', icon: '50d' },
	741: { main: 'Fog', description: 'fog', icon: '50d' },
	751: { main: 'Sand', description: 'sand', icon: '50d' },
	761: { main: 'Dust', description: 'dust', icon: '50d' },
	762: { main: 'Ash', description: 'volcanic ash', icon: '50d' },
	771: { main: 'Squall', description: 'squalls', icon: '50d' },
	781: { main: 'Tornado', description: 'tornado', icon: '50d' },
	// Clear
	800: { main: 'Clear', description: 'clear sky', icon: '01d' },
	// Clouds
	801: { main: 'Clouds', description: 'few clouds: 11-25%', icon: '02d' },
	802: { main: 'Clouds', description: 'scattered clouds: 25-50%', icon: '03d' },
	803: { main: 'Clouds', description: 'broken clouds: 51-84%', icon: '04d' },
	804: { main: 'Clouds', description: 'overcast clouds: 85-100%', icon: '04d' }
} as const

type CurrentWeather = {
	dt: number
	sunrise: number
	sunset: number
	temp: number
	feels_like: number
	pressure: number
	humidity: number
	dew_point: number
	uvi: number
	clouds: number
	visibility: number
	wind_speed: number
	wind_deg: number
	wind_gust?: number
	weather: Weather[]
}

type HourlyWeather = {
	dt: number
	temp: number
	feels_like: number
	pressure: number
	humidity: number
	dew_point: number
	uvi: number
	clouds: number
	visibility: number
	wind_speed: number
	wind_deg: number
	wind_gust: number
	weather: Weather[]
	pop: number
	rain?: {
		'1h': number
	}
}

type DailyTemp = {
	day: number
	min: number
	max: number
	night: number
	eve: number
	morn: number
}

type DailyFeelsLike = {
	day: number
	night: number
	eve: number
	morn: number
}

type DailyWeather = {
	dt: number
	sunrise: number
	sunset: number
	moonrise: number
	moonset: number
	moon_phase: number
	summary: string
	temp: DailyTemp
	feels_like: DailyFeelsLike
	pressure: number
	humidity: number
	dew_point: number
	wind_speed: number
	wind_deg: number
	wind_gust: number
	weather: Weather[]
	clouds: number
	pop: number
	rain?: number
	uvi: number
}

export type OpenWeatherMapResponse = {
	lat: number
	lon: number
	timezone: string
	timezone_offset: number
	current: CurrentWeather
	hourly: HourlyWeather[]
	daily: DailyWeather[]
}

export type Unit = 'metric' | 'imperial'
