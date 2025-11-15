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
  const lightList = Object.entries(lights)
    .map(([id, light]) => {
      const state = light.state;
      let info = `ID: ${id}\nName: ${light.name}\nType: ${light.type}\nModel: ${light.modelid}\n`;
      info += `Status: ${state.on ? "ON" : "OFF"}\n`;
      info += `Reachable: ${state.reachable ? "Yes" : "No"}\n`;
      
      if (state.bri !== undefined) info += `Brightness: ${state.bri}/254\n`;
      if (state.hue !== undefined) info += `Hue: ${state.hue}/65535\n`;
      if (state.sat !== undefined) info += `Saturation: ${state.sat}/254\n`;
      if (state.ct !== undefined) info += `Color Temperature: ${state.ct}\n`;
      if (state.colormode) info += `Color Mode: ${state.colormode}\n`;
      if (state.effect) info += `Effect: ${state.effect}\n`;
      if (state.xy) info += `XY: [${state.xy[0].toFixed(4)}, ${state.xy[1].toFixed(4)}]\n`;
      
      if (light.capabilities?.control) {
        const ctrl = light.capabilities.control;
        if (ctrl.maxlumen) info += `Max Lumen: ${ctrl.maxlumen}\n`;
        if (ctrl.ct) info += `CT Range: ${ctrl.ct.min}-${ctrl.ct.max}\n`;
        if (ctrl.colorgamuttype) info += `Color Gamut: ${ctrl.colorgamuttype}\n`;
      }
      
      return info;
    })
    .join("\n---\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Available lights:\n\n${lightList}`,
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

