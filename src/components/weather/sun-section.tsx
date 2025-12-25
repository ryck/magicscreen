import {
	type ComponentType,
	lazy,
	Suspense,
	type SVGProps,
	useMemo,
	useState,
	useEffect
} from 'react'
import { config } from '@/config'

type SunSectionProps = {
	sunrise: number
	sunset: number
	currentDaySunrise: number
	currentDaySunset: number
	className?: string
}

/**
 * Format unix timestamp to time string
 */
const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp * 1000)
	return date.toLocaleTimeString(config.locale, {
		hour: '2-digit',
		minute: '2-digit'
	})
}

/**
 * Determine if sunrise or sunset is next
 */
const getNextSunEvent = (
	sunrise: number,
	sunset: number
): { time: string; label: string; iconName: string } => {
	const now = Date.now() / 1000

	// If both are in the future, return the earlier one
	if (sunrise > now && sunset > now) {
		if (sunrise < sunset) {
			return {
				time: formatTime(sunrise),
				label: 'Sunrise',
				iconName: 'sunrise'
			}
		}
		return { time: formatTime(sunset), label: 'Sunset', iconName: 'sunset' }
	}

	// If only sunrise is in the future
	if (sunrise > now) {
		return { time: formatTime(sunrise), label: 'Sunrise', iconName: 'sunrise' }
	}

	// If only sunset is in the future
	if (sunset > now) {
		return { time: formatTime(sunset), label: 'Sunset', iconName: 'sunset' }
	}

	// Both are in the past, show the next sunrise
	return { time: formatTime(sunrise), label: 'Sunrise', iconName: 'sunrise' }
}

/**
 * Calculate position percentages for the 24-hour timeline
 */
const getTimelinePositions = (sunrise: number, sunset: number) => {
	const now = Date.now() / 1000

	// Get start of day (midnight)
	const date = new Date(sunrise * 1000)
	date.setHours(0, 0, 0, 0)
	const dayStart = date.getTime() / 1000

	// Calculate percentages
	const sunrisePercent = ((sunrise - dayStart) / 86400) * 100
	const sunsetPercent = ((sunset - dayStart) / 86400) * 100
	const currentPercent = ((now - dayStart) / 86400) * 100

	return {
		sunrisePercent,
		sunsetPercent,
		currentPercent: Math.max(0, Math.min(100, currentPercent)),
		isDaytime: now >= sunrise && now < sunset
	}
}

export default function SunSection({
	sunrise,
	sunset,
	currentDaySunrise,
	currentDaySunset,
	className = ''
}: SunSectionProps) {
	const [, setCurrentTime] = useState(() => Date.now() / 1000)

	// Update current time every minute
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(Date.now() / 1000)
		}, 60000) // Update every 60 seconds

		return () => clearInterval(interval)
	}, [])

	const sunriseTime = useMemo(() => formatTime(sunrise), [sunrise])
	const sunsetTime = useMemo(() => formatTime(sunset), [sunset])
	const nextEvent = useMemo(
		() => getNextSunEvent(sunrise, sunset),
		[sunrise, sunset]
	)
	const { sunrisePercent, sunsetPercent, currentPercent, isDaytime } = useMemo(
		() => getTimelinePositions(currentDaySunrise, currentDaySunset),
		[currentDaySunrise, currentDaySunset]
	)

	const Icon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
		() =>
			lazy(
				() =>
					import(
						`./weather-icons/static/${nextEvent.iconName}.svg?react`
					) as Promise<{
						default: ComponentType<SVGProps<SVGSVGElement>>
					}>
			),
		[nextEvent.iconName]
	)

	const IndicatorIcon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
		() =>
			lazy(
				() =>
					import(
						`./weather-icons/static/${isDaytime ? 'clear-day' : 'clear-night'}.svg?react`
					) as Promise<{
						default: ComponentType<SVGProps<SVGSVGElement>>
					}>
			),
		[isDaytime]
	)

	return (
		<div className={`flex items-center ${className}`}>
			{/* Left side: Sun info */}
			<div className="flex flex-1 flex-col gap-2">
				<div className="flex items-center justify-between gap-2 font-light text-white text-xl lg:text-2xl">
					<span>{nextEvent.label}</span>
					<span>{nextEvent.time}</span>
				</div>

				{/* Show the other event (not the next one) */}
				{nextEvent.label === 'Sunrise' ? (
					<div className="flex items-center justify-between gap-2">
						<span className="text-lg text-white/60">Sunset</span>
						<span className="text-lg text-white/60">{sunsetTime}</span>
					</div>
				) : (
					<div className="flex items-center justify-between gap-2">
						<span className="text-lg text-white/60">Sunrise</span>
						<span className="text-lg text-white/60">{sunriseTime}</span>
					</div>
				)}

				{/* Total daylight duration */}
				<div className="flex items-center justify-between gap-2">
					<span className="text-lg text-white/60">Total daylight</span>
					<span className="text-lg text-white/60">
						{Math.floor((currentDaySunset - currentDaySunrise) / 3600)}h{' '}
						{Math.floor(((currentDaySunset - currentDaySunrise) % 3600) / 60)}m
					</span>
				</div>

				{/* Progress bar - 24 hour timeline */}
				<div className="relative mt-2 h-2 w-full overflow-visible rounded-full bg-blue-950">
					{/* Daytime section with gradients at sunrise/sunset */}
					<div
						className="absolute h-full bg-linear-to-r from-blue-bg-blue-950 via-blue-400 to-blue-bg-blue-950"
						style={{
							left: `${sunrisePercent}%`,
							width: `${sunsetPercent - sunrisePercent}%`
						}}
					/>
					{/* Current position indicator */}
					<div
						className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
						style={{ left: `${currentPercent}%` }}
					>
						<Suspense fallback={<div className="size-8" />}>
							<IndicatorIcon className="size-8 text-white drop-shadow-lg" />
						</Suspense>
					</div>
				</div>
			</div>

			{/* Right side: Large sun icon */}
			<div className="flex items-center justify-center">
				<Suspense fallback={<div className="size-48 lg:size-64" />}>
					<Icon
						key={`sun-section-icon-${nextEvent.iconName}`}
						className="size-32 translate-x-6 text-white lg:size-64 lg:translate-x-12"
					/>
				</Suspense>
			</div>
		</div>
	)
}
