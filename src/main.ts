import { createScene } from "./scene";
import { createUi } from "./ui";

/* scene needs the UI to open projects; the UI needs the scene to focus cards */
let uiApi: ReturnType<typeof createUi> | null = null;
const scene = createScene(
  (index, el) => uiApi?.openProject(index, el),
  (index) => uiApi?.setActive(index),
);
uiApi = createUi({ setFocused: (i) => scene.setFocused(i), getCard: (i) => scene.getCard(i) });

/* ---------- splash → reveal ---------- */
const splash = document.getElementById("splash")!;
const intro = document.getElementById("intro")!;

const fontsReady: Promise<unknown> = Promise.race([
  document.fonts.ready,
  new Promise((r) => window.setTimeout(r, 4000)),
]);
const minimum = new Promise((r) => window.setTimeout(r, 1100));
const backstop = new Promise((r) => window.setTimeout(r, 5000));

function reveal() {
  document.body.classList.add("revealed");
  scene.reveal();
  splash.classList.add("gone");
  intro.classList.add("gone");
  window.setTimeout(() => {
    splash.style.display = "none";
    intro.style.display = "none";
  }, 1100);
}

Promise.race([Promise.all([fontsReady, minimum]), backstop]).then(reveal);

/* ---------- resize / orientation ---------- */
let lastW = window.innerWidth;
let lastH = window.innerHeight;
let orientTimer: number | undefined;

function maybeResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // ignore tiny changes and single-axis churn (mobile browser UI, scrollbars)
  if (Math.abs(w - lastW) < 20 || Math.abs(h - lastH) < 20) return;
  lastW = w;
  lastH = h;
  scene.layout();
}

window.addEventListener("resize", maybeResize);
window.addEventListener("orientationchange", () => {
  window.clearTimeout(orientTimer);
  orientTimer = window.setTimeout(maybeResize, 220);
});

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", maybeResize);
  window.visualViewport.addEventListener("scroll", maybeResize);
}
