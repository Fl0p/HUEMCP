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

export function remapLightsToMCP(lights: HueLightsResponse) {
  const lightList = Object.entries(lights)
    .map(([id, light]) => `${id}: ${light.name} (${light.state.on ? "ON" : "OFF"})`)
    .join("\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Available lights:\n${lightList}`,
      },
    ],
  };
}

export function remapLightStateToMCP(lightId: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: `Light ${lightId} state updated successfully`,
      },
    ],
  };
}

