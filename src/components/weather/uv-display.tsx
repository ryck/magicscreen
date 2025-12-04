import {
	type ComponentType,
	lazy,
	Suspense,
	type SVGProps,
	useMemo
} from 'react'

type UvDisplayProps = {
	uvIndex: number
	className?: string
}

export default function UvDisplay({ uvIndex, className = '' }: UvDisplayProps) {
	// Clamp UV index between 1 and 11 (available icon range)
	const clampedUv = Math.max(1, Math.min(11, Math.round(uvIndex)))

	const Icon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
		() =>
			lazy(
				() =>
					import(`./weather-icons/uv-index-${clampedUv}.svg?react`) as Promise<{
						default: ComponentType<SVGProps<SVGSVGElement>>
					}>
			),
		[clampedUv]
	)

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<Suspense fallback={<div className="h-16 w-16" />}>
				<Icon className="size-12 text-white md:size-18 lg:size-20" />
			</Suspense>
		</div>
	)
}
