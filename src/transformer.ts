import type { QuartzTransformerPlugin, BuildCtx } from "@quartz-community/types";
import type { AsciiAnimOptions } from "./types";
import { buildScript } from "./script";

const defaultOptions: AsciiAnimOptions = {
  fpsMin: 1,
  fpsMax: 30,
  fpsDefault: 4,
  maxFrames: 100,
};

// Stile di default: bassa specificità, così si può sovrascrivere da custom.scss
const style = `
.ascii-anim {
  font-family: var(--codeFont, monospace);
  font-variant-ligatures: none;
  line-height: 1.2;
  white-space: pre;
  overflow-x: auto;
  margin: 0;
  padding: 0.5rem 0.75rem;
}
.ascii-anim.bare {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
}
`;

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
        css: [{ content: style, inline: true }],
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