import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type SharedState = {
	weather: {
		condition?: string
		isDaytime?: boolean
		temperature?: number
		description?: string
		lastUpdated?: number
	}
	setWeather: (
		condition: string,
		isDaytime: boolean,
		temperature: number,
		description: string
	) => void
}

export const useSharedStore = create<SharedState>()(
	devtools(
		(set) => ({
			weather: {},
			setWeather: (condition, isDaytime, temperature, description) =>
				set(
					{
						weather: {
							condition,
							isDaytime,
							temperature,
							description,
							lastUpdated: Date.now()
						}
					},
					false,
					'setWeather'
				)
		}),
		{ name: 'SharedStore' }
	)
)
