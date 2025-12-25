import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const { path = [] } = req.query
	const plexPath = Array.isArray(path) ? path.join('/') : path

	const baseUrl = process.env.PLEX_BASE_URL
	const plexToken = process.env.PLEX_TOKEN

	if (!baseUrl) {
		return res.status(500).json({ error: 'Plex base URL not configured' })
	}

	try {
		// Build URL with query params
		const url = new URL(`${baseUrl}/${plexPath}`)

		// Copy query params except 'path'
		Object.entries(req.query).forEach(([key, value]) => {
			if (key !== 'path' && typeof value === 'string') {
				url.searchParams.set(key, value)
			}
		})

		// Add Plex token if configured
		if (plexToken) {
			url.searchParams.set('X-Plex-Token', plexToken)
		}

		const response = await fetch(url.toString(), {
			headers: {
				Accept: 'application/json'
			}
		})

		if (!response.ok) {
			throw new Error(`Plex API responded with status ${response.status}`)
		}

		const data = await response.json()
		res.json(data)
	} catch (error) {
		res
			.status(500)
			.json({
				error: 'Failed to fetch from Plex API',
				details: (error as Error).message
			})
	}
}
