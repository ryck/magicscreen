import { addWeeks, format, isSameDay, nextDay, parseISO, startOfDay, subDays } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { Widget } from '../widget'
import type { BinDaysConfig, CollectionType, HolidayException } from './types'
import { id } from 'date-fns/locale'

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
    // Calculate display date (night before collection) BEFORE applying holiday exceptions
    const displayCandidate = subDays(candidate, 1)
    return applyHolidayException(displayCandidate, holidayExceptions)
  }

  // For biweekly, need to check if we're in the right week
  const weeksSinceReference = Math.floor(
    (candidate.getTime() - reference.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )

  const isCorrectWeek = weeksSinceReference % 2 === collection.weekOffset

  if (!isCorrectWeek) {
    candidate = addWeeks(candidate, 1)
  }

  // Calculate display date (night before collection) BEFORE applying holiday exceptions
  const displayCandidate = subDays(candidate, 1)
  return applyHolidayException(displayCandidate, holidayExceptions)
}

export const BinDays = ({ config: widgetConfig }: BinDaysProps) => {
  const { collections, holidayExceptions, refreshIntervalSeconds = 60 * 60 } = widgetConfig
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, refreshIntervalSeconds * 1000)

    return () => clearInterval(interval)
  }, [refreshIntervalSeconds])

  const nextCollections = useMemo(() => {
    // Calculate collection dates (night before pickup is already calculated)
    const collectionsWithDates = collections
      .map((collection) => {
        const collectionResult = calculateNextCollection(collection, now, holidayExceptions)
        const displayDate = collectionResult.date // Already the night before with exceptions applied
        const daysDelay = collectionResult.daysDelay
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
    return collectionsWithDates.filter((c) => c.displayDate.getTime() === earliestDate)
  }, [collections, now, holidayExceptions])

  if (nextCollections.length === 0) {
    return null
  }

  const daysUntil = nextCollections[0].daysUntil
  const displayDate = nextCollections[0].displayDate
  const daysDelay = nextCollections[0].daysDelay

  return (
    <Widget>
      <div className="flex flex-col items-center justify-center gap-4 p-4" id="bin-days">
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
            {daysUntil === 0
              ? 'Tonight'
              : daysUntil === 1
                ? 'Tomorrow'
                : `in ${daysUntil} days`}
            {daysDelay > 0 && (
              <span className="text-sm text-red-400/80">
                {' '}+{daysDelay} day{daysDelay > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Icons row */}
        <div className="flex items-center gap-6">
          {nextCollections.map((collection) => (
            <div key={collection.name} className="flex flex-col items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke={collection.accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <div className="font-light text-white/80 text-sm text-center">
                {collection.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  )
}
