import { useQuery } from '@tanstack/react-query'
import { useMemo, useEffect, useState } from 'react'
import {
	Thermometer,
	Droplets,
	BatteryFull,
	BatteryMedium,
	BatteryLow,
	BatteryWarning,
	Plug
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { Widget } from '../widget'
import type {
	TemperatureHumidityConfig,
	HassState,
	EntityData,
	DataPoint
} from './types'

type TemperatureHumidityProps = {
	config: TemperatureHumidityConfig
}

type HistoricalData = {
	[entityName: string]: {
		temperature: DataPoint[]
		humidity: DataPoint[]
	}
}

const MAX_HISTORY_HOURS = 24
const STORAGE_KEY = 'temperature-humidity-history'

const useHassStates = (params: { refreshIntervalSeconds: number }) => {
	const { refreshIntervalSeconds } = params

	const refreshMs = useMemo(
		() => refreshIntervalSeconds * 1000,
		[refreshIntervalSeconds]
	)

	return useQuery<HassState[]>({
		queryKey: ['hass-states'],
		queryFn: async () => {
			const url = '/api/hass'
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error('Failed to fetch Home Assistant states')
			}
			return response.json()
		},
		refetchInterval: refreshMs,
		staleTime: refreshMs / 2
	})
}

const extractEntityData = (
	entityName: string,
	location: string,
	states: HassState[]
): EntityData => {
	const entityData: EntityData = {
		name: entityName,
		location
	}

	// Find temperature entity
	const tempEntity = states.find(
		(state) => state.entity_id === `${entityName}_temperature`
	)
	if (tempEntity && tempEntity.state !== 'unavailable') {
		const temp = parseFloat(tempEntity.state)
		if (!isNaN(temp)) {
			entityData.temperature = Math.round(temp * 10) / 10
		}
	}

	// Find humidity entity
	const humidityEntity = states.find(
		(state) => state.entity_id === `${entityName}_humidity`
	)
	if (humidityEntity && humidityEntity.state !== 'unavailable') {
		const humidity = parseFloat(humidityEntity.state)
		if (!isNaN(humidity)) {
			entityData.humidity = Math.round(humidity)
		}
	}

	// Find battery entity
	const batteryEntity = states.find(
		(state) => state.entity_id === `${entityName}_battery`
	)
	if (batteryEntity && batteryEntity.state !== 'unavailable') {
		const battery = parseFloat(batteryEntity.state)
		if (!isNaN(battery)) {
			entityData.battery = Math.round(battery)
		}
	}

	return entityData
}

const getBatteryIcon = (battery?: number) => {
	// If no battery info, show plug icon (AC powered)
	if (battery === undefined) {
		return <Plug className="h-4 w-4 text-green-400" />
	}

	if (battery > 75) {
		return <BatteryFull className="h-4 w-4 text-green-400" />
	}
	if (battery > 50) {
		return <BatteryMedium className="h-4 w-4 text-blue-400" />
	}
	if (battery > 25) {
		return <BatteryLow className="h-4 w-4 text-yellow-400" />
	}
	return <BatteryWarning className="h-4 w-4 text-red-400" />
}

const CustomTooltip = ({
	active,
	payload
}: {
	active?: boolean
	payload?: unknown[]
}) => {
	if (active && payload && payload.length) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data = (payload[0] as any).payload as DataPoint
		const date = new Date(data.timestamp)
		const dateStr = date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
		const unit =
			data.type === 'temperature' ? '°C' : data.type === 'humidity' ? '%' : ''

		return (
			<div className="rounded bg-black/90 px-2 py-1 text-xs text-white">
				<p className="font-medium">
					{data.value} {unit}
				</p>
				<p className="text-white/60">{dateStr}</p>
			</div>
		)
	}
	return null
}

const Sparkline = ({ data, color }: { data: DataPoint[]; color: string }) => {
	if (data.length < 2) return null

	const type = data[0]?.type
	const domain =
		type === 'temperature'
			? (['dataMin - 0.1', 'dataMax + 0.1'] as const)
			: (['dataMin - 1', 'dataMax + 1'] as const)

	return (
		<ResponsiveContainer width={120} height={20}>
			<LineChart data={data}>
				<YAxis hide domain={domain} />
				<Tooltip content={<CustomTooltip />} />
				<Line
					type="monotone"
					dataKey="value"
					stroke={color}
					strokeWidth={2}
					dot={false}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	)
}

// Load historical data from localStorage
const loadHistoricalData = (): HistoricalData => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) return {}

		const data = JSON.parse(stored) as HistoricalData
		const now = Date.now()
		const maxAge = MAX_HISTORY_HOURS * 60 * 60 * 1000

		// Clean up old data points (older than 24 hours)
		const cleaned: HistoricalData = {}
		Object.entries(data).forEach(([entityName, history]) => {
			cleaned[entityName] = {
				temperature: history.temperature
					.filter((point) => now - point.timestamp < maxAge)
					.map((p) => ({ ...p, type: p.type || 'temperature' })),
				humidity: history.humidity
					.filter((point) => now - point.timestamp < maxAge)
					.map((p) => ({ ...p, type: p.type || 'humidity' }))
			}
		})

		return cleaned
	} catch (error) {
		console.error('Failed to load historical data:', error)
		return {}
	}
}

// Save historical data to localStorage
const saveHistoricalData = (data: HistoricalData) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
	} catch (error) {
		console.error('Failed to save historical data:', error)
	}
}

export const TemperatureHumidity = ({ config }: TemperatureHumidityProps) => {
	const { entities, refreshIntervalSeconds = 60 } = config
	const [historicalData, setHistoricalData] = useState<HistoricalData>(() =>
		loadHistoricalData()
	)

	const { data, isLoading, error } = useHassStates({
		refreshIntervalSeconds
	})

	const entitiesData = useMemo(() => {
		if (!data) {
			return []
		}

		return entities
			.map((entity) => extractEntityData(entity.name, entity.location, data))
			.filter(
				(entity) =>
					entity.temperature !== undefined || entity.humidity !== undefined
			)
	}, [data, entities])

	// Update historical data when new data arrives

	useEffect(() => {
		if (!entitiesData.length) return

		const timestamp = Date.now()
		const maxAge = MAX_HISTORY_HOURS * 60 * 60 * 1000

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHistoricalData((prev) => {
			const updated = { ...prev }

			entitiesData.forEach((entity) => {
				if (!updated[entity.name]) {
					updated[entity.name] = {
						temperature: [],
						humidity: []
					}
				}

				// Add temperature data point
				if (entity.temperature !== undefined) {
					const tempHistory = [...updated[entity.name].temperature]
					tempHistory.push({
						timestamp,
						value: entity.temperature,
						type: 'temperature'
					})
					// Filter out data older than 24 hours
					updated[entity.name].temperature = tempHistory.filter(
						(point) => timestamp - point.timestamp < maxAge
					)
				}

				// Add humidity data point
				if (entity.humidity !== undefined) {
					const humidityHistory = [...updated[entity.name].humidity]
					humidityHistory.push({
						timestamp,
						value: entity.humidity,
						type: 'humidity'
					})
					// Filter out data older than 24 hours
					updated[entity.name].humidity = humidityHistory.filter(
						(point) => timestamp - point.timestamp < maxAge
					)
				}
			})

			// Save to localStorage
			saveHistoricalData(updated)

			return updated
		})
	}, [entitiesData])

	if (isLoading) {
		return (
			<Widget>
				<div id="temperature-humidity-widget">
					<p className="text-white/70">Loading sensor data...</p>
				</div>
			</Widget>
		)
	}

	if (error || !data) {
		return (
			<Widget>
				<div id="temperature-humidity-widget">
					<p className="text-red-400">Failed to load sensor data</p>
					<p className="text-white/50 text-xs">
						{error instanceof Error ? error.message : 'Unknown error'}
					</p>
				</div>
			</Widget>
		)
	}

	return (
		<Widget>
			<div className="flex flex-col gap-4 p-4" id="temperature-humidity-widget">
				{entitiesData.map((entity, index) => {
					const history = historicalData[entity.name]

					return (
						<div
							className="flex flex-col gap-2 rounded-lg bg-white/5 p-4"
							key={`${entity.name}-${index}`}
						>
							{/* Location header with battery */}
							<div className="flex items-center justify-between">
								<div className="font-light text-lg text-white md:text-xl">
									{entity.location}
								</div>
								{/* Battery/Power icon */}
								<div className="flex items-center gap-1">
									{getBatteryIcon(entity.battery)}
									{entity.battery !== undefined && (
										<span className="text-sm text-white/60">
											{entity.battery}%
										</span>
									)}
								</div>
							</div>

							{/* Temperature and Humidity - space between */}
							<div className="flex items-center justify-between">
								{/* Temperature with sparkline */}
								{entity.temperature !== undefined && (
									<div className="flex items-center gap-2">
										<Thermometer className="h-5 w-5 text-red-400" />
										<span className="font-medium text-2xl text-white md:text-3xl">
											{entity.temperature}
										</span>
										{history?.temperature && (
											<div className="hidden @md:block">
												<Sparkline data={history.temperature} color="#f87171" />
											</div>
										)}
									</div>
								)}

								{/* Humidity with sparkline */}
								{entity.humidity !== undefined && (
									<div className="flex items-center gap-2">
										{history?.humidity && (
											<div className="hidden @md:block">
												<Sparkline data={history.humidity} color="#60a5fa" />
											</div>
										)}
										<span className="font-medium text-2xl text-white md:text-3xl">
											{entity.humidity}
										</span>
										<Droplets className="h-5 w-5 text-blue-400" />
									</div>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</Widget>
	)
}
