import { Aqi } from './aqi'
import { Clock } from './clock'
import Compliments from './compliments'
import { HumanizeDuration } from './humanize-duration'
import { Plex } from './plex'
import { RealTimeTrains } from './real-time-trains'
import { TflArrivals } from './tfl-arrivals'
import { Weather } from './weather'
import { YearProgress } from './year-progress'

const App = () => (
  <main className="">
    <div className="grid grid-cols-1 gap-2 p-6 md:grid-cols-2">
      {/* Row 1: Full width merged column */}
      <div className="col-span-1 flex items-center justify-center md:col-span-2" />

      {/* Row 2, Column 1: Top-left aligned */}
      <div className="flex flex-col items-start justify-start gap-4">
        <Clock className="w-full xl:w-4/5" />
        <YearProgress
          className="w-full xl:w-4/5"
          config={{ accentColor: 'oklch(68.5% 0.169 237.323)' }}
        />
        <HumanizeDuration
          className="w-full xl:w-4/5"
          config={{
            events: [
              {
                date: new Date('1979-10-15T07:51:00'),
                title: '👨‍💻 Rick',
                options: {
                  units: ['y', 'mo', 'd']
                }
              },
              {
                date: new Date('1987-10-26T07:51:00'),
                title: '👩🏻‍💼 Loli',
                options: {
                  units: ['y', 'mo', 'd']
                }
              },
              {
                date: new Date('2018-11-01T07:51:00'),
                title: '🧑🏻‍🎓 David',
                options: {
                  units: ['y', 'mo', 'd']
                }
              },
              {
                date: new Date('2023-01-13T22:15:00'),
                title: '👶🏻 Lucas',
                options: {
                  units: ['y', 'mo', 'd']
                }
              },
              {
                date: new Date('2025-12-25T00:00:00'),
                title: '🎄 Christmas',
                options: {
                  units: ['d']
                }
              }
            ]
          }}
        />

        <Aqi
          className="w-full xl:w-4/5"
          config={{
            city: 'London',
            apiToken: import.meta.env.VITE_WAQI_API_KEY
          }}
        />

        <TflArrivals
          className="w-full xl:w-4/5"
          config={{
            naptanId: '490011739N',
            stopName: 'Stanford Way',
          }}
        />

        <Plex
          className="w-full xl:w-4/5"
          config={{
            baseUrl: 'http://192.168.1.5:32400',
            refreshIntervalSeconds: 30
          }}
        />
      </div>

      {/* Row 2, Column 2: Top-right aligned - WeatherWidget */}
      <div className="flex flex-col items-start justify-start gap-4">
        <Weather
          className="w-full xl:w-4/5"
          config={{
            latitude: 51.40545725179989,
            longitude: -0.14240032490376395
          }}
        />

        <RealTimeTrains
          className="w-full xl:w-4/5"
          config={{
            originStationCode: 'SRC',
            destinationStationCode: 'VIC'
          }}
        />
      </div>

      {/* Row 4: Full width merged column */}
      <div className="col-span-1 flex items-center justify-center md:col-span-2">
        <Compliments
          className="w-full"
          config={{ refreshIntervalSeconds: 10 }}
        />
      </div>
    </div>
  </main>
)

export default App
