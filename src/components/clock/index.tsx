import { useEffect, useState } from 'react'
import { config } from '@/config'
import { Widget } from '../widget'

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}

export const Clock = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const dateString = now.toLocaleDateString(config.locale, DATE_OPTIONS)

  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return (
    <Widget>
      <div className="flex flex-col items-start justify-center gap-2 rounded-3xl p-4" id="clock-widget">
        <div className="font-light text-4xl text-white tracking-wide md:text-5xl xl:text-6xl">
          {dateString}
        </div>
        <div className="mt-2 flex items-start gap-1 text-white">
          <span className="font-light text-8xl tabular-nums leading-none tracking-tighter lg:text-9xl">
            {hours}:{minutes}
          </span>
          <span className="mt-2 font-extralight text-5xl text-white/60 tabular-nums lg:mt-3 lg:text-6xl">
            {seconds}
          </span>
        </div>
      </div>
    </Widget>
  )
}
