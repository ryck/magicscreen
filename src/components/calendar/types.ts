export type CalendarConfig = {
	holidays?: string[] // Array of ISO date strings (YYYY-MM-DD)
	weekStartsOn?: 0 | 1 // 0 = Sunday, 1 = Monday (default: 1)
}
