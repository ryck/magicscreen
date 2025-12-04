# React Vite Modern Tooling Template

A cutting-edge React application template featuring the latest development tools and best practices. Built with Vite, React 19, TypeScript, Tailwind CSS v4, comprehensive testing, and modern developer experience optimizations.

## What is inside?

This project uses many tools and demonstrates modern React development patterns:

### Core Framework & Build Tools

- [Vite](https://vitejs.dev) v7+ - Lightning-fast build tool with HMR
- [React](https://reactjs.org) v19 - Latest React with concurrent features
- [React Compiler](https://react.dev/learn/react-compiler) - Automatic memoization and optimization
- [TypeScript](https://www.typescriptlang.org) v5+ - Advanced type safety and IntelliSense

### Testing Suite

- [Vitest](https://vitest.dev) - Next-generation unit testing framework
- [Testing Library](https://testing-library.com) - Modern React component testing
- [Playwright](https://playwright.dev) - Cross-browser E2E testing
- **Multi-browser support** - Chromium, Firefox, Safari, Edge + mobile devices

### Styling & UI

- [Tailwind CSS](https://tailwindcss.com) v4 - Latest utility-first CSS framework
- [clsx](https://github.com/lukeed/clsx) - Conditional class names utility
- [tailwind-merge](https://github.com/dcastil/tailwind-merge) - Smart Tailwind class merging
- **Custom `cn()` utility** - Optimized class name composition

### Code Quality & DX

- [Biome](https://biomejs.dev) - Unified linting & formatting toolchain (fast Rust-based)
- [Husky](https://typicode.github.io/husky/) - Git hooks for automated quality checks
- [lint-staged](https://github.com/okonet/lint-staged) - Run linters on staged files only
- [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) - Real-time TypeScript & Biome feedback
- [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) - Build process visualization
- **Import ordering** - Automatic import organization
- **Path aliases** - Clean imports using `@/` syntax
- **Type checking** - Strict TypeScript configuration
- **TypeScript configs** - All configuration files use TypeScript for type safety
- **Conventional commits** - Enforced commit message format
- **Pre-commit validation** - Automated linting, formatting, and testing

### Package Management

- [pnpm](https://pnpm.io) - Fast, disk space efficient package manager
- **Workspace support** - Optimized for monorepos and complex projects
- **Strict dependency resolution** - Prevents phantom dependencies
- **Smart caching** - Faster installs and reduced disk usage
- **Lock file efficiency** - Smaller, more reliable dependency trees

## Features Implemented

### 🛠 Developer Experience

- Path aliases for clean imports (`@/utils`, `@/components`)
- Biome for unified linting and formatting (fast Rust-based tooling)
- Automatic import sorting and organization
- TypeScript strict mode with comprehensive typing
- TypeScript-based configuration files with IntelliSense support
- Hot module replacement for fast development

## Getting Started

### Prerequisites

**Node.js:** This project requires Node.js version 22.12.0 or higher (latest LTS).

Check your Node version:

```bash
node --version
```

If you need to install or update Node.js:

- **Using [nvm](https://github.com/nvm-sh/nvm):** `nvm install 22` (recommended)
- **Using [fnm](https://github.com/Schniz/fnm):** `fnm install 22`
- **Direct download:** [nodejs.org](https://nodejs.org)

The project includes a `.nvmrc` file for automatic version switching with nvm/fnm.

**pnpm:** This project uses [pnpm](https://pnpm.io) as the package manager. Install it globally if you haven't already:

**Using npm (recommended):**

```bash
npm install -g pnpm
```

**Using Homebrew (macOS):**

```bash
brew install pnpm
```

For more installation options, visit the [official pnpm installation guide](https://pnpm.io/installation).

### Installation

Create a new project using this template:

```bash
pnpm dlx degit ryck/react-vite-modern-tooling-template my-app
cd my-app
pnpm i
```

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your application.

### Code Quality

**Linting & Formatting:**

```bash
pnpm lint              # Check for lint and format errors
pnpm lint:fix          # Fix auto-fixable issues
pnpm format            # Format code with Biome
pnpm format:check      # Check code formatting
```

**Type Checking:**

```bash
pnpm typecheck         # Run TypeScript compiler checks
```

**All Quality Checks:**

```bash
pnpm validate          # Run typecheck + lint + tests
```

### Testing

**Unit Tests (Vitest):**

```bash
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:ui          # Run with Vitest UI
pnpm test:coverage    # Run with coverage report
```

**End-to-End Tests (Playwright):**

```bash
pnpm test:e2e         # Run e2e tests on all browsers
pnpm test:e2e:ui      # Run with Playwright UI
pnpm test:e2e:headless # Run in headless mode

# Browser-specific testing
pnpm test:e2e:chromium # Test with Chromium only
pnpm test:e2e:firefox  # Test with Firefox only
pnpm test:e2e:webkit   # Test with Safari (WebKit) only
pnpm test:e2e:edge     # Test with Microsoft Edge only

# Group testing
pnpm test:e2e:desktop  # Test all desktop browsers
pnpm test:e2e:mobile   # Test mobile devices (Chrome & Safari)
```

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run automated quality checks at key points in the Git workflow:

### Pre-commit Hook

Runs automatically before each commit to ensure code quality:

```bash
# Triggered on: git commit
� Lint-staged - Fast linting/formatting of changed files only
�🔍 TypeScript type checking
🧪 Unit test execution
```

**What is lint-staged?**

- Only lints and formats **files you changed** (not the entire codebase)
- Automatically fixes issues when possible
- Much faster than checking all files
- Configured in `lint-staged.config.ts`

### Pre-push Hook

Runs comprehensive checks before pushing to remote:

```bash
# Triggered on: git push
🔍 Full validation pipeline (typecheck + lint + tests)
🎭 E2E tests on desktop browsers
```

### Commit Message Validation

Enforces [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Valid formats:
feat: add new component
fix(api): resolve timeout issue
docs: update README
style: improve button styling
refactor: optimize API calls
test: add component tests
chore: update dependencies

# Invalid format will be rejected:
❌ "fixed bug"           # Missing type
❌ "feat add feature"    # Missing colon
❌ "FEAT: new feature"   # Incorrect case
```

### Benefits

- **Prevent broken code** from being committed
- **Maintain consistent** code quality standards
- **Automate repetitive** quality checks
- **Enforce team conventions** for commit messages
- **Catch issues early** before they reach CI/CD

### Bypassing Hooks (Use Sparingly)

```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify

# Skip pre-push hooks (not recommended)
git push --no-verify
```

### Build

Build for production:

```bash
pnpm run build
```

Preview production build:

```bash
pnpm run preview
```

## Project Structure

```
src/
├── components/
│   ├── App.tsx              # Main application component
│   ├── App.test.tsx         # App component tests
│   └── Response.tsx         # Response display component
├── utils/
│   ├── api.ts              # Generic API utilities with AbortController
│   ├── api.test.ts         # API utility tests
│   ├── cn.test.ts          # Class name utility tests
│   └── index.ts            # Utility exports including cn()
├── examples/               # Example components and patterns
└── assets/                # Static assets
```

## Key Utilities

### Class Name Utility (`src/utils/index.ts`)

```typescript
// Smart class merging with Tailwind conflict resolution
const classes = cn(
	'bg-red-500 bg-blue-500', // bg-blue-500 wins
	'p-4 px-2', // px-2 overrides p-4's horizontal padding
	{ 'text-lg': isActive } // conditional classes
)
```

## Configuration Files

All configuration files use TypeScript extensions for better type safety and IDE support:

- `biome.jsonc` - Unified linting & formatting configuration
- `playwright.config.ts` - E2E testing configuration
- `vitest.config.ts` - Unit testing configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.mjs` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `lint-staged.config.ts` - Lint-staged configuration for pre-commit hooks

### Biome Configuration

This project uses [Biome](https://biomejs.dev) instead of ESLint + Prettier for:

**Performance Benefits:**

- ⚡ **10x faster** linting and formatting (Rust-based)
- 🎯 **Single tool** replaces ESLint + Prettier (190 packages removed!)
- 🚀 **Instant feedback** in dev server via vite-plugin-checker

**Features Enabled:**

- ✅ Accessibility rules (a11y)
- ✅ Code complexity checks
- ✅ Security best practices
- ✅ React hooks validation
- ✅ Automatic import organization
- ✅ TypeScript-aware linting

Configuration in `biome.jsonc` includes recommended rules with custom overrides for project-specific needs.

### Git Hooks

- `.husky/pre-commit` - Pre-commit quality checks (lint, format, test)
- `.husky/pre-push` - Pre-push validation and E2E tests
- `.husky/commit-msg` - Conventional commit message validation

## License

This project is licensed under the MIT License.
