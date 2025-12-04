# MagicScreen

> Like a modern MagicMirror, but without the mirror...

This is basically a clone of my MagicMirror installation, with all my usual modules reproduced using modern standards (React, Tailwindcss, Zustand, React Query, animations, etc)

It's so modern (and bloated) my poor RaspeberryPi3 can't cope with it, so this is not really an alternative, just something I did for the fun of it, and to learn something...

## Getting Started

### Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/ryck/magicscreen.git
cd magicscreen
pnpm install
```

Create a `.env.local` file with your API credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys for the services you want to use.

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your application.

## License

This project is licensed under the MIT License.
