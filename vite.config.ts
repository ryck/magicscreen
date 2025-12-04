/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type PluginOption } from 'vite'
import checker from 'vite-plugin-checker'
import inspect from 'vite-plugin-inspect'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler', {}]]
			}
		}),
		svgr({
			svgrOptions: {
				plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
				svgoConfig: {
					plugins: [
						{
							name: 'preset-default',
							params: {
								overrides: {
									removeViewBox: false,
									cleanupIds: {
										minify: false
									}
								}
							}
						},
						{
							name: 'prefixIds',
							params: {
								prefixIds: true,
								prefixClassNames: false
							}
						}
					]
				}
			}
		}),
		tsconfigPaths() as PluginOption,
		tailwindcss(),
		checker({
			typescript: true,
			terminal: false // Reduce console output
		}),
		inspect() // Visit http://localhost:5173/__inspect/
	],
	server: {
		host: true, // Allow access from network
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true
			}
		}
	},
	build: {
		sourcemap: false,
		chunkSizeWarningLimit: 1000
	}
})
