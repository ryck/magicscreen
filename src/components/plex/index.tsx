import { useQuery } from '@tanstack/react-query'
import type { PlexConfig, PlexMedia, PlexSessionsResponse } from './types'

type PlexProps = {
	config: PlexConfig
	className?: string
}

function usePlexSessions(baseUrl: string, refreshIntervalSeconds: number) {
	return useQuery({
		queryKey: ['plex-sessions', baseUrl],
		queryFn: async () => {
			const response = await fetch(`${baseUrl}/status/sessions`, {
				headers: {
					Accept: 'application/json'
				}
			})
			if (!response.ok) {
				throw new Error('Failed to fetch Plex sessions')
			}
			const data: PlexSessionsResponse = await response.json()
			return data
		},
		refetchInterval: refreshIntervalSeconds * 1000,
		staleTime: refreshIntervalSeconds * 1000
	})
}

function getMediaInfo(media: PlexMedia) {
	if (media.type === 'movie') {
		const metaParts: string[] = []

		if (media.duration) {
			const hours = Math.floor(media.duration / 3_600_000)
			const minutes = Math.floor((media.duration % 3_600_000) / 60_000)
			if (hours > 0) {
				metaParts.push(`${hours}hr ${minutes}min`)
			} else {
				metaParts.push(`${minutes}min`)
			}
		}

		if (media.contentRating) {
			metaParts.push(media.contentRating.toLocaleUpperCase())
		}

		return {
			title: media.year ? `${media.title} (${media.year})` : media.title,
			subtitle: media.Director?.[0]?.tag || null,
			meta: metaParts.length > 0 ? metaParts.join(' • ') : null
		}
	}

	// TV Show episode
	const episodeInfo =
		media.parentIndex && media.index
			? `S${String(media.parentIndex).padStart(2, '0')} E${String(media.index).padStart(2, '0')} - ${media.title}`
			: media.title

	return {
		title: media.grandparentTitle || media.title,
		subtitle: media.parentTitle || null,
		meta: episodeInfo
	}
}

function getStatusColor(state?: string) {
	switch (state) {
		case 'playing':
			return 'bg-green-500/40'
		case 'paused':
			return 'bg-gray-500/40'
		case 'buffering':
			return 'bg-yellow-500/40'
		default:
			return 'bg-gray-500/40'
	}
}

function getCoverUrl(media: PlexMedia, baseUrl: string): string | null {
	const thumb =
		media.type === 'episode'
			? media.grandparentThumb || media.thumb
			: media.thumb

	if (!thumb) {
		return null
	}

	return `${baseUrl}${thumb}`
}

export const Plex = ({ config, className = '' }: PlexProps) => {
	const { baseUrl, refreshIntervalSeconds = 5 * 60 } = config
	const { data, isLoading, error } = usePlexSessions(
		baseUrl,
		refreshIntervalSeconds
	)

	if (isLoading) {
		return null
	}

	if (error) {
		return null
	}

	const sessions = data?.MediaContainer.Metadata || []

	if (sessions.length === 0) {
		return null
	}

	return (
		<div
			className={`@container flex flex-col gap-4 p-4 ${className}`}
			id="plex-widget"
		>
			{sessions.map((media, index) => {
				const mediaInfo = getMediaInfo(media)
				const statusColor = getStatusColor(media.Player?.state)
				const coverUrl = getCoverUrl(media, baseUrl)
				const progress =
					media.viewOffset && media.duration
						? (media.viewOffset / media.duration) * 100
						: 0

				return (
					<div
						className="flex @md:flex-row flex-col gap-4"
						key={media.sessionKey || `session-${index}`}
					>
						{coverUrl && (
							<div className="relative @md:w-44 w-full shrink-0 overflow-hidden">
								{/* Progress bar at the very top of image */}
								<div className="absolute inset-x-0 top-0 z-10">
									{progress > 0 ? (
										<div className="h-1.5 w-full bg-black/40">
											<div
												className={`h-full ${statusColor} transition-all duration-300`}
												style={{ width: `${progress}%` }}
											/>
										</div>
									) : (
										<div className={`h-1.5 w-full ${statusColor}`} />
									)}
								</div>

								<div className="aspect-2/3">
									<img
										alt={mediaInfo.title}
										className="h-full w-full object-contain @md:object-cover"
										height={256}
										src={coverUrl}
										width={176}
									/>
								</div>
							</div>
						)}
						<div className="flex flex-1 flex-col justify-start gap-2">
							<div className="font-light text-2xl text-white md:text-3xl">
								{mediaInfo.title}
							</div>

							{media.type === 'movie' && media.tagline && (
								<div className="@lg:block hidden text-sm text-white/50 italic">
									{media.tagline}
								</div>
							)}

							{mediaInfo.subtitle && (
								<div className="text-lg text-white/70">
									{mediaInfo.subtitle}
								</div>
							)}

							{mediaInfo.meta && (
								<div className="text-sm text-white/60">{mediaInfo.meta}</div>
							)}

							{media.summary && (
								<div className="line-clamp-4 text-sm text-white/60 md:line-clamp-none">
									{media.summary}
								</div>
							)}

							{(media.User?.title ||
								media.Player?.title ||
								media.Player?.device) && (
								<div className="text-white/40 text-xs">
									{[
										media.User?.title,
										media.Player?.title,
										media.Player?.product
									]
										.filter(Boolean)
										.join(' • ')}
								</div>
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}
