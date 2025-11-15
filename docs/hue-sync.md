# Hue-Sync Library

This MCP server uses [hue-sync](https://github.com/jdmg94/Hue-Sync) - a TypeScript library for Philips Hue API v2.

## Why Hue-Sync?

Hue-Sync provides several advantages over other Hue libraries:

- **Modern API v2** - Full support for the latest Philips Hue API
- **TypeScript** - Written in TypeScript with complete type definitions
- **HTTPS Support** - Proper certificate validation with Signify CA
- **mDNS Discovery** - Automatic bridge discovery with remote API fallback
- **Gradient Lightstrip Zones** - Full support for gradient lightstrip zones
- **Entertainment API** - Streaming mode for real-time color updates

## Core Features

### Device Discovery

```typescript
import HueSync from "hue-sync";

// Discover bridges on the network
const [myBridge] = await HueSync.discover();
console.log(myBridge.internalipaddress); // "192.168.0.15"
```

### Authentication

```typescript
// Register new application
const appName = "my-rgb-app";
const credentials = await HueSync.register(
  myBridge.internalipaddress, 
  appName
);

// credentials.username - API key
// credentials.clientkey - Client key for Entertainment API
```

### Basic Light Control

```typescript
const hueBridge = new HueSync({
  credentials,
  id: myBridge.id,
  url: myBridge.internalipaddress,
});

const [myLight] = await hueBridge.getLights();

// Turn on/off
await hueBridge.updateLight(myLight.id, {
  on: { on: true }
});

// Set brightness (0-100)
await hueBridge.updateLight(myLight.id, {
  dimming: { brightness: 75 }
});

// Set color temperature (mirek)
await hueBridge.updateLight(myLight.id, {
  color_temperature: { mirek: 300 }
});

// Set color (XY color space)
await hueBridge.updateLight(myLight.id, {
  color: { xy: { x: 0.3, y: 0.6 } }
});
```

## Advanced Features

### Zones and Rooms

```typescript
// Get all zones
const zones = await hueBridge.getZones();

// Get specific zone
const zone = await hueBridge.getZone(zoneId);

// Update zone
await hueBridge.updateZone(zoneId, {
  metadata: { name: "Living Room" }
});

// Get all rooms
const rooms = await hueBridge.getRooms();

// Get room with grouped light control
const room = await hueBridge.getRoom(roomId);
```

### Light Groups

```typescript
// Get all light groups
const groups = await hueBridge.getLightGroups();

// Control entire group
await hueBridge.updateLightGroup(groupId, {
  on: { on: true }
});
```

### Scenes

```typescript
// Get all scenes
const scenes = await hueBridge.getScenes();

// Get specific scene
const scene = await hueBridge.getScene(sceneId);

// Update scene
await hueBridge.updateScene(sceneId, {
  metadata: { name: "Movie Time" }
});
```

### Entertainment API (Streaming Mode)

Entertainment API enables high-speed streaming for real-time color updates, ideal for gradient lightstrips and synchronized effects.

```typescript
// Get entertainment area
const [area] = await hueBridge.getEntertainmentAreas();

// Start streaming mode (establishes DTLS connection)
await hueBridge.start(area);

// Stream colors to gradient lightstrip zones
// Each array element corresponds to a zone [R, G, B]
const colors = [
  [217, 237, 146],  // Zone 1
  [181, 228, 140],  // Zone 2
  [153, 217, 140],  // Zone 3
  [118, 200, 147],  // Zone 4
  [82, 182, 154],   // Zone 5
  [52, 160, 164],   // Zone 6
  [22, 138, 173],   // Zone 7
];

await hueBridge.transition(colors);

// Stop streaming mode
hueBridge.stop();
```

## API Coverage

Hue-Sync implements most of the official Hue API v2 endpoints:

| Resource | Get All | Get One | Create | Update | Delete |
|----------|---------|---------|--------|--------|--------|
| Lights | ✅ | ✅ | - | ✅ | - |
| Light Groups | ✅ | ✅ | - | ✅ | - |
| Zones | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rooms | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scenes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Entertainment Areas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Devices | ✅ | ✅ | - | ✅ | - |
| Home Areas | ✅ | ✅ | - | ✅ | - |

## HTTPS Certificate Validation

Hue-Sync properly validates the Hue Bridge certificate against the Signify CA. The bridge certificate uses the bridge ID as Common Name.

For production use, include the Signify CA certificate:

```bash
export NODE_EXTRA_CA_CERTS=/path/to/signify.pem
```

For development only:

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Data Types

### Light Interface

```typescript
interface Light {
  id: string;
  id_v1?: string;
  type: string;
  on: { on: boolean };
  dimming: {
    brightness: number;
    min_dim_level?: number;
  };
  color?: {
    xy: { x: number; y: number };
    gamut_type: string;
  };
  color_temperature?: {
    mirek: number;
    mirek_schema?: {
      mirek_minimum: number;
      mirek_maximum: number;
    };
  };
  gradient?: {
    points: Array<{
      color: { xy: { x: number; y: number } };
    }>;
    points_capable: number;
  };
  metadata: {
    name: string;
    archetype?: string;
  };
}
```

### Zone Interface

```typescript
interface Zone {
  id: string;
  type: string;
  children: ResourceNode[];
  services?: ResourceNode[];
  grouped_services?: ResourceNode[];
  metadata: {
    name: string;
    archetype?: string;
  };
}
```

### Room Interface

```typescript
interface Room {
  id: string;
  type: string;
  children: ResourceNode[];
  grouped_services?: ResourceNode[];
  services?: ResourceNode[];
  metadata: {
    name: string;
    archetype?: string;
  };
}
```

## Performance Considerations

- **REST API Rate Limits** - The standard REST API endpoints are rate-limited by Philips for performance. Use for configuration and occasional updates.
- **Entertainment API** - For continuous, high-speed color updates (e.g., sync with music, video), use Entertainment API streaming mode.
- **Batch Updates** - When updating multiple lights, consider using zones or rooms for efficient group control.

## Dependencies

Hue-Sync uses:
- `node-dtls-client` - DTLS protocol for Entertainment API
- `node-dns-sd` - mDNS service discovery
- `node-aead-crypto` - Encryption for Entertainment API

## Resources

- [Hue-Sync GitHub](https://github.com/jdmg94/Hue-Sync)
- [Official Hue API v2 Documentation](https://developers.meethue.com/develop/hue-api-v2/)
- [Hue Entertainment API](https://developers.meethue.com/develop/hue-entertainment/)

## License

Hue-Sync is licensed under Apache License 2.0

