import {
	differenceInDays,
	getDaysInMonth,
	getDaysInYear,
	startOfMonth,
	startOfWeek,
	startOfYear
} from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { Widget } from '../widget'

type YearProgressConfig = {
	year?: boolean
	month?: boolean
	week?: boolean
	day?: boolean
	hour?: boolean
	minute?: boolean
	accentColor?: string
}

type YearProgressProps = {
	config: YearProgressConfig
}

type ProgressItem = {
	label: string
	current: number
	total: number
	percentage: number
}

const calculateProgress = (now: Date): Record<string, ProgressItem> => {
	// Year progress
	const yearStart = startOfYear(now)
	const yearDaysTotal = getDaysInYear(now)
	const yearDaysCurrent = differenceInDays(now, yearStart) + 1
	const yearPercentage = (yearDaysCurrent / yearDaysTotal) * 100

	// Month progress
	const monthStart = startOfMonth(now)
	const monthDaysTotal = getDaysInMonth(now)
	const monthDaysCurrent = differenceInDays(now, monthStart) + 1
	const monthPercentage = (monthDaysCurrent / monthDaysTotal) * 100

	// Week progress (Monday start)
	const weekStart = startOfWeek(now, { weekStartsOn: 1 })
	const weekDaysTotal = 7
	const weekDaysCurrent = differenceInDays(now, weekStart) + 1
	const weekPercentage = (weekDaysCurrent / weekDaysTotal) * 100

	// Day progress
	const dayHoursTotal = 24
	const dayHoursCurrent = now.getHours()
	const dayPercentage = (dayHoursCurrent / dayHoursTotal) * 100

	// Hour progress
	const hourMinutesTotal = 60
	const hourMinutesCurrent = now.getMinutes()
	const hourPercentage = (hourMinutesCurrent / hourMinutesTotal) * 100

	// Minute progress
	const minuteSecondsTotal = 60
	const minuteSecondsCurrent = now.getSeconds() + 1
	const minutePercentage = (minuteSecondsCurrent / minuteSecondsTotal) * 100

	return {
		year: {
			label: 'Year',
			current: yearDaysCurrent,
			total: yearDaysTotal,
			percentage: yearPercentage
		},
		month: {
			label: 'Month',
			current: monthDaysCurrent,
			total: monthDaysTotal,
			percentage: monthPercentage
		},
		week: {
			label: 'Week',
			current: weekDaysCurrent,
			total: weekDaysTotal,
			percentage: weekPercentage
		},
		day: {
			label: 'Day',
			current: dayHoursCurrent,
			total: dayHoursTotal,
			percentage: dayPercentage
		},
		hour: {
			label: 'Hour',
			current: hourMinutesCurrent,
			total: hourMinutesTotal,
			percentage: hourPercentage
		},
		minute: {
			label: 'Minute',
			current: minuteSecondsCurrent,
			total: minuteSecondsTotal,
			percentage: minutePercentage
		}
	}
}

export const YearProgress = ({ config }: YearProgressProps) => {
	const {
		year = true,
		month = true,
		week = true,
		day = false,
		hour = false,
		minute = false,
		accentColor = 'oklch(77.7% 0.152 181.912)'
	} = config

	const [now, setNow] = useState(new Date())

	// Determine refresh interval based on smallest time unit
	const refreshInterval = useMemo(() => {
		if (minute) {
			return 1000 // 1 second
		}
		if (day || hour) {
			return 60 * 1000 // 1 minute
		}
		return 60 * 60 * 1000 // 1 hour (year, month, week)
	}, [minute, day, hour])

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(new Date())
		}, refreshInterval)

		return () => clearInterval(interval)
	}, [refreshInterval])

	const progress = useMemo(() => calculateProgress(now), [now])

	// Memoize style objects to avoid recreation
	const backgroundStyle = useMemo(
		() => ({
			backgroundColor: `color-mix(in srgb, ${accentColor} 8%, transparent)`
		}),
		[accentColor]
	)

	const progressGradient = useMemo(
		() =>
			`linear-gradient(to right, color-mix(in srgb, ${accentColor} 40%, white), ${accentColor}, color-mix(in srgb, ${accentColor} 85%, white))`,
		[accentColor]
	)

	const items = useMemo(() => {
		const result: ProgressItem[] = []
		if (year) {
			result.push(progress.year)
		}
		if (month) {
			result.push(progress.month)
		}
		if (week) {
			result.push(progress.week)
		}
		if (day) {
			result.push(progress.day)
		}
		if (hour) {
			result.push(progress.hour)
		}
		if (minute) {
			result.push(progress.minute)
		}
		return result
	}, [year, month, week, day, hour, minute, progress])

	if (items.length === 0) {
		return null
	}

	return (
		<Widget>
			<div className="flex flex-col gap-2 rounded-3xl p-4">
				{items.map((item) => (
					<div className="flex flex-col gap-2" key={item.label}>
						<div className="flex items-center gap-3">
							<span className="w-16 text-right font-light text-white tabular-nums md:w-20 md:text-lg">
								{item.current}/{item.total}
							</span>
							<div
								className="h-2 flex-1 overflow-hidden rounded-full transition-all duration-500"
								style={backgroundStyle}
							>
								<div
									className="h-full rounded-full bg-linear-to-r transition-all duration-500 ease-out"
									style={{
										width: `${item.percentage}%`,
										backgroundImage: progressGradient
									}}
								/>
							</div>
							<span className="w-10 text-right font-light text-white tabular-nums md:w-12 md:text-lg">
								{Math.round(item.percentage)}%
							</span>
						</div>
					</div>
				))}
			</div>
		</Widget>
	)
}
