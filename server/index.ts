import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Request, type Response } from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables in order of precedence
dotenv.config({ path: '.env.local', quiet: true })
dotenv.config({ path: '.env', quiet: true })

const app = express()
const PORT = process.env.PROXY_PORT || 3001
const isProduction = process.env.NODE_ENV === 'production'

app.use(cors())
app.use(express.json())

// Serve static files in production
if (isProduction) {
	const distPath = path.join(__dirname, '..', 'dist')
	console.log(`📁 Serving static files from: ${distPath}`)
	app.use(express.static(distPath))
}

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
	console.log(`\x1b[32m⬅︎\x1b[0m [${req.method}] ${req.url}`)
	next()
})

// RTT API Proxy
app.get('/api/rtt/*splat', async (req: Request, res: Response) => {
	const rttPath = req.path.replace('/api/rtt/', '')

	const username = process.env.RTT_API_USERNAME
	const password = process.env.RTT_API_PASSWORD

	if (!username) {
		return res.status(500).json({ error: 'RTT credentials not configured' })
	}
	if (!password) {
		return res.status(500).json({ error: 'RTT credentials not configured' })
	}

	const credentials = Buffer.from(`${username}:${password}`).toString('base64')

	try {
		const apiUrl = `https://api.rtt.io/${rttPath}`
		console.log(`\x1b[36m➡︎\x1b[0m [${req.method}] ${apiUrl}`)

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
	} catch (_error) {
		res.status(500).json({ error: 'Failed to fetch from RTT API' })
	}
})

// WAQI (Air Quality) API Proxy
app.get('/api/waqi/*splat', async (req: Request, res: Response) => {
	const waqiPath = req.path.replace('/api/waqi/', '')

	const apiToken = process.env.WAQI_API_KEY

	if (!apiToken) {
		return res.status(500).json({ error: 'WAQI API token not configured' })
	}

	try {
		const params = new URLSearchParams(req.query as Record<string, string>)
		params.set('token', apiToken)

		const apiUrl = `https://api.waqi.info/${waqiPath}?${params.toString()}`
		console.log(
			`\x1b[36m➡︎\x1b[0m [${req.method}] ${apiUrl.replace(apiToken, '***')}`
		)

		const response = await fetch(apiUrl)

		if (!response.ok) {
			throw new Error(`WAQI API responded with status ${response.status}`)
		}

		const data = await response.json()
		res.json(data)
	} catch (_error) {
		res.status(500).json({ error: 'Failed to fetch from WAQI API' })
	}
})

// OpenWeatherMap API Proxy
app.get('/api/weather', async (req: Request, res: Response) => {
	const apiKey = process.env.OPENWEATHER_API_KEY

	if (!apiKey) {
		return res
			.status(500)
			.json({ error: 'OpenWeatherMap API key not configured' })
	}

	try {
		const params = new URLSearchParams(req.query as Record<string, string>)
		params.set('appid', apiKey)

		const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?${params.toString()}`
		console.log(
			`\x1b[36m➡︎\x1b[0m [${req.method}] ${apiUrl.replace(apiKey, '***')}`
		)

		const response = await fetch(apiUrl)

		if (!response.ok) {
			throw new Error(
				`OpenWeatherMap API responded with status ${response.status}`
			)
		}

		const data = await response.json()
		res.json(data)
	} catch (_error) {
		res.status(500).json({ error: 'Failed to fetch from OpenWeatherMap API' })
	}
})

// TfL (Transport for London) API Proxy
app.get('/api/tfl/*splat', async (req: Request, res: Response) => {
	const tflPath = req.path.replace('/api/tfl/', '')

	const appId = process.env.TFL_APP_ID
	const appKey = process.env.TFL_APP_KEY

	if (!appId) {
		return res.status(500).json({ error: 'TfL app ID not configured' })
	}
	if (!appKey) {
		return res.status(500).json({ error: 'TfL app key not configured' })
	}

	try {
		const params = new URLSearchParams(req.query as Record<string, string>)
		params.set('app_id', appId)
		params.set('app_key', appKey)

		const apiUrl = `https://api.tfl.gov.uk/${tflPath}?${params.toString()}`
		console.log(
			`\x1b[36m➡︎\x1b[0m [${req.method}] ${apiUrl.replace(appKey, '***')}`
		)

		const response = await fetch(apiUrl)

		if (!response.ok) {
			throw new Error(`TfL API responded with status ${response.status}`)
		}

		const data = await response.json()
		res.json(data)
	} catch (_error) {
		res.status(500).json({ error: 'Failed to fetch from TfL API' })
	}
})

// Health check endpoint for Docker
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({ status: 'ok' })
})

// Serve index.html for all other routes (SPA fallback) in production
if (isProduction) {
	app.get('/*splat', (_req: Request, res: Response) => {
		res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
	})
}

app.listen(PORT, () => {
	console.log(`🚀 Proxy server running on http://localhost:${PORT}`)
})


// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
	console.error('💥 Uncaught Exception:', error.message)
})

process.on('unhandledRejection', (reason) => {
	console.error('💥 Unhandled Rejection:', reason)
})
