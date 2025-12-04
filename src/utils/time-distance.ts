export function formatTimeDuration(minutes: number): string {
	if (minutes < 1) {
		return 'Due'
	}

	if (minutes < 60) {
		return `${minutes} min${minutes !== 1 ? 's' : ''}`
	}

	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60

	if (hours === 1 && mins === 0) {
		return '1 hour'
	}

	if (mins === 0) {
		return `${hours} hours`
	}

	return `${hours}:${String(mins).padStart(2, '0')} hours`
}

export function formatShortDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes}min`
	}

	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}
