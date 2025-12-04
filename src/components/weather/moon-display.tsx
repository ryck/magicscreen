import {
	type ComponentType,
	lazy,
	Suspense,
	type SVGProps,
	useMemo
} from 'react'

type MoonDisplayProps = {
	moonPhase: number
	className?: string
}

/**
 * Maps moon phase value (0-1) to the corresponding SVG icon name
 *
 * Moon phases:
 * - 0 or 1: New Moon
 * - 0-0.25: Waxing Crescent
 * - 0.25: First Quarter
 * - 0.25-0.5: Waxing Gibbous
 * - 0.5: Full Moon
 * - 0.5-0.75: Waning Gibbous
 * - 0.75: Last Quarter (Third Quarter)
 * - 0.75-1: Waning Crescent
 */
const getMoonIconName = (phase: number): string => {
	// Normalize phase to 0-1 range
	const normalizedPhase = phase % 1

	// New Moon (0 or very close to 1)
	if (normalizedPhase < 0.03 || normalizedPhase > 0.97) {
		return 'moon-new'
	}

	// Waxing Crescent (0 to 0.25)
	if (normalizedPhase < 0.22) {
		return 'moon-waxing-crescent'
	}

	// First Quarter (0.25)
	if (normalizedPhase >= 0.22 && normalizedPhase < 0.28) {
		return 'moon-first-quarter'
	}

	// Waxing Gibbous (0.25 to 0.5)
	if (normalizedPhase < 0.47) {
		return 'moon-waxing-gibbous'
	}

	// Full Moon (0.5)
	if (normalizedPhase >= 0.47 && normalizedPhase < 0.53) {
		return 'moon-full'
	}

	// Waning Gibbous (0.5 to 0.75)
	if (normalizedPhase < 0.72) {
		return 'moon-waning-gibbous'
	}

	// Last Quarter / Third Quarter (0.75)
	if (normalizedPhase >= 0.72 && normalizedPhase < 0.78) {
		return 'moon-last-quarter'
	}

	// Waning Crescent (0.75 to 1)
	return 'moon-waning-crescent'
}

export default function MoonDisplay({
	moonPhase,
	className = ''
}: MoonDisplayProps) {
	const iconName = getMoonIconName(moonPhase)

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
		<div className={`flex items-center justify-center ${className}`}>
			<Suspense fallback={<div className="h-16 w-16" />}>
				<Icon className="size-12 text-white md:size-18 lg:size-20" />
			</Suspense>
		</div>
	)
}
