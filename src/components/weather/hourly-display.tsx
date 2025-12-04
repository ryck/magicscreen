import type { OpenWeatherMapResponse, WeatherId } from './types'
import WeatherIcon from './weather-icon'

type HourlyDisplayProps = {
	hourly: OpenWeatherMapResponse['hourly']
	sunrise: number
	sunset: number
	className?: string
}

const HOURLY_FORECAST = 6 // Show next 8 hours

export default function HourlyDisplay({
	hourly,
	sunrise,
	sunset,
	className
}: HourlyDisplayProps) {
	return (
		<div className={className}>
			<div className="flex items-center justify-between gap-1">
				{hourly.slice(0, HOURLY_FORECAST).map((hour, index) => {
					const hourTime = new Date(hour.dt * 1000).getHours()
					const hourTemp = Math.round(hour.temp)
					const hourWeatherId = hour.weather[0]?.id as WeatherId

					// Check if this specific hour is during daytime
					const hourTimestamp = hour.dt
					const isDaytime = hourTimestamp >= sunrise && hourTimestamp < sunset

					// Set sunrise/sunset to force day or night variant based on the hour
					const effectiveSunrise = isDaytime ? 0 : Number.MAX_SAFE_INTEGER
					const effectiveSunset = isDaytime ? Number.MAX_SAFE_INTEGER : 0

					return (
						<div className="flex flex-col items-center gap-1" key={hour.dt}>
							<div className="text-sm text-white/60">
								{index === 0 ? 'Now' : hourTime}
							</div>
							<WeatherIcon
								className="size-8 text-white md:size-12 lg:size-12"
								sunrise={effectiveSunrise}
								sunset={effectiveSunset}
								weatherId={hourWeatherId}
							/>
							<div className="font-medium text-sm text-white">{hourTemp}°</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
