import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Widget } from '../widget'
import { useSharedStore } from '@/store/shared'
import { cn } from '@/utils'
import complimentsData from './compliments.json'
import type { ComplimentsConfig } from './types'

type ComplimentsProps = {
  config: ComplimentsConfig
}

const DEFAULT_REFRESH_INTERVAL_SECONDS = 5 * 60

type WeightedCompliment = {
  text: string
  weight: number
}

function getWeightedRandomCompliment(compliments: WeightedCompliment[]): string {
  // Calculate total weight
  const totalWeight = compliments.reduce((sum, c) => sum + c.weight, 0)

  // Generate random number between 0 and totalWeight
  let random = Math.random() * totalWeight

  // Select compliment based on weight
  for (const compliment of compliments) {
    random -= compliment.weight
    if (random <= 0) {
      return compliment.text
    }
  }
  // Fallback (should never reach here)
  return compliments[0].text
}

export default function Compliments({
  config
}: ComplimentsProps) {
  const { refreshIntervalSeconds = DEFAULT_REFRESH_INTERVAL_SECONDS } = config

  // Get weather condition from shared store
  const weatherCondition = useSharedStore((state) => state.weather.condition)
  const isDaytime = useSharedStore((state) => state.weather.isDaytime)
  const isHoliday = useSharedStore((state) => state.isHoliday)

  const [compliment, setCompliment] = useState<string>(() =>
    getWeightedRandomCompliment([{ text: complimentsData.anytime[0] || 'Welcome!', weight: 1 }])
  )
  const [isVisible, setIsVisible] = useState(true)
  const timeoutRef = useRef<number | null>(null)

  // Get time of day
  const getTimeOfDay = useCallback((): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours()
    if (hour >= 9 && hour < 12) {
      return 'morning'
    }
    if (hour >= 12 && hour < 18) {
      return 'afternoon'
    }
    if (hour >= 18 && hour < 22) {
      return 'evening'
    }
    return 'night'
  }, [])

  // Helper to add compliments by key with weight
  const addComplimentsByKey = useCallback(
    (compliments: WeightedCompliment[], key: string, weight: number) => {
      const typedKey = key as keyof typeof complimentsData
      // console.log('Adding compliments for key:', typedKey)
      if (complimentsData[typedKey]?.length > 0) {
        const items = complimentsData[typedKey].map(text => ({ text, weight }))
        // console.log('Compliments:', items)
        compliments.push(...items)
      }
    },
    []
  )

  // Memoize date strings to avoid recalculation on every render
  const dateStrings = useMemo(() => {
    const now = new Date()
    return {
      year: now.getFullYear().toString(),
      month: (now.getMonth() + 1).toString().padStart(2, '0'),
      day: now.getDate().toString().padStart(2, '0')
    }
  }, []) // Empty deps - only calculate once per component mount

  // Function to get appropriate compliments based on context with weights
  // Priority: 1-year-month-day, 2-month-day, 3-timeofDay, 4-weather day/night, 5-weather, 6-holiday, 7-anytime
  const getContextualCompliments = useCallback((): WeightedCompliment[] => {
    const compliments: WeightedCompliment[] = []

    const { year, month, day } = dateStrings

    // Priority 1: Exact date (highest weight)
    addComplimentsByKey(compliments, `${year}-${month}-${day}`, 100)

    // Priority 2: Month-day pattern
    addComplimentsByKey(compliments, `....-${month}-${day}`, 80)

    // Priority 3: Time of day
    const timeOfDay = getTimeOfDay()
    addComplimentsByKey(compliments, timeOfDay, 60)

    // Priority 4 & 5: Weather-based compliments
    if (weatherCondition && isDaytime !== undefined) {
      const dayNightPrefix = isDaytime ? 'day' : 'night'
      const dayNightKey = `${dayNightPrefix}_${weatherCondition.toLowerCase()}`
      const weatherKey = weatherCondition.toLowerCase()

      // Priority 4: Weather with day/night
      addComplimentsByKey(compliments, dayNightKey, 40)

      // Priority 5: Weather only
      addComplimentsByKey(compliments, weatherKey, 30)
    }

    // Priority 6: Holiday compliments
    if (isHoliday) {
      addComplimentsByKey(compliments, 'holiday', 20)
    }

    // Priority 7: Anytime compliments (lowest weight)
    // Only add if we don't have enough special compliments
    if (compliments.length < 10) {
      addComplimentsByKey(compliments, 'anytime', 10)
    }
    // console.log('Final compliments list:', compliments)
    return compliments
  }, [weatherCondition, isDaytime, isHoliday, getTimeOfDay, addComplimentsByKey, dateStrings])

  useEffect(() => {
    const updateCompliment = () => {
      setIsVisible(false)

      // Clear any existing timeout
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        const contextualCompliments = getContextualCompliments()
        setCompliment(getWeightedRandomCompliment(contextualCompliments))
        setIsVisible(true)
        timeoutRef.current = null
      }, 500)
    }

    // Update compliment immediately on mount
    updateCompliment()

    const interval = setInterval(
      updateCompliment,
      refreshIntervalSeconds * 1000
    )

    return () => {
      clearInterval(interval)
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [refreshIntervalSeconds, getContextualCompliments])

  return (
    <Widget>
      <div
        className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center text-shadow-white backdrop-blur-sm"
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
    </Widget>
  )
}
