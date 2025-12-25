import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const apiKey = process.env.OPENWEATHER_API_KEY

	if (!apiKey) {
		return res
			.status(500)
			.json({ error: 'OpenWeatherMap API key not configured' })
	}

	try {
		const params = new URLSearchParams()

		// Copy all query params
		Object.entries(req.query).forEach(([key, value]) => {
			if (typeof value === 'string') {
				params.set(key, value)
			}
		})

		params.set('appid', apiKey)

		const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?${params.toString()}`

		const response = await fetch(apiUrl)

		if (!response.ok) {
			throw new Error(
				`OpenWeatherMap API responded with status ${response.status}`
			)
		}

		const data = await response.json()
		res.json(data)
	} catch (error) {
		res
			.status(500)
			.json({
				error: 'Failed to fetch from OpenWeatherMap API',
				details: (error as Error).message
			})
	}
}
