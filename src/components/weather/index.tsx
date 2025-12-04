import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useSharedStore } from '@/store/shared'
import DailyDisplay from './daily-display'
import HourlyDisplay from './hourly-display'
import HumidityDisplay from './humidity-display'
import MoonDisplay from './moon-display'
import MoonSection from './moon-section'
import NextSunDisplay from './next-sun-display'
import type { OpenWeatherMapResponse, WeatherId } from './types'
import UvDisplay from './uv-display'
import WeatherIcon from './weather-icon'
import WindDisplay from './wind-display'

type WeatherConfig = {
  latitude: number
  longitude: number
  refreshIntervalSeconds?: number
  unit?: 'metric' | 'imperial'
  exclude?: string
  hourly?: boolean
  daily?: boolean
  moon?: boolean
}

type WeatherProps = {
  config: WeatherConfig
  className?: string
}

type BuildWeatherUrlParams = {
  latitude: number
  longitude: number
  unit?: 'metric' | 'imperial'
  exclude?: string
}

const buildWeatherUrl = ({
  latitude,
  longitude,
  unit,
  exclude
}: BuildWeatherUrlParams): string => {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    units: unit ?? 'metric',
    exclude: exclude ?? 'minutely,alerts'
  })
  return `/api/weather?${params.toString()}`
}

const useWeatherData = (params: {
  latitude: number
  longitude: number
  unit: 'metric' | 'imperial'
  exclude?: string
  refreshIntervalSeconds: number
}) => {
  const { latitude, longitude, unit, exclude, refreshIntervalSeconds } = params

  const refreshMs = useMemo(
    () => refreshIntervalSeconds * 1000,
    [refreshIntervalSeconds]
  )

  return useQuery<OpenWeatherMapResponse>({
    queryKey: ['weather', latitude, longitude, unit],
    queryFn: async () => {
      const url = buildWeatherUrl({
        latitude,
        longitude,
        unit,
        exclude
      })
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }
      return response.json()
    },
    refetchInterval: refreshMs,
    staleTime: refreshMs / 2
  })
}

export const Weather = ({ config, className = '' }: WeatherProps) => {
  const {
    latitude,
    longitude,
    refreshIntervalSeconds = 5 * 60,
    unit = import.meta.env.VITE_UNIT,
    exclude = 'minutely,alerts',
    hourly = true,
    daily = true,
    moon = true
  } = config

  const { data, isLoading, error } = useWeatherData({
    latitude,
    longitude,
    unit,
    exclude,
    refreshIntervalSeconds
  })

  // Determine if it's daytime (needs to be before conditional returns)
  const isDaytime = useMemo(() => {
    if (!data) {
      return true
    }
    const now = Date.now() / 1000
    return now >= data.current.sunrise && now < data.current.sunset
  }, [data])

  // Update shared store when weather data changes
  const setWeather = useSharedStore((state) => state.setWeather)

  useEffect(() => {
    if (data) {
      const condition = data.current.weather[0]?.main.toLowerCase() ?? 'anytime'
      const description = data.current.weather[0]?.description ?? 'N/A'
      const temperature = Math.round(data.current.temp)

      setWeather(condition, isDaytime, temperature, description)
    }
  }, [data, isDaytime, setWeather])

  if (isLoading) {
    return (
      <div className="p-4" id="weather-widget">
        <p className="text-white/70">Loading weather...</p>
        <p className="text-white/50 text-xs">
          Fetching: {latitude}, {longitude}
        </p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4" id="weather-widget">
        <p className="text-red-400">Failed to load weather</p>
        <p className="text-white/50 text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  const weatherId = data.current.weather[0]?.id as WeatherId
  const weatherDescription = data.current.weather[0]?.description ?? 'N/A'
  const temperature = Math.round(data.current.temp)
  const feelsLike = Math.round(data.current.feels_like)
  const humidity = data.current.humidity
  const windSpeed = data.current.wind_speed
  const uvIndex = data.current.uvi
  const moonPhase = data.daily[0]?.moon_phase

  return (
    <div className={`rounded-3xl p-4 ${className}`} id="weather-widget">
      <div className="flex flex-col">
        {/* First row: wind, humidity, UV/Moon, sunrise/sunset */}
        <div className="flex items-center justify-between gap-2 text-sm">
          <WindDisplay speed={windSpeed} unit={unit} />

          <HumidityDisplay humidity={humidity} />
          {isDaytime ? (
            <UvDisplay uvIndex={uvIndex} />
          ) : (
            <MoonDisplay moonPhase={moonPhase} />
          )}
          <NextSunDisplay
            sunrise={data.current.sunrise}
            sunset={data.current.sunset}
          />
        </div>

        {/* Second row: large icon and temperature */}
        <div className="flex items-center justify-center">
          <div className="flex-1 text-center">
            <WeatherIcon
              className="inline-block size-32 lg:size-48"
              sunrise={data.current.sunrise}
              sunset={data.current.sunset}
              weatherId={weatherId}
            />
          </div>
          <div className="flex-1 text-center">
            <div className="font-medium text-7xl/5 text-white leading-none lg:text-[9rem]/10">
              {temperature}°
            </div>
          </div>
        </div>

        {/* Third row: description and feels like */}
        <div className="-mt-6 flex items-center justify-between text-center text-lg md:text-xl lg:text-2xl">
          <div className="flex-1 text-white/60 first-letter:capitalize">
            {weatherDescription}
          </div>
          <div className="flex-1 text-white/60">Feels like {feelsLike}°</div>
        </div>

        {/* Fourth row: hourly forecast */}
        {hourly && (
          <HourlyDisplay
            className="pt-4"
            hourly={data.hourly}
            sunrise={data.current.sunrise}
            sunset={data.current.sunset}
          />
        )}

        {/* Fifth row: weekly forecast */}
        {daily && <DailyDisplay className="pt-4" daily={data.daily} />}

        {/* Sixth row: moon section */}
        {moon && (
          <MoonSection
            className="pt-4"
            moonPhase={moonPhase}
            moonrise={data.daily[0]?.moonrise}
            moonset={data.daily[0]?.moonset}
          />
        )}
      </div>
    </div>
  )
}
