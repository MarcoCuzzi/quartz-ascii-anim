import type { QuartzTransformerPlugin, BuildCtx } from "@quartz-community/types";
import type { AsciiAnimOptions } from "./types";
import { buildScript } from "./script";

const defaultOptions: AsciiAnimOptions = {
  fpsMin: 1,
  fpsMax: 30,
  fpsDefault: 4,
  maxFrames: 100,
};

export const AsciiAnim: QuartzTransformerPlugin<Partial<AsciiAnimOptions>> = (userOptions) => {
  const options = { ...defaultOptions, ...userOptions };
  return {
    name: "AsciiAnim",
    // Metodi vuoti: Quartz richiede almeno uno di questi per accettare il transformer
    textTransform(_ctx: BuildCtx, src: string) {
      return src;
    },
    markdownPlugins() {
      return [];
    },
    htmlPlugins() {
      return [];
    },
    externalResources() {
      return {
        js: [
          {
            contentType: "inline",
            loadTime: "afterDOMReady",
            script: buildScript(options),
          },
        ],
      };
    },
  };
};