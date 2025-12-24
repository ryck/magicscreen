import { type ComponentType, lazy, Suspense, type SVGProps, useMemo } from 'react'
import type { OpenWeatherMapResponse, WeatherId } from './types'
import WeatherIcon from './weather-icon'

type HourlyDisplayProps = {
  hourly: OpenWeatherMapResponse['hourly']
  sunrise: number
  sunset: number
  className?: string
  iconType?: 'animated' | 'static'
}

const HOURLY_FORECAST = 8 // Show next 8 hours

type HourlyItem = {
  dt: number
  type: 'weather' | 'sunrise' | 'sunset'
  temp?: number
  weatherId?: WeatherId
  isDaytime?: boolean
  time?: string
}

export default function HourlyDisplay({
  hourly,
  sunrise,
  sunset,
  className,
  iconType = 'animated'
}: HourlyDisplayProps) {
  // Create combined array of hourly weather and sunrise/sunset events
  const hourlyItems: HourlyItem[] = []
  const now = Math.floor(Date.now() / 1000)

  // Dynamically import sunrise/sunset icons based on iconType
  const SunriseIcon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
    () =>
      lazy(
        () =>
          import(`./weather-icons/${iconType}/sunrise.svg?react`) as Promise<{
            default: ComponentType<SVGProps<SVGSVGElement>>
          }>
      ),
    [iconType]
  )

  const SunsetIcon = useMemo<ComponentType<SVGProps<SVGSVGElement>>>(
    () =>
      lazy(
        () =>
          import(`./weather-icons/${iconType}/sunset.svg?react`) as Promise<{
            default: ComponentType<SVGProps<SVGSVGElement>>
          }>
      ),
    [iconType]
  )

  // Add sunrise if it's in the next hours
  const hoursToShow = hourly.slice(0, HOURLY_FORECAST)
  const timeRange = {
    start: now,
    end: hoursToShow[hoursToShow.length - 1]?.dt || now
  }

  if (sunrise >= timeRange.start && sunrise <= timeRange.end) {
    hourlyItems.push({
      dt: sunrise,
      type: 'sunrise',
      time: new Date(sunrise * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    })
  }

  if (sunset >= timeRange.start && sunset <= timeRange.end) {
    hourlyItems.push({
      dt: sunset,
      type: 'sunset',
      time: new Date(sunset * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    })
  }

  // Add hourly weather data
  hoursToShow.forEach((hour) => {
    const isDaytime = hour.dt >= sunrise && hour.dt < sunset
    hourlyItems.push({
      dt: hour.dt,
      type: 'weather',
      temp: Math.round(hour.temp),
      weatherId: hour.weather[0]?.id as WeatherId,
      isDaytime
    })
  })

  // Sort by timestamp and take first HOURLY_FORECAST items
  const sortedItems = hourlyItems
    .sort((a, b) => a.dt - b.dt)
    .slice(0, HOURLY_FORECAST)

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-1">
        {sortedItems.map((item, index) => {
          if (item.type === 'sunrise' || item.type === 'sunset') {
            const Icon = item.type === 'sunrise' ? SunriseIcon : SunsetIcon
            const label = item.type === 'sunrise' ? 'Sunrise' : 'Sunset'
            return (
              <div className="flex flex-col items-center gap-1" key={item.dt}>
                <div className="text-sm text-white/60">{item.time}</div>
                <Suspense fallback={<div className="size-8 md:size-12 lg:size-12" />}>
                  <Icon className="size-8 text-white md:size-12 lg:size-12" />
                </Suspense>
                <div className="font-medium text-sm text-white">{label}</div>
              </div>
            )
          }

          // Weather item
          const hourTime = new Date(item.dt * 1000).getHours()
          const effectiveSunrise = item.isDaytime ? 0 : Number.MAX_SAFE_INTEGER
          const effectiveSunset = item.isDaytime ? Number.MAX_SAFE_INTEGER : 0

          return (
            <div className="flex flex-col items-center gap-1" key={item.dt}>
              <div className="text-sm text-white/60">
                {index === 0 && item.dt <= now + 3600 ? 'Now' : hourTime}
              </div>
              <WeatherIcon
                className="size-8 text-white md:size-12 lg:size-12"
                sunrise={effectiveSunrise}
                sunset={effectiveSunset}
                weatherId={item.weatherId!}
              />
              <div className="font-medium text-sm text-white">{item.temp}°</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
