import type { AsciiAnimOptions } from "./types";

export function buildScript(options: AsciiAnimOptions): string {
  const config = JSON.stringify(options);
  return String.raw`
(function () {
  if (window.__asciiAnimLoaded) return;
  window.__asciiAnimLoaded = true;

  const CFG = ${config};
  const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
  const yes = (v) => ["yes", "true", "si"].includes((v || "").toLowerCase());
  const cleanup = (fn) => { if (window.addCleanup) window.addCleanup(fn); };
  const lineLen = (f) => Math.max(...f.split("\n").map((l) => l.length));

  // Riduce il font finché la riga più larga sta nella larghezza disponibile
  function fitToWidth(el, widest, baseSize) {
    const keep = el.textContent;
    el.style.fontSize = baseSize;
    el.textContent = widest;
    const cs = getComputedStyle(el);
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const avail = el.clientWidth - pad;
    const needed = el.scrollWidth - pad;
    if (avail > 0 && needed > avail) {
      const base = parseFloat(cs.fontSize);
      el.style.fontSize = Math.max(3, (base * avail) / needed) + "px";
    }
    el.textContent = keep;
  }

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

      const bare = yes(settings.bare);
      const fit = yes(settings.fit);

      // size: percentuale della dimensione normale, tenuta tra 10 e 300
      const size = Number(settings.size);
      const baseSize = Number.isFinite(size) && size > 0
        ? Math.min(300, Math.max(10, size)) + "%"
        : "";

      const out = document.createElement("pre");
      out.className = bare ? "ascii-anim bare" : "ascii-anim";
      out.textContent = frames[0];
      if (baseSize) out.style.fontSize = baseSize;

      const pre = code.closest("pre");
      let target = pre;

      if (bare) {
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

      if (fit) {
        const widest = frames.reduce((a, b) => (lineLen(b) > lineLen(a) ? b : a), frames[0]);
        let lastW = 0;
        const ro = new ResizeObserver(() => {
          const w = out.clientWidth;
          if (w !== lastW) {
            lastW = w;
            fitToWidth(out, widest, baseSize);
          }
        });
        ro.observe(out);
        cleanup(() => ro.disconnect());
      }

      if (reduceMotion || frames.length < 2) return;

      let i = 0;
      const id = setInterval(() => {
        i = (i + 1) % frames.length;
        out.textContent = frames[i];
      }, 1000 / fps);
      cleanup(() => clearInterval(id));
    });
  }

  document.addEventListener("nav", run);
  run();
})();
`;
}