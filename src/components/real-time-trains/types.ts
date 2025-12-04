export type RealTimeTrainsResponse = {
	location: {
		name: string
		crs: string
	}
	filter: {
		destination: {
			name: string
			crs: string
		}
	}
	services: RealTimeTrainService[]
}

export type RealTimeTrainService = {
	locationDetail: {
		origin: Array<{
			description: string
			crs: string
		}>
		destination: Array<{
			description: string
			crs: string
			publicTime?: string
		}>
		gbttBookedDeparture?: string
		realtimeDeparture?: string
		gbttBookedArrival?: string
		realtimeArrival?: string
		platform?: string
	}
	serviceUid: string
	runDate: string
}

export type RealTimeTrainsConfig = {
	originStationCode: string
	destinationStationCode: string
	refreshIntervalSeconds?: number
	limit?: number
}
