import { Aqi } from '@/components/aqi'
import { BinDays } from '@/components/bin-days'
import { Calendar } from '@/components/calendar'
import { Clock } from '@/components/clock'
import Compliments from '@/components/compliments'
import { HumanizeDuration } from '@/components/humanize-duration'
import { Plex } from '@/components/plex'
import { RealTimeTrains } from '@/components/real-time-trains'
import { TflArrivals } from '@/components/tfl-arrivals'
import { Weather } from '@/components/weather'
import { YearProgress } from '@/components/year-progress'

const App = () => (
  <main className="">
    <div className="grid grid-cols-1 gap-2 p-6 md:grid-cols-2">
      {/* Row 1: Full width merged column */}
      <div className="col-span-1 flex items-center justify-center md:col-span-2" />

      {/* Row 2, Column 1: Top-left aligned */}
      <div className="flex flex-col items-start justify-start gap-4">
        <Clock />
        <YearProgress config={{
          accentColor: 'oklch(68.5% 0.169 237.323)'
        }} />
        <HumanizeDuration config={{
          events: [
            {
              date: '1979-10-15T07:51:00',
              title: '👨‍💻 Rick',
              options: {
                units: ['y', 'mo', 'd'] as ('y' | 'mo' | 'd')[]
              }
            },
            {
              date: '1987-10-26T07:51:00',
              title: '👩🏻‍💼 Loli',
              options: {
                units: ['y', 'mo', 'd'] as ('y' | 'mo' | 'd')[]
              }
            },
            {
              date: '2018-11-01T07:51:00',
              title: '🧑🏻‍🎓 David',
              options: {
                units: ['y', 'mo', 'd'] as ('y' | 'mo' | 'd')[]
              }
            },
            {
              date: '2023-01-13T22:15:00',
              title: '👶🏻 Lucas',
              options: {
                units: ['y', 'mo', 'd'] as ('y' | 'mo' | 'd')[]
              }
            },
            {
              date: '2025-12-25T00:00:00',
              title: '🎄 Christmas',
              options: {
                units: ['d'] as ('d')[]
              }
            }
          ]
        }} />

        <Aqi config={{
          city: 'London'
        }} />

        <TflArrivals config={{
          naptanId: '490011739N',
          stopName: 'Stanford Way'
        }} />

        <Plex config={{
          baseUrl: '/api/plex',
          refreshIntervalSeconds: 30
        }} />

        <BinDays config={{
          collections: [
            // {
            //   name: 'Food',
            //   dayOfWeek: 3,
            //   frequency: 'weekly' as const,
            //   weekOffset: 0 as 0 | 1,
            //   referenceDate: '2024-12-03',
            //   accent: 'oklch(66.6% 0.179 58.318)'
            // },
            {
              name: 'Recycling',
              dayOfWeek: 3,
              frequency: 'biweekly' as const,
              weekOffset: 0 as 0 | 1,
              referenceDate: '2024-12-03',
              accent: 'oklch(72.3% 0.219 149.579)'
            },
            {
              name: 'Paper',
              dayOfWeek: 3,
              frequency: 'biweekly' as const,
              weekOffset: 1 as 0 | 1,
              referenceDate: '2024-12-03',
              accent: 'oklch(54.6% 0.245 262.881)'
            },
            {
              name: 'General',
              dayOfWeek: 3,
              frequency: 'biweekly' as const,
              weekOffset: 1 as 0 | 1,
              referenceDate: '2024-12-03',
              accent: 'oklch(87% 0 0)'
            }
          ],
          holidayExceptions: [
            // { originalDate: '2025-12-24', revisedDate: '2025-12-27' },
            { originalDate: '2025-12-25', revisedDate: '2025-12-27' },
            { originalDate: '2025-12-26', revisedDate: '2025-12-29' },
            { originalDate: '2025-12-29', revisedDate: '2025-12-30' },
            { originalDate: '2025-12-30', revisedDate: '2025-12-31' },
            { originalDate: '2025-12-31', revisedDate: '2026-01-02' },
            { originalDate: '2026-01-01', revisedDate: '2026-01-03' },
            { originalDate: '2026-01-02', revisedDate: '2026-01-05' },
            { originalDate: '2026-01-05', revisedDate: '2026-01-06' },
            { originalDate: '2026-01-06', revisedDate: '2026-01-07' },
            { originalDate: '2026-01-07', revisedDate: '2026-01-08' },
            { originalDate: '2026-01-08', revisedDate: '2026-01-09' },
            { originalDate: '2026-01-09', revisedDate: '2026-01-10' }
          ]
        }} />
      </div>

      {/* Row 2, Column 2: Top-right aligned - WeatherWidget */}
      <div className="flex flex-col items-end justify-start gap-4">
        <Weather config={{
          latitude: 51.40545725179989,
          longitude: -0.14240032490376395,
          // sun: false,
          // moon: false
        }} />

        <RealTimeTrains config={{
          originStationCode: 'SRC',
          destinationStationCode: 'VIC'
        }} />

        <Calendar config={{
          holidays: [
            // 2025
            '2025-12-25', // Christmas Day
            '2025-12-26', // Boxing Day
            // 2026
            '2026-01-01', // New Year's Day
            '2026-04-03', // Good Friday
            '2026-04-06', // Easter Monday
            '2026-05-04', // Early May Bank Holiday
            '2026-05-25', // Spring Bank Holiday
            '2026-08-31', // Summer Bank Holiday
            '2026-12-25', // Christmas Day
            '2026-12-28'  // Boxing Day (substitute, as 26th is Saturday)
          ]
        }} />

      </div>

      {/* Row 4: Full width merged column */}
      <div className="col-span-1 flex items-center justify-center md:col-span-2">
        <Compliments config={{
          refreshIntervalSeconds: 10
        }} />
      </div>
    </div>
  </main>
)

export default App
