import {
	type ComponentType,
	lazy,
	Suspense,
	type SVGProps,
	useMemo
} from 'react'
import type { WeatherId } from './types'

type WeatherIconProps = {
	weatherId: WeatherId
	sunrise: number
	sunset: number
	className?: string
}

// Weather IDs that have day/night variants
const DAY_NIGHT_VARIANTS: Record<number, { day: string; night: string }> = {
	200: { day: 'thunderstorms-day-rain', night: 'thunderstorms-night-rain' },
	201: {
		day: 'thunderstorms-day-overcast-rain',
		night: 'thunderstorms-night-overcast-rain'
	},
	202: {
		day: 'thunderstorms-day-extreme-rain',
		night: 'thunderstorms-night-extreme-rain'
	},
	210: { day: 'thunderstorms-day', night: 'thunderstorms-night' },
	211: { day: 'thunderstorms-day', night: 'thunderstorms-night' },
	212: {
		day: 'thunderstorms-day-overcast',
		night: 'thunderstorms-night-overcast'
	},
	221: {
		day: 'thunderstorms-day-extreme',
		night: 'thunderstorms-night-extreme'
	},
	230: {
		day: 'thunderstorms-day-drizzle',
		night: 'thunderstorms-night-drizzle'
	},
	231: {
		day: 'thunderstorms-day-overcast-drizzle',
		night: 'thunderstorms-night-overcast-drizzle'
	},
	232: {
		day: 'thunderstorms-day-extreme-drizzle',
		night: 'thunderstorms-night-extreme-drizzle'
	},
	300: {
		day: 'partly-cloudy-day-drizzle',
		night: 'partly-cloudy-night-drizzle'
	},
	301: { day: 'overcast-day-drizzle', night: 'overcast-night-drizzle' },
	302: { day: 'extreme-day-drizzle', night: 'extreme-night-drizzle' },
	310: {
		day: 'partly-cloudy-day-drizzle',
		night: 'partly-cloudy-night-drizzle'
	},
	311: { day: 'overcast-day-drizzle', night: 'overcast-night-drizzle' },
	312: { day: 'extreme-day-drizzle', night: 'extreme-night-drizzle' },
	313: {
		day: 'partly-cloudy-day-drizzle',
		night: 'partly-cloudy-night-drizzle'
	},
	314: {
		day: 'partly-cloudy-day-drizzle',
		night: 'partly-cloudy-night-drizzle'
	},
	321: {
		day: 'partly-cloudy-day-drizzle',
		night: 'partly-cloudy-night-drizzle'
	},
	500: {
		day: 'partly-cloudy-day-rain',
		night: 'partly-cloudy-night-rain'
	},
	501: {
		day: 'partly-cloudy-day-rain',
		night: 'partly-cloudy-night-rain'
	},
	502: {
		day: 'overcast-day-rain',
		night: 'overcast-night-rain'
	},
	503: {
		day: 'overcast-day-rain',
		night: 'overcast-night-rain'
	},
	504: {
		day: 'extreme-day-rain',
		night: 'extreme-night-rain'
	},
	511: {
		day: 'partly-cloudy-day-sleet',
		night: 'partly-cloudy-night-sleet'
	},
	520: {
		day: 'partly-cloudy-day-rain',
		night: 'partly-cloudy-night-rain'
	},
	521: {
		day: 'overcast-day-rain',
		night: 'overcast-night-rain'
	},
	522: {
		day: 'overcast-day-rain',
		night: 'overcast-night-rain'
	},
	531: {
		day: 'extreme-day-rain',
		night: 'extreme-night-rain'
	},

	600: {
		day: 'partly-cloudy-day-snow',
		night: 'partly-cloudy-night-snow'
	},
	601: {
		day: 'overcast-day-snow',
		night: 'overcast-night-snow'
	},
	602: {
		day: 'extreme-day-snow',
		night: 'extreme-night-snow'
	},
	604: {
		day: 'extreme-day-snow',
		night: 'extreme-night-snow'
	},
	611: {
		day: 'partly-cloudy-day-sleet',
		night: 'partly-cloudy-night-sleet'
	},
	612: {
		day: 'overcast-day-sleet',
		night: 'overcast-night-sleet'
	},
	613: {
		day: 'extreme-day-sleet',
		night: 'extreme-night-sleet'
	},
	616: {
		day: 'partly-cloudy-day-snow',
		night: 'partly-cloudy-night-snow'
	},
	620: {
		day: 'overcast-day-snow',
		night: 'overcast-night-snow'
	},
	621: {
		day: 'overcast-day-snow',
		night: 'overcast-night-snow'
	},
	622: {
		day: 'extreme-day-snow',
		night: 'extreme-night-snow'
	},
	711: { day: 'partly-cloudy-day-smoke', night: 'partly-cloudy-night-smoke' },
	721: { day: 'haze-day', night: 'haze-night' },
	731: { day: 'dust-day', night: 'dust-night' },
	741: { day: 'fog-day', night: 'fog-night' },
	761: { day: 'dust-day', night: 'dust-night' },
	800: { day: 'clear-day', night: 'clear-night' },
	801: { day: 'partly-cloudy-day', night: 'partly-cloudy-night' },
	803: { day: 'overcast-day', night: 'overcast-night' },
	804: { day: 'overcast-day', night: 'overcast-night' }
}

// Map specific weather IDs to SVG component names (without day/night variants)
const SPECIFIC_WEATHER_ICONS: Record<number, string> = {
	615: 'hail',
	701: 'mist',
	751: 'mist',
	762: 'smoke-particles', // volcanic ash
	771: 'hurricane',
	781: 'tornado',
	802: 'cloudy'
}

const getAtmosphereIcon = (id: WeatherId): string => SPECIFIC_WEATHER_ICONS[id]

// Map weather IDs to SVG component names
const getIconName = (id: WeatherId, isDaytime: boolean): string => {
	// Check for day/night variants first
	if (DAY_NIGHT_VARIANTS[id]) {
		return isDaytime ? DAY_NIGHT_VARIANTS[id].day : DAY_NIGHT_VARIANTS[id].night
	}

	// Check specific weather ID mappings
	if (SPECIFIC_WEATHER_ICONS[id]) {
		return SPECIFIC_WEATHER_ICONS[id]
	}

	// Thunderstorm (200-232)
	if (id >= 200 && id < 300) {
		return 'thunderstorms'
	}

	// Drizzle (300-321)
	if (id >= 300 && id < 400) {
		return 'drizzle'
	}

	// Rain (500-531)
	if (id >= 500 && id < 600) {
		return 'rain'
	}

	// Snow (600-622)
	if (id >= 600 && id < 700) {
		return 'snow'
	}

	// Atmosphere (700-781)
	if (id >= 700 && id < 800) {
		return getAtmosphereIcon(id)
	}

	return 'not-available'
}

export default function WeatherIcon({
	weatherId,
	sunrise,
	sunset,
	className = ''
}: WeatherIconProps) {
	// Determine if it's daytime
	const isDaytime = useMemo(() => {
		const now = Date.now() / 1000
		return now >= sunrise && now < sunset
	}, [sunrise, sunset])

	const iconName = getIconName(weatherId, isDaytime)

	const Icon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
		() =>
			lazy(
				() =>
					import(`./weather-icons/${iconName}.svg?react`) as Promise<{
						default: ComponentType<SVGProps<SVGSVGElement>>
					}>
			),
		[iconName]
	)

	return (
		<Suspense fallback={<div className={className} />}>
			<Icon className={className} />
		</Suspense>
	)
}
