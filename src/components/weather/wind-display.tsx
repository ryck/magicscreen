import {
	type ComponentType,
	lazy,
	Suspense,
	type SVGProps,
	useMemo
} from 'react'
import type { Unit } from './types'
import { windSpeedToBeaufort } from './utils'

type WindDisplayProps = {
	speed: number
	unit?: Unit
	className?: string
}

export default function WindDisplay({
	speed,
	unit = 'metric',
	className = ''
}: WindDisplayProps) {
	const beaufortScale = windSpeedToBeaufort(speed, unit)

	const Icon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
		() =>
			lazy(
				() =>
					import(
						`./weather-icons/wind-beaufort-${beaufortScale}.svg?react`
					) as Promise<{
						default: ComponentType<SVGProps<SVGSVGElement>>
					}>
			),
		[beaufortScale]
	)

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<Suspense fallback={<div className="h-16 w-16" />}>
				<Icon className="size-12 text-white md:size-18 lg:size-20" />
			</Suspense>
		</div>
	)
}
