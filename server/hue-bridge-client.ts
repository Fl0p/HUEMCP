interface LightState {
  on?: boolean;
  bri?: number;
  hue?: number;
  sat?: number;
}

interface HueLight {
  name: string;
  type: string;
  modelid: string;
  state: {
    on: boolean;
    bri?: number;
    hue?: number;
    sat?: number;
    effect?: string;
    xy?: number[];
    ct?: number;
    alert?: string;
    colormode?: string;
    mode?: string;
    reachable: boolean;
  };
  capabilities?: {
    control?: {
      mindimlevel?: number;
      maxlumen?: number;
      colorgamuttype?: string;
      ct?: {
        min: number;
        max: number;
      };
    };
  };
}

interface HueLightsResponse {
  [key: string]: HueLight;
}

interface HueZone {
  name: string;
  type: string;
  class?: string;
  lights: string[];
  state?: {
    all_on: boolean;
    any_on: boolean;
  };
}

interface HueZonesResponse {
  [key: string]: HueZone;
}

export interface SetLightStateParams {
  on?: boolean;
  brightness?: number;
  hue?: number;
  saturation?: number;
}

export class HueBridgeClient {
  constructor(
    private bridgeIp: string,
    private apiKey: string
  ) {}

  async listLights(): Promise<HueLightsResponse> {
    const response = await fetch(
      `http://${this.bridgeIp}/api/${this.apiKey}/lights`
    );
    const lights = (await response.json()) as HueLightsResponse | Array<{ error: { description: string } }>;

    if (Array.isArray(lights) && lights[0]?.error) {
      throw new Error(lights[0].error.description);
    }

    return lights as HueLightsResponse;
  }

  async setLightState(lightId: string, params: SetLightStateParams): Promise<void> {
    const state: LightState = {};
    if (params.on !== undefined) state.on = params.on;
    if (params.brightness !== undefined) state.bri = params.brightness;
    if (params.hue !== undefined) state.hue = params.hue;
    if (params.saturation !== undefined) state.sat = params.saturation;

    const response = await fetch(
      `http://${this.bridgeIp}/api/${this.apiKey}/lights/${lightId}/state`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      }
    );

    const result = (await response.json()) as Array<{ error?: { description: string } }>;

    if (result[0]?.error) {
      throw new Error(result[0].error.description);
    }
  }

  async listZones(): Promise<HueZonesResponse> {
    const response = await fetch(
      `http://${this.bridgeIp}/api/${this.apiKey}/groups`
    );
    const groups = (await response.json()) as HueZonesResponse | Array<{ error: { description: string } }>;

    if (Array.isArray(groups) && groups[0]?.error) {
      throw new Error(groups[0].error.description);
    }

    const allGroups = groups as HueZonesResponse;
    const zones: HueZonesResponse = {};

    // Filter only zones (type "Zone")
    for (const [id, group] of Object.entries(allGroups)) {
      if (group.type === "Zone") {
        zones[id] = group;
      }
    }

    return zones;
  }
}

