export type TflArrival = {
	id: string
	stationName: string
	lineName: string
	destinationName: string
	timeToStation: number
	towards: string
	expectedArrival: string
	currentLocation: string
	platformName?: string
}

export type TflArrivalsConfig = {
	naptanId: string
	stopName?: string
	limit?: number
	refreshIntervalSeconds?: number
}
