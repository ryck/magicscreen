import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const { path = [] } = req.query
	const tflPath = Array.isArray(path) ? path.join('/') : path

	const appId = process.env.TFL_APP_ID
	const appKey = process.env.TFL_APP_KEY

	if (!appId || !appKey) {
		return res.status(500).json({ error: 'TfL credentials not configured' })
	}

	try {
		const params = new URLSearchParams()

		// Copy query params except 'path'
		Object.entries(req.query).forEach(([key, value]) => {
			if (key !== 'path' && typeof value === 'string') {
				params.set(key, value)
			}
		})

		params.set('app_id', appId)
		params.set('app_key', appKey)

		const apiUrl = `https://api.tfl.gov.uk/${tflPath}?${params.toString()}`

		const response = await fetch(apiUrl)

		if (!response.ok) {
			throw new Error(`TfL API responded with status ${response.status}`)
		}

		const data = await response.json()
		res.json(data)
	} catch (error) {
		res
			.status(500)
			.json({
				error: 'Failed to fetch from TfL API',
				details: (error as Error).message
			})
	}
}
