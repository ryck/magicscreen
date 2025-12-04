import {
	type ComponentType,
	lazy,
	Suspense,
	type SVGProps,
	useMemo
} from 'react'
import { config } from '@/config'
import { getNextSunEvent } from './utils'

type NextSunDisplayProps = {
	sunrise: number
	sunset: number
	className?: string
}

const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp * 1000)
	return date.toLocaleTimeString(config.locale, {
		hour: '2-digit',
		minute: '2-digit'
	})
}

export default function NextSunDisplay({
	sunrise,
	sunset,
	className = ''
}: NextSunDisplayProps) {
	const nextEvent = getNextSunEvent({ sunrise, sunset })
	const timeString = formatTime(nextEvent.timestamp)

	const Icon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
		() =>
			lazy(
				() =>
					import(`./weather-icons/${nextEvent.type}.svg?react`) as Promise<{
						default: ComponentType<SVGProps<SVGSVGElement>>
					}>
			),
		[nextEvent.type]
	)

	return (
		<div className={`flex items-center justify-center gap-0 ${className}`}>
			<Suspense fallback={<div className="h-6 w-6" />}>
				<Icon className="size-12 text-white md:size-18 lg:size-20" />
			</Suspense>
			<span className="mb-1 font-medium text-2xl text-white">{timeString}</span>
		</div>
	)
}
