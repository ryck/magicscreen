export type PlexSessionsResponse = {
	MediaContainer: {
		size: number
		Metadata?: PlexMedia[]
	}
}

export type PlexMedia = {
	type: 'movie' | 'episode'
	title: string
	sessionKey?: string
	tagline?: string
	year?: number
	grandparentTitle?: string
	parentTitle?: string
	parentIndex?: number
	index?: number
	summary?: string
	viewOffset?: number
	duration?: number
	contentRating?: string
	Player?: {
		state: 'playing' | 'paused' | 'buffering'
		title?: string
		device?: string
		platform?: string
		product?: string
		profile?: string
	}
	User?: {
		title?: string
	}
	thumb?: string
	art?: string
	grandparentThumb?: string
	Director?: Array<{ tag: string }>
}

export type PlexConfig = {
	baseUrl: string
	refreshIntervalSeconds?: number
}
