import {
	type ComponentType,
	lazy,
	Suspense,
	type SVGProps,
	useMemo
} from 'react'
import { config } from '@/config'

type MoonSectionProps = {
	moonPhase: number
	moonrise: number
	moonset: number
	className?: string
}

/**
 * Maps moon phase value (0-1) to the corresponding SVG icon name and phase name
 */
const getMoonInfo = (
	phase: number
): { iconName: string; phaseName: string } => {
	const normalizedPhase = phase % 1

	if (normalizedPhase < 0.03 || normalizedPhase > 0.97) {
		return { iconName: 'moon-new', phaseName: 'New Moon' }
	}

	if (normalizedPhase < 0.22) {
		return { iconName: 'moon-waxing-crescent', phaseName: 'Waxing Crescent' }
	}

	if (normalizedPhase >= 0.22 && normalizedPhase < 0.28) {
		return { iconName: 'moon-first-quarter', phaseName: 'First Quarter' }
	}

	if (normalizedPhase < 0.47) {
		return { iconName: 'moon-waxing-gibbous', phaseName: 'Waxing Gibbous' }
	}

	if (normalizedPhase >= 0.47 && normalizedPhase < 0.53) {
		return { iconName: 'moon-full', phaseName: 'Full Moon' }
	}

	if (normalizedPhase < 0.72) {
		return { iconName: 'moon-waning-gibbous', phaseName: 'Waning Gibbous' }
	}

	if (normalizedPhase >= 0.72 && normalizedPhase < 0.78) {
		return { iconName: 'moon-last-quarter', phaseName: 'Last Quarter' }
	}

	return { iconName: 'moon-waning-crescent', phaseName: 'Waning Crescent' }
}

/**
 * Calculate days until next full moon
 * Full moon occurs at phase 0.5
 */
const getDaysUntilFullMoon = (currentPhase: number): number => {
	const normalizedPhase = currentPhase % 1
	const lunarCycleDays = 29.53 // Average lunar cycle length

	// If we're before or at full moon in current cycle
	if (normalizedPhase <= 0.5) {
		return Math.round((0.5 - normalizedPhase) * lunarCycleDays)
	}

	// If we're past full moon, calculate to next cycle
	return Math.round((1 - normalizedPhase + 0.5) * lunarCycleDays)
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
 * Determine if moonrise or moonset is next
 */
const getNextMoonEvent = (
	moonrise: number,
	moonset: number
): { time: string; label: string } => {
	const now = Date.now() / 1000

	// If both are in the future, return the earlier one
	if (moonrise > now && moonset > now) {
		if (moonrise < moonset) {
			return { time: formatTime(moonrise), label: 'Moonrise' }
		}
		return { time: formatTime(moonset), label: 'Moonset' }
	}

	// If only moonrise is in the future
	if (moonrise > now) {
		return { time: formatTime(moonrise), label: 'Moonrise' }
	}

	// If only moonset is in the future
	if (moonset > now) {
		return { time: formatTime(moonset), label: 'Moonset' }
	}

	// Both are in the past, show the next moonrise
	return { time: formatTime(moonrise), label: 'Moonrise' }
}

export default function MoonSection({
	moonPhase,
	moonrise,
	moonset,
	className = ''
}: MoonSectionProps) {
	const { iconName, phaseName } = getMoonInfo(moonPhase)
	const daysUntilFullMoon = getDaysUntilFullMoon(moonPhase)
	const nextEvent = getNextMoonEvent(moonrise, moonset)

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
		<div className={`flex items-center ${className}`}>
			{/* Left side: Moon info */}
			<div className="flex flex-1 flex-col gap-2">
				<div className="font-light text-white text-xl lg:text-2xl">
					{phaseName}
				</div>

				{/* Moonrise/Moonset row */}
				<div className="flex items-center justify-between gap-2">
					<span className="text-lg text-white/60">{nextEvent.label}</span>
					<span className="text-lg text-white/60">{nextEvent.time}</span>
				</div>

				{/* Next Full Moon row */}
				<div className="flex items-center justify-between gap-2">
					<span className="text-lg text-white/60">Next full moon</span>
					<span className="text-lg text-white/60">
						{daysUntilFullMoon === 0
							? 'Tonight'
							: `${daysUntilFullMoon} day${daysUntilFullMoon === 1 ? '' : 's'}`}
					</span>
				</div>
			</div>

			{/* Right side: Large moon icon */}
			<div className="flex items-center justify-center">
				<Suspense fallback={<div className="size-48 lg:size-64" />}>
					<Icon className="size-32 translate-x-6 text-white lg:size-64 lg:translate-x-12" />
				</Suspense>
			</div>
		</div>
	)
}
