import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'

export default [
	// Global ignores
	{
		ignores: [
			'**/dist/**',
			'**/dist-server/**',
			'**/node_modules/**',
			'**/coverage/**',
			'**/.vite/**',
			'**/build/**'
		]
	},

	// Base config for all files
	js.configs.recommended,

	// TypeScript files
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true
				}
			},
			globals: {
				...globals.browser,
				...globals.es2021,
				...globals.node
			}
		},
		plugins: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			'@typescript-eslint': tseslint as any,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			react: reactPlugin as any,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			'react-hooks': reactHooksPlugin as any
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...reactPlugin.configs.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
		},
		settings: {
			react: {
				version: 'detect'
			}
		}
	},

	// Prettier config to disable conflicting rules
	prettierConfig
]
