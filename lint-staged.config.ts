const config = {
	// Lint and format with ESLint and Prettier
	"*.{ts,tsx}": ["eslint --fix", "prettier --write"],
	"*.{json,md,css,html}": ["prettier --write"],
};

export default config;
