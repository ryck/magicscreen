import {
	type ComponentType,
	lazy,
	Suspense,
	type SVGProps,
	useMemo
} from 'react'

type HumidityDisplayProps = {
	humidity: number
	className?: string
}

export default function HumidityDisplay({
	humidity,
	className = ''
}: HumidityDisplayProps) {
	const Icon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
		() =>
			lazy(
				() =>
					import('./weather-icons/humidity.svg?react') as Promise<{
						default: ComponentType<SVGProps<SVGSVGElement>>
					}>
			),
		[]
	)

	return (
		<div className={`flex items-center gap-0 ${className}`}>
			<span className="ml-4 font-medium text-2xl text-white lg:text-4xl xl:text-5xl">
				{humidity}
			</span>
			<Suspense fallback={<div className="h-4 w-4" />}>
				<Icon className="-ml-3 size-12 text-white md:size-18 lg:size-20" />
			</Suspense>
		</div>
	)
}
