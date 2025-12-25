import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const { path = [] } = req.query
	const waqiPath = Array.isArray(path) ? path.join('/') : path

	const apiToken = process.env.WAQI_API_KEY

	if (!apiToken) {
		return res.status(500).json({ error: 'WAQI API token not configured' })
	}

	try {
		const params = new URLSearchParams()

		// Copy query params except 'path'
		Object.entries(req.query).forEach(([key, value]) => {
			if (key !== 'path' && typeof value === 'string') {
				params.set(key, value)
			}
		})

		params.set('token', apiToken)

		const apiUrl = `https://api.waqi.info/${waqiPath}?${params.toString()}`

		const response = await fetch(apiUrl)

		if (!response.ok) {
			throw new Error(`WAQI API responded with status ${response.status}`)
		}

		const data = await response.json()
		res.json(data)
	} catch (error) {
		res
			.status(500)
			.json({
				error: 'Failed to fetch from WAQI API',
				details: (error as Error).message
			})
	}
}
