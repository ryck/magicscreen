import { useQuery } from '@tanstack/react-query'
import { format, parse } from 'date-fns'
import type { RealTimeTrainsConfig, RealTimeTrainsResponse } from './types'

const TIME_FORMAT_HHMM = /^\d{4}$/

type RealTimeTrainsProps = {
  config: RealTimeTrainsConfig
  className?: string
}

function useRealTimeTrains(config: {
  originStationCode: string
  destinationStationCode: string
  refreshIntervalSeconds: number
}) {
  const { originStationCode, destinationStationCode, refreshIntervalSeconds } =
    config

  return useQuery({
    queryKey: ['real-time-trains', originStationCode, destinationStationCode],
    queryFn: async () => {
      const response = await fetch(
        `/api/rtt/api/v1/json/search/${originStationCode}/to/${destinationStationCode}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch train data')
      }
      const data: RealTimeTrainsResponse = await response.json()
      return data
    },
    refetchInterval: refreshIntervalSeconds * 1000,
    staleTime: refreshIntervalSeconds * 1000
  })
}

function formatTime(timeString?: string): string {
  if (!timeString) {
    return 'N/A'
  }
  // Handle HHmm format (e.g., "1430" -> "14:30")
  if (TIME_FORMAT_HHMM.test(timeString)) {
    const date = parse(timeString, 'HHmm', new Date())
    return format(date, 'HH:mm')
  }
  return timeString
}

function calculateTimeToArrival(arrivalTime?: string): string {
  if (!arrivalTime) {
    return 'N/A'
  }

  const now = new Date()
  const arrival = parse(arrivalTime, 'HHmm', now)

  // If arrival is before now, assume it's tomorrow
  if (arrival < now) {
    arrival.setDate(arrival.getDate() + 1)
  }

  const diffMs = arrival.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60_000)

  if (diffMins < 1) {
    return 'Due'
  }

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`
  }

  const hours_count = Math.floor(diffMins / 60)
  const mins = diffMins % 60

  if (hours_count === 1 && mins === 0) {
    return '1 hour'
  }

  if (mins === 0) {
    return `${hours_count} hours`
  }

  return `${hours_count}:${String(mins).padStart(2, '0')} hours`
}

function calculateTripDuration(departure?: string, arrival?: string): string {
  if (!departure) {
    return 'N/A'
  }
  if (!arrival) {
    return 'N/A'
  }

  const depDate = parse(departure, 'HHmm', new Date())
  const arrDate = parse(arrival, 'HHmm', new Date())

  // If arrival is before departure, it's next day
  if (arrDate < depDate) {
    arrDate.setDate(arrDate.getDate() + 1)
  }

  const durationMins = Math.floor(
    (arrDate.getTime() - depDate.getTime()) / 60_000
  )

  if (durationMins < 60) {
    return `${durationMins}min`
  }

  const hours = Math.floor(durationMins / 60)
  const mins = durationMins % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

function calculateDelay(gbttBooked?: string, realtime?: string): string | null {
  if (!gbttBooked) {
    return null
  }
  if (!realtime) {
    return null
  }

  const bookedDate = parse(gbttBooked, 'HHmm', new Date())
  const realtimeDate = parse(realtime, 'HHmm', new Date())

  const delayMins = Math.floor(
    (realtimeDate.getTime() - bookedDate.getTime()) / 60_000
  )

  if (delayMins === 0) {
    return null
  }

  if (delayMins > 0) {
    return `+${delayMins} ${delayMins === 1 ? 'min' : 'mins'}`
  }

  return null
}

export const RealTimeTrains = ({
  config,
  className = ''
}: RealTimeTrainsProps) => {
  const {
    originStationCode,
    destinationStationCode,
    refreshIntervalSeconds = 5 * 60,
    limit = 5
  } = config

  const { data, isLoading, error } = useRealTimeTrains({
    originStationCode,
    destinationStationCode,
    refreshIntervalSeconds
  })

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center text-white/60">
          Loading train information...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center text-white/60">
          Failed to load train information
        </div>
      </div>
    )
  }

  // Sort by time to arrival and limit results
  const allServices = data?.services || []
  const sortedServices = [...allServices].sort((a, b) => {
    const departureA =
      a.locationDetail.realtimeDeparture || a.locationDetail.gbttBookedDeparture
    const departureB =
      b.locationDetail.realtimeDeparture || b.locationDetail.gbttBookedDeparture

    if (!departureA) {
      return 0
    }
    if (!departureB) {
      return 0
    }

    const timeA = parse(departureA, 'HHmm', new Date())
    const timeB = parse(departureB, 'HHmm', new Date())

    return timeA.getTime() - timeB.getTime()
  })
  const services = sortedServices.slice(0, limit)

  if (services.length === 0) {
    return (
      <div className={`p-4 ${className}`} id="real-time-trains">
        <div className="mb-4">
          <div className="font-light text-lg text-white">
            {data?.location.name} → {data?.filter.destination.name}
          </div>
        </div>
        <div className="text-center text-white/60">No trains available</div>
      </div>
    )
  }

  return (
    <div className={`p-4 ${className}`} id='real-time-trains'>
      <div className="mb-4">
        <div className="font-medium text-white text-xl">
          {data?.location.name} → {data?.filter.destination.name}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {services.map((service) => {
          const departure =
            service.locationDetail.realtimeDeparture ||
            service.locationDetail.gbttBookedDeparture
          const arrival = service.locationDetail.destination[0]?.publicTime
          const platform = service.locationDetail.platform || '—'
          const tta = calculateTimeToArrival(departure)
          const duration = calculateTripDuration(departure, arrival)
          const delay = calculateDelay(
            service.locationDetail.gbttBookedDeparture,
            service.locationDetail.realtimeDeparture
          )

          return (
            <div
              className="flex items-center justify-between gap-4"
              key={`${service.serviceUid}/${service.runDate}`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-green-800 font-bold text-white text-sm">
                  {platform}
                </div>
                <div className="min-w-0 flex-1 truncate text-white">
                  {formatTime(departure)} → {formatTime(arrival)}
                  <span className="ml-2 hidden text-sm text-white/60 lg:inline">
                    ({duration})
                  </span>
                  {delay && (
                    <span className="ml-2 hidden text-red-400 text-xs lg:inline">
                      {delay}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-20 shrink-0 text-right text-white/70">
                {tta}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
