interface LightState {
  on?: boolean;
  bri?: number;
  hue?: number;
  sat?: number;
}

interface HueLight {
  name: string;
  state: {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
  };
}

interface HueLightsResponse {
  [key: string]: HueLight;
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
}

