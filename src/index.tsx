import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRoot } from 'react-dom/client'

import './index.css'

import App from '@/components/app'

const container = document.getElementById('root') as HTMLDivElement
const root = createRoot(container)
const queryClient = new QueryClient()

root.render(
	<QueryClientProvider client={queryClient}>
		<App />
		{import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
	</QueryClientProvider>
)
