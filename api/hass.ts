import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const hassToken = process.env.HASS_TOKEN
	const hassBaseUrl = process.env.HASS_BASE_URL

	if (!hassToken) {
		return res.status(500).json({ error: 'HASS token not configured' })
	}

	if (!hassBaseUrl) {
		return res.status(500).json({ error: 'HASS base URL not configured' })
	}

	try {
		const apiUrl = `${hassBaseUrl}/api/states`

		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Bearer ${hassToken}`,
				'Content-Type': 'application/json'
			}
		})

		if (!response.ok) {
			throw new Error(
				`Home Assistant API responded with status ${response.status}`
			)
		}

		const data = await response.json()
		res.json(data)
	} catch (error) {
		res.status(500).json({
			error: 'Failed to fetch from Home Assistant API',
			details: (error as Error).message
		})
	}
}
