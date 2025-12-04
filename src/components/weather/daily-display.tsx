import { config } from '@/config'
import type { OpenWeatherMapResponse, WeatherId } from './types'
import WeatherIcon from './weather-icon'

type DailyDisplayProps = {
	daily: OpenWeatherMapResponse['daily']
	className?: string
}

const FORECAST_DAYS = 8 // OpenWeatherMap OneCall API 3.0 provides 8 days

export default function DailyDisplay({ daily, className }: DailyDisplayProps) {
	return (
		<div className={className}>
			<div className="flex flex-col gap-2">
				{daily.slice(0, FORECAST_DAYS).map((day, index) => {
					const dayName = new Date(day.dt * 1000).toLocaleDateString(
						config.locale,
						{
							weekday: 'short'
						}
					)
					const dayWeatherId = day.weather[0]?.id as WeatherId
					const minTemp = Math.round(day.temp.min)
					const maxTemp = Math.round(day.temp.max)

					// Calculate temperature range for the bar graph
					const allMinTemps = daily
						.slice(0, FORECAST_DAYS)
						.map((d) => Math.round(d.temp.min))
					const allMaxTemps = daily
						.slice(0, FORECAST_DAYS)
						.map((d) => Math.round(d.temp.max))
					const globalMin = Math.min(...allMinTemps)
					const globalMax = Math.max(...allMaxTemps)
					const tempRange = globalMax - globalMin

					const minOffset = ((minTemp - globalMin) / tempRange) * 100
					const maxOffset = ((maxTemp - globalMin) / tempRange) * 100
					const barWidth = maxOffset - minOffset
					return (
						<div className="flex items-center gap-3" key={day.dt}>
							<div className="w-12 text-sm text-white/60">
								{index === 0 ? 'Today' : dayName}
							</div>
							<WeatherIcon
								className="size-6"
								sunrise={0}
								sunset={Number.MAX_SAFE_INTEGER}
								weatherId={dayWeatherId}
							/>
							<div className="flex flex-1 items-center gap-2">
								<div className="w-8 text-sm text-white/60 md:text-lg">
									{minTemp}°
								</div>
								<div className="relative h-2 flex-1">
									<div className="absolute inset-0 rounded-full bg-white/10" />
									<div
										className="absolute h-full rounded-full bg-linear-to-r from-teal-400 to-blue-400"
										style={{
											left: `${minOffset}%`,
											width: `${barWidth}%`
										}}
									/>
								</div>
								<div className="w-8 text-right text-sm text-white/60 md:text-lg">
									{maxTemp}°
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
