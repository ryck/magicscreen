import {
	addWeeks,
	format,
	isSameDay,
	nextDay,
	parseISO,
	startOfDay,
	subDays
} from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { Apple, Recycle, FileText, Trash2 } from 'lucide-react'
import { Widget } from '../widget'
import type { BinDaysConfig, CollectionType, HolidayException } from './types'

type BinDaysProps = {
	config: BinDaysConfig
}

const applyHolidayException = (
	date: Date,
	exceptions: HolidayException[] = []
): { date: Date; daysDelay: number } => {
	const dateStr = format(date, 'yyyy-MM-dd')
	const exception = exceptions.find((ex) => ex.originalDate === dateStr)

	if (exception) {
		const revisedDate = startOfDay(parseISO(exception.revisedDate))
		const daysDelay = Math.ceil(
			(revisedDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)
		)
		return { date: revisedDate, daysDelay }
	}

	return { date, daysDelay: 0 }
}

const calculateNextCollection = (
	collection: CollectionType,
	now: Date,
	holidayExceptions: HolidayException[] = []
): { date: Date; daysDelay: number } => {
	const reference = startOfDay(parseISO(collection.referenceDate))
	const today = startOfDay(now)

	// Find next occurrence of the day of week
	let candidate =
		isSameDay(today, reference) || today < reference
			? reference
			: today.getDay() === collection.dayOfWeek
				? today
				: nextDay(today, collection.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6)

	if (collection.frequency === 'weekly') {
		// Apply holiday exceptions to the collection day itself
		const result = applyHolidayException(candidate, holidayExceptions)
		// Calculate display date (night before collection) AFTER applying holiday exceptions
		const displayDate = subDays(result.date, 1)

		// If the display date is in the past, move to next week
		if (displayDate < today) {
			const nextWeekCandidate = addWeeks(candidate, 1)
			const nextResult = applyHolidayException(
				nextWeekCandidate,
				holidayExceptions
			)
			const nextDisplayDate = subDays(nextResult.date, 1)
			return { date: nextDisplayDate, daysDelay: nextResult.daysDelay }
		}

		return { date: displayDate, daysDelay: result.daysDelay }
	}

	// For biweekly, need to check if we're in the right week
	const weeksSinceReference = Math.floor(
		(candidate.getTime() - reference.getTime()) / (7 * 24 * 60 * 60 * 1000)
	)

	const isCorrectWeek = weeksSinceReference % 2 === collection.weekOffset

	if (!isCorrectWeek) {
		candidate = addWeeks(candidate, 1)
	}

	// Apply holiday exceptions to the collection day itself
	const result = applyHolidayException(candidate, holidayExceptions)
	// Calculate display date (night before collection) AFTER applying holiday exceptions
	const displayDate = subDays(result.date, 1)

	// If the display date is in the past, move to next cycle (2 weeks for biweekly)
	if (displayDate < today) {
		const nextCycleCandidate = addWeeks(candidate, 2)
		const nextResult = applyHolidayException(
			nextCycleCandidate,
			holidayExceptions
		)
		const nextDisplayDate = subDays(nextResult.date, 1)
		return { date: nextDisplayDate, daysDelay: nextResult.daysDelay }
	}

	return { date: displayDate, daysDelay: result.daysDelay }
}

export const BinDays = ({ config: widgetConfig }: BinDaysProps) => {
	const {
		collections,
		holidayExceptions,
		refreshIntervalSeconds = 60 * 60,
		cutoffHour = 7
	} = widgetConfig
	const [now, setNow] = useState(new Date())

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(new Date())
		}, refreshIntervalSeconds * 1000)

		return () => clearInterval(interval)
	}, [refreshIntervalSeconds])

	const nextCollections = useMemo(() => {
		const today = startOfDay(now)
		const currentHour = now.getHours()
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Calculate collection dates (night before pickup is already calculated)
		const collectionsWithDates = collections
			.map((collection) => {
				const collectionResult = calculateNextCollection(
					collection,
					now,
					holidayExceptions
				)
				const displayDate = collectionResult.date // Already the night before with exceptions applied
				const daysDelay = collectionResult.daysDelay

				// Display date is when to put bins out (e.g., Tuesday night)
				// Actual collection is the day after (e.g., Wednesday)
				const actualCollectionDate = new Date(displayDate)
				actualCollectionDate.setDate(actualCollectionDate.getDate() + 1)

				// Check if we're on the actual collection day (after midnight) and past cutoff
				const isCollectionDay =
					actualCollectionDate.getTime() === today.getTime()
				const passedCutoff = currentHour >= cutoffHour

				// If it's collection day and past cutoff, skip to next collection
				if (isCollectionDay && passedCutoff) {
					const weeksToAdd = collection.frequency === 'weekly' ? 1 : 2
					const nextCandidate = addWeeks(actualCollectionDate, weeksToAdd)
					const nextDisplayCandidate = subDays(nextCandidate, 1)
					const nextResult = applyHolidayException(
						nextDisplayCandidate,
						holidayExceptions
					)

					const nextDaysUntil = Math.ceil(
						(nextResult.date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
					)

					return {
						...collection,
						displayDate: nextResult.date,
						daysUntil: nextDaysUntil,
						daysDelay: nextResult.daysDelay
					}
				}

				const daysUntil = Math.ceil(
					(displayDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
				)

				return {
					...collection,
					displayDate,
					daysUntil,
					daysDelay
				}
			})
			.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime())

		// Get the earliest date
		if (collectionsWithDates.length === 0) return []

		const earliestDate = collectionsWithDates[0].displayDate.getTime()

		// Return all collections that share the earliest date
		return collectionsWithDates.filter(
			(c) => c.displayDate.getTime() === earliestDate
		)
	}, [collections, now, holidayExceptions, cutoffHour])

	if (nextCollections.length === 0) {
		return null
	}

	const daysUntil = nextCollections[0].daysUntil
	const displayDate = nextCollections[0].displayDate
	const daysDelay = nextCollections[0].daysDelay

	// Determine display text
	const today = startOfDay(now)
	const currentHour = now.getHours()

	// Display date is when to put bins out (Tuesday)
	// The day after is when bins are collected (Wednesday)
	const isDisplayDay = displayDate.getTime() === today.getTime() // Is it Tuesday?
	const actualCollectionDate = new Date(displayDate)
	actualCollectionDate.setDate(actualCollectionDate.getDate() + 1)
	const isCollectionDay = actualCollectionDate.getTime() === today.getTime() // Is it Wednesday?
	const beforeCutoff = currentHour < cutoffHour

	let timeText: string
	if (isDisplayDay) {
		timeText = 'Tonight' // Tuesday - put bins out tonight
	} else if (isCollectionDay && beforeCutoff) {
		timeText = 'Now!' // Wednesday before 7am - last chance!
	} else if (daysUntil === 1) {
		timeText = 'Tomorrow'
	} else {
		timeText = `in ${daysUntil} days`
	}

	return (
		<Widget>
			<div
				className="flex flex-col items-center justify-center gap-4 p-4"
				id="bin-days"
			>
				{/* Header */}
				<div className="font-light text-white/60 text-lg uppercase tracking-wide">
					Next bin day
				</div>

				{/* Date info */}
				<div className="flex flex-col items-center gap-1">
					<div className="font-light text-white text-2xl">
						{format(displayDate, 'E, dd MMMM')}
					</div>
					<div className="font-light text-white/60 text-xl">
						{timeText}
						{daysDelay > 0 && (
							<span className="text-sm text-red-400/80">
								{' '}
								+{daysDelay} day{daysDelay > 1 ? 's' : ''}
							</span>
						)}
					</div>
				</div>

				{/* Icons row */}
				<div className="flex items-center gap-6">
					{nextCollections.map((collection) => {
						const IconComponent =
							collection.type === 'FOOD'
								? Apple
								: collection.type === 'RECYCLING'
									? Recycle
									: collection.type === 'PAPER'
										? FileText
										: Trash2

						return (
							<div
								key={collection.name}
								className="flex flex-col items-center gap-2"
							>
								<IconComponent size={48} color={collection.accent} />
								<div className="font-light text-white/80 text-sm text-center">
									{collection.name}
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</Widget>
	)
}
