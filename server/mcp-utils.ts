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

export function remapLightsToMCP(lights: HueLightsResponse) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(lights, null, 2),
      },
    ],
  };
}

export function remapLightStateToMCP(lightId: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(lightId, null, 2),
      },
    ],
  };
}

