export type CollectionFrequency = 'weekly' | 'biweekly'

export type CollectionType = {
	name: string
	dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	frequency: CollectionFrequency
	weekOffset: 0 | 1 // For biweekly: which week in the cycle (0 or 1)
	referenceDate: string // ISO date string (YYYY-MM-DD) for a known collection date
	accent: string // Color for the trash icon
}

export type HolidayException = {
	originalDate: string // ISO date string (YYYY-MM-DD)
	revisedDate: string // ISO date string (YYYY-MM-DD)
}

export type BinDaysConfig = {
	collections: CollectionType[]
	holidayExceptions?: HolidayException[]
	refreshIntervalSeconds?: number
}
