import type { Unit } from './types'

/**
 * Converts wind speed to Beaufort scale (0-12)
 * @param speed - Wind speed value
 * @param unit - 'metric' for m/s or 'imperial' for mph
 * @returns Beaufort scale value (0-12)
 */
export function windSpeedToBeaufort(
	speed: number,
	unit: Unit = 'metric'
): number {
	// Convert to m/s if imperial
	const speedMps = unit === 'imperial' ? speed * 0.447_04 : speed

	// Beaufort scale thresholds in m/s
	if (speedMps < 0.5) {
		return 0 // Calm
	}
	if (speedMps < 1.6) {
		return 1 // Light air
	}
	if (speedMps < 3.4) {
		return 2 // Light breeze
	}
	if (speedMps < 5.5) {
		return 3 // Gentle breeze
	}
	if (speedMps < 8.0) {
		return 4 // Moderate breeze
	}
	if (speedMps < 10.8) {
		return 5 // Fresh breeze
	}
	if (speedMps < 13.9) {
		return 6 // Strong breeze
	}
	if (speedMps < 17.2) {
		return 7 // High wind
	}
	if (speedMps < 20.8) {
		return 8 // Gale
	}
	if (speedMps < 24.5) {
		return 9 // Strong gale
	}
	if (speedMps < 28.5) {
		return 10 // Storm
	}
	if (speedMps < 32.7) {
		return 11 // Violent storm
	}
	return 12 // Hurricane
}

type SunEvent = {
	type: 'sunrise' | 'sunset'
	timestamp: number
}

/**
 * Determines the next sun event (sunrise or sunset) based on current time
 *
 * @param params - Object containing sunrise and sunset timestamps
 * @param params.sunrise - Unix timestamp (in seconds) for sunrise
 * @param params.sunset - Unix timestamp (in seconds) for sunset
 * @returns Object with type ('sunrise' | 'sunset') and timestamp of next event
 *
 * @example
 * const { type, timestamp } = getNextSunEvent({ sunrise: sys.sunrise, sunset: sys.sunset })
 * // If current time is before sunrise: { type: 'sunrise', timestamp: 1234567890 }
 * // If current time is after sunrise but before sunset: { type: 'sunset', timestamp: 1234598900 }
 * // If current time is after sunset: { type: 'sunrise', timestamp: 1234654890 }
 */
export function getNextSunEvent(params: {
	sunrise: number
	sunset: number
}): SunEvent {
	const { sunrise, sunset } = params
	const now = Date.now() / 1000 // Convert to seconds

	// If current time is before sunrise, next event is sunrise
	if (now < sunrise) {
		return { type: 'sunrise', timestamp: sunrise }
	}

	// If current time is between sunrise and sunset, next event is sunset
	if (now < sunset) {
		return { type: 'sunset', timestamp: sunset }
	}

	// If current time is after sunset, next event is tomorrow's sunrise
	// Note: The API returns today's sunrise, so if it's past sunset,
	// we should ideally get tomorrow's data, but for now we return tomorrow's estimated sunrise
	return { type: 'sunrise', timestamp: sunrise + 86_400 } // Add 24 hours
}
