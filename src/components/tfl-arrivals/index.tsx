import { useQuery } from '@tanstack/react-query'
import type { TflArrival, TflArrivalsConfig } from './types'

type TflArrivalsProps = {
  config: TflArrivalsConfig
  className?: string
}

function useTflArrivals(config: {
  naptanId: string
  refreshIntervalSeconds: number
}) {
  const { naptanId, refreshIntervalSeconds } = config

  return useQuery<TflArrival[]>({
    queryKey: ['tfl-arrivals', naptanId],
    queryFn: async () => {
      const response = await fetch(`/api/tfl/StopPoint/${naptanId}/arrivals`)
      if (!response.ok) {
        throw new Error('Failed to fetch TfL arrivals data')
      }
      return response.json()
    },
    refetchInterval: refreshIntervalSeconds * 1000,
    staleTime: refreshIntervalSeconds * 1000
  })
}

function formatTimeToStation(seconds: number): string {
  if (seconds < 60) {
    return 'Due'
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}:00 hour${hours !== 1 ? 's' : ''}`
  }

  return `${hours}:${remainingMinutes.toString().padStart(2, '0')} hours`
}

export const TflArrivals = ({ config, className = '' }: TflArrivalsProps) => {
  const {
    naptanId,
    stopName = 'Stop',
    limit = 10,
    refreshIntervalSeconds = 5 * 60
  } = config

  const { data, isLoading, error } = useTflArrivals({
    naptanId,
    refreshIntervalSeconds
  })

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center text-white/60">Loading TfL arrivals...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="mb-4">
          <div className="font-medium text-white text-xl">{stopName}</div>
        </div>
        <div className="text-center text-white/60">
          Failed to load TfL arrivals
        </div>
      </div>
    )
  }

  // Sort by time to station and limit results
  const sortedArrivals = data
    ? [...data].sort((a, b) => a.timeToStation - b.timeToStation).slice(0, limit)
    : []

  const displayStopName = data?.[0]?.stationName || stopName

  if (!data || data.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="mb-4">
          <div className="font-medium text-white text-xl">{displayStopName}</div>
        </div>
        <div className="text-center text-white/60">No arrivals available</div>
      </div>
    )
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <div className="font-medium text-white text-xl">{displayStopName}</div>
      </div>

      {/* Arrivals List */}
      <div className="flex flex-col gap-2">
        {sortedArrivals.map((arrival) => (
          <div
            className="flex items-center justify-between gap-4"
            key={arrival.id}
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              {/* Route Name */}
              <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-red-600 font-bold text-shadow-white text-sm text-white">
                {arrival.lineName}
              </div>

              {/* Destination */}
              <div className="min-w-0 flex-1 truncate text-white">
                {arrival.destinationName}
              </div>
            </div>

            {/* Time to Station */}
            <div className="w-20 shrink-0 text-right text-white/70">
              {formatTimeToStation(arrival.timeToStation)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
