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

### Devices

```typescript
// Get all devices
const devices = await hueBridge.getDevices();

// Get specific device
const device = await hueBridge.getDevice(deviceId);

// Update device (e.g., rename)
await hueBridge.updateDevice(deviceId, {
  metadata: { name: "Living Room Light" }
});
```

### Home Areas

```typescript
// Get all home areas
const homeAreas = await hueBridge.getHomeAreas();

// Get specific home area
const homeArea = await hueBridge.getHomeArea(areaId);

// Update home area
await hueBridge.updateHomeArea(areaId, {
  metadata: { name: "Home" }
});
```

### Advanced Scene Management

```typescript
// Create new scene
const newScene = await hueBridge.addScene({
  metadata: { name: "Evening" },
  group: { rid: roomId, rtype: "room" },
  actions: [
    {
      target: { rid: lightId, rtype: "light" },
      action: {
        on: { on: true },
        dimming: { brightness: 50 },
        color_temperature: { mirek: 366 }
      }
    }
  ]
});

// Delete scene
await hueBridge.removeScene(sceneId);
```

### Advanced Light Control

```typescript
// Set light effects
await hueBridge.updateLight(lightId, {
  effects: { effect: "sparkle" } // or "candle", "fire", etc.
});

// Set alert (flash)
await hueBridge.updateLight(lightId, {
  alert: { action: "breathe" } // temporary flash
});

// Set transition dynamics
await hueBridge.updateLight(lightId, {
  dynamics: { 
    speed: 0.5, // transition speed (0.0 - 1.0)
    duration: 1000 // duration in ms
  }
});

// Gradient lightstrip control
await hueBridge.updateLight(lightId, {
  gradient: {
    points: [
      { color: { xy: { x: 0.3, y: 0.3 } } },
      { color: { xy: { x: 0.5, y: 0.5 } } },
      { color: { xy: { x: 0.7, y: 0.3 } } }
    ]
  }
});
```

### GeoFence API

```typescript
// Get all geofence clients (devices tracking location)
const clients = await hueBridge.getAllGeoFenceClients();

// Get specific client
const client = await hueBridge.getGeoFenceClient(clientId);

// Add geofence client
await hueBridge.addGeoFenceClient({
  name: "My Phone",
  is_at_home: true,
  type: "geofence_client"
});

// Update client status
await hueBridge.updateGeoFenceClient(clientId, {
  is_at_home: false
});

// Remove client
await hueBridge.removeGeoFenceClient(clientId);
```

### Behavior Instances (Automation)

```typescript
// Get all behavior instances (automation scripts)
const behaviors = await hueBridge.getAllBehaviorInstances();

// Get specific behavior
const behavior = await hueBridge.getBehaviorInstance(behaviorId);

// Create behavior instance
await hueBridge.addBehaviorInstance({
  type: "behavior_instance",
  metadata: { name: "Wake Up" },
  enabled: true,
  script_id: "builtin:wake_up",
  configuration: {
    time: "07:00:00",
    days_of_week: ["monday", "tuesday", "wednesday"]
  },
  migrated_from: ""
});

// Update behavior
await hueBridge.updateBehaviorInstance(behaviorId, {
  enabled: false
});

// Remove behavior
await hueBridge.removeBehaviorInstance(behaviorId);
```

### Bridge Information

```typescript
// Get bridge info
const info = await hueBridge.getInfo();
console.log(info.name);           // Bridge name
console.log(info.swversion);      // Software version
console.log(info.apiversion);     // API version
console.log(info.bridgeid);       // Bridge ID
console.log(info.mac);            // MAC address
console.log(info.modelid);        // Model ID
```

### Entertainment Area Management

```typescript
// Get all entertainment areas
const areas = await hueBridge.getEntertainmentAreas();

// Get specific area
const area = await hueBridge.getEntertainmentArea(areaId);

// Create entertainment area
await hueBridge.addEntertainmentArea({
  metadata: { name: "Gaming Setup" },
  configuration_type: "screen",
  locations: {
    service_locations: [
      {
        service: { rid: lightId, rtype: "light" },
        position: { x: 0.5, y: 0.0, z: 1.0 },
        positions: []
      }
    ]
  }
});

// Update entertainment area
await hueBridge.updateEntertainmentArea(areaId, {
  action: "start", // or "stop"
  metadata: { name: "Updated Name" }
});

// Delete entertainment area
await hueBridge.removeEntertainmentArea(areaId);
```

### Create Zones and Rooms

```typescript
// Create zone
await hueBridge.addZone({
  metadata: { name: "Kitchen Area" },
  children: [
    { rid: lightId1, rtype: "light" },
    { rid: lightId2, rtype: "light" }
  ]
});

// Create room
await hueBridge.addRoom({
  metadata: { 
    name: "Bedroom",
    archetype: "bedroom"
  },
  children: [
    { rid: lightId, rtype: "light" }
  ]
});

// Delete zone/room
await hueBridge.removeZone(zoneId);
await hueBridge.removeRoom(roomId);
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
| GeoFence Clients | ✅ | ✅ | ✅ | ✅ | ✅ |
| Behavior Instances | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bridge Info | ✅ | - | - | - | - |

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

### Scene Interface

```typescript
interface Scene {
  id: string;
  type: string;
  speed?: number;
  group: ResourceNode;
  actions: Array<{
    target: ResourceNode;
    action: {
      on?: { on: boolean };
      dimming?: { brightness: number };
      color_temperature?: { mirek: number };
    };
  }>;
  metadata: {
    name: string;
    image?: ResourceNode;
  };
}
```

### Device Interface

```typescript
interface Device {
  id: string;
  type: string;
  services: ResourceNode[];
  metadata: {
    name?: string;
    archetype?: string;
  };
  product_data: {
    certified: boolean;
    manufacturer_name: string;
    model_id: string;
    product_archetype: string;
    product_name: string;
    software_version: string;
  };
}
```

### EntertainmentArea Interface

```typescript
interface EntertainmentArea {
  id: string;
  type: string;
  name: string;
  metadata: {
    name: string;
  };
  channels: Array<{
    channel_id: number;
    position: Array<{ x: number; y: number; z: number }>;
    members: Array<{
      index: number;
      service: ResourceNode;
    }>;
  }>;
  configuration_type: string;
  light_services: ResourceNode[];
  locations: {
    service_locations: Array<{
      position: { x: number; y: number; z: number };
      positions: Array<{ x: number; y: number; z: number }>;
      service: ResourceNode;
    }>;
  };
  status: string;
}
```

### GeoFenceClient Interface

```typescript
interface GeoFenceClient {
  id: string;
  type: string;
  is_at_home?: boolean;
  name: string;
}
```

### BehaviorInstance Interface

```typescript
interface BehaviorInstance {
  id: string;
  type: string;
  script_id: string;
  enabled: boolean;
  state?: {};
  configuration: {};
  last_error?: string;
  migrated_from?: string;
  metadata: {
    name: string;
  };
  status: "initializing" | "running" | "disabled" | "errored";
  dependees: Array<{
    type: string;
    target: ResourceNode;
    level: "critical" | "non_critical";
  }>;
}
```

### BridgeConfig Interface

```typescript
interface BridgeConfig {
  name: string;
  datastoreversion: string;
  swversion: string;
  apiversion: string;
  mac: string;
  bridgeid: string;
  factorynew: boolean;
  replacesbridgeid?: string;
  modelid: string;
  starterkitid?: string;
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

