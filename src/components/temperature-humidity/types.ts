export type TemperatureHumidityEntity = {
	name: string
	location: string
}

export type TemperatureHumidityConfig = {
	entities: TemperatureHumidityEntity[]
	refreshIntervalSeconds?: number
}

export type HassState = {
	entity_id: string
	state: string
	attributes: Record<string, unknown>
	last_changed: string
	last_updated: string
}

export type EntityData = {
	name: string
	location: string
	temperature?: number
	humidity?: number
	battery?: number
}

export type DataPoint = {
	timestamp: number
	value: number
	type: 'temperature' | 'humidity' | 'battery'
}
