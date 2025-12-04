import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek
} from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useSharedStore } from '@/store/shared'
import { cn } from '@/utils'
import { Widget } from '../widget'
import type { CalendarConfig } from './types'

type CalendarProps = {
  config?: CalendarConfig
}

export const Calendar = ({ config }: CalendarProps) => {
  const [now] = useState(new Date())
  const holidays = config?.holidays || []
  const weekStartsOn = config?.weekStartsOn ?? 1
  const setIsHoliday = useSharedStore((state) => state.setIsHoliday)

  const days = useMemo(() => {
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn })

    const daysArray: Date[] = []
    let currentDay = calendarStart

    // Generate days until we cover the entire month
    while (currentDay <= monthEnd || daysArray.length % 7 !== 0) {
      daysArray.push(currentDay)
      currentDay = addDays(currentDay, 1)
    }

    return daysArray
      .filter((day) => isSameMonth(day, now)) // Only show current month
      .map((day) => {
        const isWeekend = day.getDay() === 0 || day.getDay() === 6
        const isHoliday = holidays.includes(format(day, 'yyyy-MM-dd'))

        return {
          date: day,
          isToday: isToday(day),
          isWeekend,
          isHoliday
        }
      })
  }, [now, holidays, weekStartsOn])

  const weekDays =
    weekStartsOn === 0
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Update shared store with today's holiday status
  useEffect(() => {
    const todayStr = format(now, 'yyyy-MM-dd')
    const isTodayHoliday = holidays.includes(todayStr)
    setIsHoliday(isTodayHoliday)
  }, [holidays, now, setIsHoliday])

  return (
    <Widget>
      <div className="flex flex-col items-start justify-center gap-3 rounded-3xl p-4">
        {/* Month and Year */}
        <div className="font-light text-white text-2xl">{format(now, 'MMMM yyyy')}</div>

        {/* Calendar Grid */}
        <div className="w-full">
          {/* Week day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="flex h-8 w-8 items-center justify-center font-light text-white/40 text-xs uppercase tracking-wide"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isTodayHoliday = day.isToday && (day.isHoliday || day.isWeekend)
              const isTodayRegular = day.isToday && !day.isHoliday && !day.isWeekend

              return (
                <div
                  key={index}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md text-sm font-light',
                    isTodayHoliday && 'bg-red-500/40 font-bold text-red-100 is-today-holiday',
                    isTodayRegular && 'bg-white/20 font-bold text-white is-today-regular',
                    day.isHoliday && !day.isToday && 'bg-red-500/30 text-red-200 is-holiday-but-not-today',
                    day.isWeekend && !day.isHoliday && !day.isToday && 'bg-red-500/15 text-red-300 is-weekend-but-not-today-and-not-holiday',
                    !day.isHoliday && !day.isWeekend && !day.isToday && 'text-white is-not-holiday-and-not-weekend-and-not-today'
                  )}
                >
                  {format(day.date, 'd')}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Widget>
  )
}
