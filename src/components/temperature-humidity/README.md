# Temperature & Humidity Widget

A widget that displays temperature, humidity, and battery levels from Home Assistant sensors.

## Features

- Fetches data from Home Assistant `/api/states` endpoint
- Displays temperature and humidity side-by-side with space-between layout
- Shows battery level with color-coded icons:
  - 🟢 Green (BatteryFull) for > 75%
  - 🔵 Blue (BatteryMedium) for > 50%
  - 🟡 Yellow (BatteryLow) for > 25%
  - 🔴 Red (BatteryWarning) for ≤ 25%
- Auto-refreshes every 60 seconds (configurable)
- Supports multiple sensors

## Configuration

```tsx
<TemperatureHumidity
	config={{
		entities: [
			{ name: 'sensor.atc_77ee', location: 'Office' },
			{ name: 'sensor.atc_fce6', location: 'Rack' }
		],
		refreshIntervalSeconds: 60 // Optional, defaults to 60
	}}
/>
```

## Environment Variables

Add your Home Assistant credentials to `.env`:

```env
HASS_TOKEN=your_long_lived_access_token_here
HASS_BASE_URL=https://hass.mapango.pw
```

## Entity Naming Convention

The widget expects entities to follow this naming pattern:

- `{name}_temperature` - Temperature sensor
- `{name}_humidity` - Humidity sensor
- `{name}_battery` - Battery level sensor

For example, if `name` is `sensor.atc_77ee`, the widget will look for:

- `sensor.atc_77ee_temperature`
- `sensor.atc_77ee_humidity`
- `sensor.atc_77ee_battery`

## API Route

The widget uses the `/api/hass` endpoint which proxies requests to your Home Assistant instance with proper authentication using the credentials from environment variables.
