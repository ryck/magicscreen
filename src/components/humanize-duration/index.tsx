import humanizeDuration from 'humanize-duration'
import { useEffect, useMemo, useState } from 'react'
import { Widget } from '../widget'
import { config } from '@/config'

type HumanizeDurationOptions = {
  language?: string
  units?: ('y' | 'mo' | 'w' | 'd' | 'h' | 'm' | 's' | 'ms')[]
  largest?: number
  round?: boolean
  delimiter?: string
  spacer?: string
  maxDecimalPoints?: number
}

type DurationEvent = {
  date: Date
  title: string
  options?: HumanizeDurationOptions
}

type HumanizeDurationConfig = {
  events: DurationEvent[]
  refreshIntervalSeconds?: number
}

type HumanizeDurationProps = {
  config: HumanizeDurationConfig
}

export const HumanizeDuration = ({
  config: widgetConfig
}: HumanizeDurationProps) => {
  const { events, refreshIntervalSeconds = 1 } = widgetConfig

  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, refreshIntervalSeconds * 1000)

    return () => clearInterval(interval)
  }, [refreshIntervalSeconds])

  const eventData = useMemo(
    () =>
      events.map((event) => {
        const eventTime = event.date.getTime()
        const currentTime = now.getTime()
        const diff = eventTime - currentTime

        const defaultOptions: HumanizeDurationOptions = {
          largest: 3,
          round: true,
          ...event.options
        }

        const humanized = humanizeDuration(Math.abs(diff), defaultOptions)

        return {
          title: event.title,
          date: event.date.toLocaleDateString(config.locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          time: event.date.toLocaleTimeString(config.locale, {
            hour: '2-digit',
            minute: '2-digit'
          }),
          humanized: `${humanized}`
        }
      }),
    [events, now]
  )

  if (events.length === 0) {
    return null
  }

  return (
    <Widget>
      <div
        className="flex flex-col gap-4 rounded-3xl p-4"
        id="humanize-duration-widget"
      >
        {eventData.map((event) => (
          <div className="flex flex-col gap-0" key={event.title}>
            <div className="flex items-center gap-2">
              <div className="font-light text-lg text-white">{event.title}</div>
              <div className="text-sm text-white/40">
                {event.date} &middot; {event.time}
              </div>
            </div>
            <div className="font-light text-lg text-white">{event.humanized}</div>
          </div>
        ))}
      </div>
    </Widget>
  )
}
