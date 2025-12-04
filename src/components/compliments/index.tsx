import { useCallback, useEffect, useState } from 'react'
import { useSharedStore } from '@/store/shared'
import { cn } from '@/utils'
import complimentsData from './compliments.json'
import type { ComplimentsConfig } from './types'

type ComplimentsProps = {
	config: ComplimentsConfig
	className?: string
}

const DEFAULT_REFRESH_INTERVAL_SECONDS = 5 * 60

function getRandomCompliment(compliments: string[]): string {
	const randomIndex = Math.floor(Math.random() * compliments.length)
	return compliments[randomIndex]
}

export default function Compliments({
	config,
	className = ''
}: ComplimentsProps) {
	const { refreshIntervalSeconds = DEFAULT_REFRESH_INTERVAL_SECONDS } = config

	// Get weather condition from shared store
	const weatherCondition = useSharedStore((state) => state.weather.condition)
	const isDaytime = useSharedStore((state) => state.weather.isDaytime)

	const [compliment, setCompliment] = useState<string>(() =>
		getRandomCompliment(complimentsData.anytime)
	)
	const [isVisible, setIsVisible] = useState(true)

	// Get time of day
	const getTimeOfDay = useCallback((): 'morning' | 'afternoon' | 'evening' => {
		const hour = new Date().getHours()
		if (hour >= 5 && hour < 12) {
			return 'morning'
		}
		if (hour >= 12 && hour < 17) {
			return 'afternoon'
		}
		return 'evening'
	}, [])

	// Helper to add compliments by key
	const addComplimentsByKey = useCallback(
		(compliments: string[], key: string) => {
			const typedKey = key as keyof typeof complimentsData
			// console.log('Adding compliments for key:', typedKey)
			if (complimentsData[typedKey]?.length > 0) {
				// console.log('Found compliments:', complimentsData[typedKey])
				compliments.push(...complimentsData[typedKey])
			}
		},
		[]
	)

	// Function to get appropriate compliments based on context
	const getContextualCompliments = useCallback((): string[] => {
		const compliments: string[] = []

		// Add date-based compliments (YYYY-MM-DD with wildcards)
		const now = new Date()
		const year = now.getFullYear().toString()
		const month = (now.getMonth() + 1).toString().padStart(2, '0')
		const day = now.getDate().toString().padStart(2, '0')

		// Check for exact date and wildcarded date patterns
		addComplimentsByKey(compliments, `${year}-${month}-${day}`)
		addComplimentsByKey(compliments, `....-${month}-${day}`)

		// Add time-based compliments
		const timeOfDay = getTimeOfDay()
		addComplimentsByKey(compliments, timeOfDay)

		// Add weather-based compliments
		if (weatherCondition && isDaytime !== undefined) {
			const dayNightPrefix = isDaytime ? 'day' : 'night'
			const dayNightKey = `${dayNightPrefix}_${weatherCondition.toLowerCase()}`
			const weatherKey = weatherCondition.toLowerCase()

			addComplimentsByKey(compliments, dayNightKey)
			addComplimentsByKey(compliments, weatherKey)
		}

		// Always add anytime compliments
		addComplimentsByKey(compliments, 'anytime')
		// console.log('Final compliments list:', compliments)
		return compliments
	}, [weatherCondition, isDaytime, getTimeOfDay, addComplimentsByKey])

	useEffect(() => {
		const updateCompliment = () => {
			setIsVisible(false)
			setTimeout(() => {
				const contextualCompliments = getContextualCompliments()
				setCompliment(getRandomCompliment(contextualCompliments))
				setIsVisible(true)
			}, 500)
		}

		const interval = setInterval(
			updateCompliment,
			refreshIntervalSeconds * 1000
		)

		return () => {
			clearInterval(interval)
		}
	}, [refreshIntervalSeconds, getContextualCompliments])

	return (
		<div
			className={cn(
				'flex min-h-[200px] flex-col items-center justify-center p-8 text-center text-shadow-white backdrop-blur-sm',
				className
			)}
		>
			<p
				className={cn(
					'font-light text-lg text-white transition-opacity duration-500 sm:text-xl md:text-2xl lg:text-3xl xl:text-5xl',
					isVisible ? 'opacity-100' : 'opacity-0'
				)}
			>
				{compliment}
			</p>
		</div>
	)
}
