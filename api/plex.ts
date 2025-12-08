import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const { path = [] } = req.query
	const plexPath = Array.isArray(path) ? path.join('/') : path

	const baseUrl = process.env.PLEX_BASE_URL

	if (!baseUrl) {
		return res.status(500).json({ error: 'Plex base URL not configured' })
	}

	try {
		const apiUrl = `${baseUrl}/${plexPath}`

		const response = await fetch(apiUrl, {
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
		res.status(500).json({ error: 'Failed to fetch from Plex API' })
	}
}
