import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { Widget } from '../widget'
import { useSharedStore } from '@/store/shared'
import DailyDisplay from './daily-display'
import HourlyDisplay from './hourly-display'
import HumidityDisplay from './humidity-display'
import MoonDisplay from './moon-display'
import MoonSection from './moon-section'
import NextSunDisplay from './next-sun-display'
import SunSection from './sun-section'
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
  sun?: boolean
}

type WeatherProps = {
  config: WeatherConfig
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

export const Weather = ({ config }: WeatherProps) => {
  const {
    latitude,
    longitude,
    refreshIntervalSeconds = 5 * 60,
    unit = import.meta.env.VITE_UNIT,
    exclude = 'minutely,alerts',
    hourly = true,
    daily = true,
    moon = true,
    sun = true
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

  // Memoize weather data calculations (must be before conditional returns)
  const weatherData = useMemo(() => {
    if (!data) {
      return null
    }
    return {
      weatherId: data.current.weather[0]?.id as WeatherId,
      weatherDescription: data.current.weather[0]?.description ?? 'N/A',
      weatherCondition: data.current.weather[0]?.main.toLowerCase() ?? 'anytime',
      temperature: Math.round(data.current.temp),
      feelsLike: Math.round(data.current.feels_like),
      humidity: data.current.humidity,
      windSpeed: data.current.wind_speed,
      uvIndex: data.current.uvi,
      moonPhase: data.daily[0]?.moon_phase
    }
  }, [data])

  // Update shared store when weather data changes
  const setWeather = useSharedStore((state) => state.setWeather)

  useEffect(() => {
    if (weatherData) {
      setWeather(weatherData.weatherCondition, isDaytime, weatherData.temperature, weatherData.weatherDescription)
    }
  }, [weatherData, isDaytime, setWeather])

  if (isLoading) {
    return (
      <Widget>
        <div className="p-4" id="weather-widget">
          <p className="text-white/70">Loading weather...</p>
          <p className="text-white/50 text-xs">
            Fetching: {latitude}, {longitude}
          </p>
        </div>
      </Widget>
    )
  }

  if (error || !data || !weatherData) {
    return (
      <Widget>
        <div className="p-4" id="weather-widget">
          <p className="text-red-400">Failed to load weather</p>
          <p className="text-white/50 text-xs">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </Widget>
    )
  }

  return (
    <Widget>
      <div className="rounded-3xl p-4" id="weather-widget">
        <div className="flex flex-col">
          {/* First row: wind, humidity, UV/Moon, sunrise/sunset */}
          <div className="flex items-center justify-between gap-2 text-sm">
            <WindDisplay speed={weatherData.windSpeed} unit={unit} />

            <HumidityDisplay humidity={weatherData.humidity} />
            {isDaytime ? (
              <UvDisplay uvIndex={weatherData.uvIndex} />
            ) : (
              <MoonDisplay moonPhase={weatherData.moonPhase} />
            )}
            <NextSunDisplay
              sunrise={data.current.sunrise}
              sunset={data.current.sunset}
              iconType='static'
            />
          </div>

          {/* Second row: large icon and temperature */}
          <div className="flex items-center justify-center">
            <div className="flex-1 text-center">
              <WeatherIcon
                className="inline-block size-32 lg:size-48"
                sunrise={data.current.sunrise}
                sunset={data.current.sunset}
                weatherId={weatherData.weatherId}
              />
            </div>
            <div className="flex-1 text-center">
              <div className="font-medium text-7xl/5 text-white leading-none lg:text-[9rem]/10">
                {weatherData.temperature}°
              </div>
            </div>
          </div>

          {/* Third row: description and feels like */}
          <div className="-mt-6 flex items-center justify-between text-center text-lg md:text-xl lg:text-2xl">
            <div className="flex-1 text-white/60 first-letter:capitalize">
              {weatherData.weatherDescription}
            </div>
            <div className="flex-1 text-white/60">Feels like {weatherData.feelsLike}°</div>
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
              moonPhase={weatherData.moonPhase}
              moonrise={data.daily[0]?.moonrise}
              moonset={data.daily[0]?.moonset}
            />
          )}

          {/* Seventh row: sun section */}
          {sun && (
            <SunSection
              className="pt-4"
              sunrise={data.current.sunrise}
              sunset={data.current.sunset}
            />
          )}
        </div>
      </div>
    </Widget>
  )
}
