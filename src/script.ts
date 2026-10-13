import type { AsciiAnimOptions } from "./types";

export function buildScript(options: AsciiAnimOptions): string {
  const config = JSON.stringify(options);
  return String.raw`
(function () {
  if (window.__asciiAnimLoaded) return;
  window.__asciiAnimLoaded = true;

  const CFG = ${config};
  const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

  function run() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll("pre code").forEach((code) => {
      const text = code.innerText || "";

      // Parola di controllo: la prima riga deve essere "animation"
      const firstLine = text.trim().split("\n")[0].trim();
      if (firstLine !== "animation") return;

      const [head, ...raw] = text.split("<frame>");
      const frames = raw
        .map((f) => f.replace(/^\n+|\n+$/g, ""))
        .slice(0, CFG.maxFrames);
      if (frames.length === 0) return;

      const settings = {};
      head.split("\n").forEach((line) => {
        const [k, v] = line.split(":");
        if (k && v) settings[k.trim()] = v.trim();
      });

      let fps = Number(settings.fps);
      if (!Number.isFinite(fps)) fps = CFG.fpsDefault;
      fps = Math.min(CFG.fpsMax, Math.max(CFG.fpsMin, fps));

      const bare = ["yes", "true", "si"].includes((settings.bare || "").toLowerCase());

      const out = document.createElement("pre");
      out.className = bare ? "ascii-anim bare" : "ascii-anim";
      out.textContent = frames[0];

      const pre = code.closest("pre");
      let target = pre;

      if (bare) {
        // Nessun riquadro, bordo o sfondo attorno al disegno
        out.style.border = "none";
        out.style.background = "none";
        out.style.padding = "0";
        out.style.margin = "0";

        const fig = pre.closest("figure") || pre;
        const parent = fig.parentElement;
        const onlyTransclusion =
          parent &&
          parent.querySelector("a.transclude-src") &&
          Array.from(parent.children).every(
            (c) => c === fig || isHeading(c) || c.matches("a.transclude-src")
          );

        if (onlyTransclusion) {
          // Il contenitore ha solo titolo, disegno e link: lo sostituisco tutto
          target = parent;
        } else {
          // Nessun contenitore dedicato: tolgo solo titolo e link adiacenti
          const prev = fig.previousElementSibling;
          if (prev && isHeading(prev)) prev.remove();
          const next = fig.nextElementSibling;
          if (next && next.matches("a.transclude-src")) next.remove();
          target = fig;
        }
      }

      target.replaceWith(out);

      if (reduceMotion || frames.length < 2) return;

      let i = 0;
      const id = setInterval(() => {
        i = (i + 1) % frames.length;
        out.textContent = frames[i];
      }, 1000 / fps);
      if (window.addCleanup) window.addCleanup(() => clearInterval(id));
    });
  }

  document.addEventListener("nav", run);
  run();
})();
`;
}