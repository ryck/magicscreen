import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Widget } from '../widget'

type AqiWidgetConfig = {
  city: string
  refreshIntervalSeconds?: number
}

type AqiWidgetProps = {
  config: AqiWidgetConfig
}

type WaqiResponse = {
  status: string
  data: {
    aqi: number
    idx: number
    city: {
      name: string
      url: string
    }
    iaqi: {
      pm25?: { v: number }
      pm10?: { v: number }
      o3?: { v: number }
      no2?: { v: number }
      so2?: { v: number }
      co?: { v: number }
    }
  }
}

const POLLUTANT_ORDER = {
  pm25: 1,
  pm10: 2,
  o3: 3,
  no2: 4,
  so2: 5,
  co: 6
}

const POLLUTANT_LABELS: Record<string, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3: 'O3',
  no2: 'NO2',
  so2: 'SO2',
  co: 'CO'
}

/**
 * Get color based on AQI value
 * AQI Scale:
 * 0-50: Good (Green)
 * 51-100: Moderate (Yellow)
 * 101-150: Unhealthy for Sensitive Groups (Orange)
 * 151-200: Unhealthy (Red)
 * 201-300: Very Unhealthy (Purple)
 * 301+: Hazardous (Maroon)
 */
const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) {
    return 'text-green-400'
  }
  if (aqi <= 100) {
    return 'text-yellow-400'
  }
  if (aqi <= 150) {
    return 'text-orange-400'
  }
  if (aqi <= 200) {
    return 'text-red-400'
  }
  if (aqi <= 300) {
    return 'text-purple-400'
  }
  return 'text-red-800'
}

const getAqiLabel = (aqi: number): string => {
  if (aqi <= 50) {
    return 'Good'
  }
  if (aqi <= 100) {
    return 'Moderate'
  }
  if (aqi <= 150) {
    return 'Unhealthy for SG'
  }
  if (aqi <= 200) {
    return 'Unhealthy'
  }
  if (aqi <= 300) {
    return 'Very Unhealthy'
  }
  return 'Hazardous'
}

const getPollutantLabel = (key: string, label: string): React.ReactNode => {
  if (key === 'pm25') {
    return (
      <>
        PM<sub>2.5</sub>
      </>
    )
  }
  if (key === 'pm10') {
    return (
      <>
        PM<sub>10</sub>
      </>
    )
  }
  if (key === 'o3') {
    return (
      <>
        O<sub>3</sub>
      </>
    )
  }
  if (key === 'no2') {
    return (
      <>
        NO<sub>2</sub>
      </>
    )
  }
  if (key === 'so2') {
    return (
      <>
        SO<sub>2</sub>
      </>
    )
  }
  return label
}

const useAqiData = (params: {
  city: string
  refreshIntervalSeconds: number
}) => {
  const { city, refreshIntervalSeconds } = params

  const refreshMs = useMemo(
    () => refreshIntervalSeconds * 1000,
    [refreshIntervalSeconds]
  )

  return useQuery<WaqiResponse>({
    queryKey: ['aqi', city],
    queryFn: async () => {
      const url = `/api/waqi/feed/${city}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch AQI data')
      }
      return response.json()
    },
    refetchInterval: refreshMs,
    staleTime: refreshMs / 2
  })
}

export const Aqi = ({ config }: AqiWidgetProps) => {
  const { city, refreshIntervalSeconds = 5 * 60 } = config

  const { data, isLoading, error } = useAqiData({
    city,
    refreshIntervalSeconds
  })

  const sortedPollutants = useMemo(() => {
    if (!data?.data.iaqi) {
      return []
    }

    return Object.entries(data.data.iaqi)
      .filter(([key]) => key in POLLUTANT_ORDER)
      .sort(
        ([a], [b]) =>
          POLLUTANT_ORDER[a as keyof typeof POLLUTANT_ORDER] -
          POLLUTANT_ORDER[b as keyof typeof POLLUTANT_ORDER]
      )
      .map(([key, value]) => ({
        key,
        label: POLLUTANT_LABELS[key] || key.toUpperCase(),
        value: value.v
      }))
  }, [data])

  if (isLoading) {
    return (
      <Widget>
        <div id="aqi-widget">
          <p className="text-white/70">Loading AQI data...</p>
        </div>
      </Widget>
    )
  }

  if (error || !data || data.status !== 'ok') {
    return (
      <Widget>
        <div id="aqi-widget">
          <p className="text-red-400">Failed to load AQI data</p>
          <p className="text-white/50 text-xs">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </Widget>
    )
  }

  const aqi = data.data.aqi
  const cityName = data.data.city.name
  const aqiColor = getAqiColor(aqi)
  const aqiLabel = getAqiLabel(aqi)

  return (
    <Widget>
      <div className="flex flex-col gap-2 p-4" id="aqi-widget">
        {/* Header with city name and overall AQI */}
        <div className="flex items-center justify-between pb-4">
          <div className="font-light text-lg text-white md:text-xl">
            {cityName}
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`font-bold text-xl md:text-2xl ${aqiColor}`}>
              {aqiLabel}
            </div>
          </div>
        </div>

        {/* Individual pollutants */}
        <div className="grid grid-cols-6 gap-4">
          {sortedPollutants.map((pollutant) => {
            const color = getAqiColor(pollutant.value)
            return (
              <div
                className="flex flex-col items-center gap-0"
                key={pollutant.key}
              >
                <span className={`font-medium text-2xl md:text-2xl ${color}`}>
                  {pollutant.value}
                </span>
                <span className="text-sm text-white/40">
                  {getPollutantLabel(pollutant.key, pollutant.label)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Widget>
  )
}
