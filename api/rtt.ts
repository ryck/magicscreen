import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const { path = [] } = req.query
	const rttPath = Array.isArray(path) ? path.join('/') : path

	const username = process.env.RTT_API_USERNAME
	const password = process.env.RTT_API_PASSWORD

	if (!username || !password) {
		return res.status(500).json({ error: 'RTT credentials not configured' })
	}

	const credentials = Buffer.from(`${username}:${password}`).toString('base64')

	try {
		const apiUrl = `https://api.rtt.io/${rttPath}`

		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Basic ${credentials}`,
				Accept: 'application/json'
			}
		})

		if (!response.ok) {
			throw new Error(`RTT API responded with status ${response.status}`)
		}

		const data = await response.json()
		res.json(data)
	} catch (error) {
		res
			.status(500)
			.json({
				error: 'Failed to fetch from RTT API',
				details: (error as Error).message
			})
	}
}
