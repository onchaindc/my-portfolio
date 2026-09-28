import { PROJECTS } from "./projects";
import { motifSVG } from "./motifs";

const ROT = 0.13; // degrees per pointer pixel
const TILT = -4;
const PITCH = 32;

interface CardState {
  el: HTMLButtonElement;
  ux: number;
  uy: number;
  uz: number;
  lat: number;
  lon: number;
}

export interface SceneApi {
  layout(): void;
  reveal(): void;
  setFocused(index: number | null): void;
  getCard(index: number): HTMLElement | null;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function createScene(onOpen: (index: number, el: HTMLElement) => void): SceneApi {
  const root = document.documentElement;
  const body = document.body;
  const stage = document.getElementById("stage")!;
  const world = document.getElementById("world")!;
  const orb = document.getElementById("orb")!;
  const headline = document.getElementById("headline")!;
  const inner = headline.querySelector(".inner")!;

  /* ---------- central statement, word by word ---------- */
  const words = "I build things that work.".split(" ");
  inner.innerHTML = words
    .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`)
    .join(" ");

  /* ---------- build cards on the Fibonacci sphere ---------- */
  const cards: CardState[] = [];
  const N = PROJECTS.length;
  const GA = Math.PI * (3 - Math.sqrt(5));

  PROJECTS.forEach((p, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GA;
    const x = Math.cos(theta) * rad;
    const z = Math.sin(theta) * rad;
    const lat = (Math.asin(clamp(y, -1, 1)) * 180) / Math.PI;
    const lon = (Math.atan2(x, z) * 180) / Math.PI;

    const el = document.createElement("button");
    el.type = "button";
    el.className = "card";
    el.dataset.index = String(i);
    el.setAttribute("aria-label", `Open project ${p.title}`);
    el.style.setProperty("--wash", "0");
    el.innerHTML = `
      <span class="plate">
        <span class="art" aria-hidden="true">${motifSVG(p.motif)}</span>
        <span class="num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <span class="cap">
          <span class="ct">${p.title}</span>
          <span class="cc">${p.category}</span>
        </span>
        <span class="wash" aria-hidden="true"></span>
      </span>`;
    orb.appendChild(el);

    cards.push({ el, ux: x, uy: y, uz: z, lat, lon });
  });

  /* ---------- layout metrics ---------- */
  let R = 200;
  let cw = 160;

  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let hr: number, wr: number, floor: number, scale: number, persp: number;

    if (w <= 380) {
      hr = 0.38;
      wr = 0.48;
      floor = 108;
      scale = 0.44;
      persp = 620;
    } else if (w <= 640) {
      hr = 0.42;
      wr = 0.52;
      floor = 120;
      scale = 0.46;
      persp = 760;
    } else {
      hr = 0.46;
      wr = 0.58;
      floor = 155;
      scale = 0.47;
      persp = w <= 900 ? 920 : 1150;
    }

    R = Math.max(floor, Math.min(480, h * hr, w * wr));
    cw = Math.round(Math.max(72, R * scale));

    root.style.setProperty("--persp", `${persp}px`);
    root.style.setProperty("--cw", `${cw}px`);

    for (const c of cards) {
      c.el.style.transform = cardBase(c);
    }
  }

  function cardBase(c: CardState): string {
    const x = (c.ux * R).toFixed(2);
    const y = (-c.uy * R).toFixed(2);
    const z = (c.uz * R).toFixed(2);
    return `translate3d(${x}px, ${y}px, ${z}px) rotateY(${c.lon.toFixed(2)}deg) rotateX(${c.lat.toFixed(2)}deg)`;
  }

  layout();

  /* ---------- camera state ---------- */
  let spin = 0;
  let dragX = 0;
  let dragY = 0;
  let velX = 0;
  let velY = 0;
  let camZ = 0;
  let focused: number | null = null;
  let revealed = false;
  let alpha = 0;

  /* ---------- pointer input ---------- */
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const SLOP = coarse ? 14 : 6;

  let pointerId: number | null = null;
  let dragging = false;
  let cancelled = false;
  let downX = 0;
  let downY = 0;
  let lastX = 0;
  let lastY = 0;
  let moved = 0;
  let downCard: HTMLButtonElement | null = null;

  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerId = e.pointerId;
    // remember the card underneath the pointer (capture can retarget the click)
    const dt = e.target as HTMLElement | null;
    downCard = (dt?.closest?.(".card") as HTMLButtonElement | null) ?? null;
    downX = lastX = e.clientX;
    downY = lastY = e.clientY;
    moved = 0;
    cancelled = false;
    dragging = e.pointerType !== "touch";
    if (dragging) {
      velX = 0;
      velY = 0;
      stage.setPointerCapture(e.pointerId);
    }
  });

  stage.addEventListener("pointermove", (e) => {
    if (pointerId === null || e.pointerId !== pointerId) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const tx = e.clientX - downX;
    const ty = e.clientY - downY;
    const dist = Math.hypot(tx, ty);
    if (dist > moved) moved = dist;

    if (cancelled) return;

    if (!dragging) {
      if (dist <= 10) return;
      if (Math.abs(ty) > Math.abs(tx) * 1.15) {
        cancelled = true; // let the page scroll natively
        return;
      }
      dragging = true;
      stage.setPointerCapture(e.pointerId);
      lastX = e.clientX;
      lastY = e.clientY;
    }

    dragX += dx * ROT;
    velX = dx * ROT;
    dragY -= dy * ROT;
    velY = -dy * ROT;
    lastX = e.clientX;
    lastY = e.clientY;

    if (moved > 50) body.classList.add("deep");
    e.preventDefault();
  });

  const endPointer = (e: PointerEvent) => {
    if (pointerId === null || e.pointerId !== pointerId) return;
    if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    pointerId = null;
    dragging = false;
  };
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  stage.addEventListener("click", (e) => {
    // keyboard-activated clicks (detail 0) always open; drags never do
    if (e.detail !== 0 && moved > SLOP) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const target = e.target as HTMLElement | null;
    const card =
      (target?.closest?.(".card") as HTMLButtonElement | null) ?? downCard;
    if (!card) return;
    const idx = Number(card.dataset.index);
    if (Number.isNaN(idx)) return;
    onOpen(idx, card);
  });

  /* ---------- the loop ---------- */
  function frame() {
    // momentum
    if (!dragging && focused === null) {
      dragX += velX;
      dragY += velY;
    }
    velX *= 0.94;
    velY *= 0.94;
    if (Math.abs(velX) < 0.002) velX = 0;
    if (Math.abs(velY) < 0.002) velY = 0;

    // pitch clamp so tilt + dragY stays within ±32°
    const lo = -PITCH - TILT;
    const hi = PITCH - TILT;
    if (dragY < lo) {
      dragY = lo;
      if (velY < 0) velY = 0;
    } else if (dragY > hi) {
      dragY = hi;
      if (velY > 0) velY = 0;
    }

    // scroll dolly
    const p = clamp(window.scrollY / (window.innerHeight * 0.16), 0, 1);
    const camZTarget = p * Math.min(64, R * 0.12);
    camZ += (camZTarget - camZ) * 0.075;

    const sx = TILT + dragY;
    const sy = spin + dragX;

    // world: translateZ then rotateY then rotateX
    world.style.transform = `translateZ(${camZ.toFixed(2)}px) rotateY(${sy.toFixed(3)}deg) rotateX(${sx.toFixed(3)}deg)`;

    // headline counter-rotation — rightmost translateZ applies first
    headline.style.transform = `rotateX(${(-sx).toFixed(3)}deg) rotateY(${(-sy).toFixed(3)}deg) translateZ(${(R * 0.62).toFixed(2)}px)`;
    headline.style.opacity = String(Math.max(0, 1 - p * 0.55));

    // scene alpha (splash → reveal)
    if (revealed && alpha < 1) {
      alpha = Math.min(1, alpha + (1 - alpha) * 0.06 + 0.004);
    }

    // depth shading per card
    const A = (sy * Math.PI) / 180;
    const B = (sx * Math.PI) / 180;
    const sa = Math.sin(A);
    const ca = Math.cos(A);
    const sb = Math.sin(B);
    const cb = Math.cos(B);

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const z1 = c.uy * sb + c.uz * cb; // rotateX first
      const z2 = -c.ux * sa + z1 * ca; // then rotateY
      const t = (z2 + 1) * 0.5; // 0 = far, 1 = near
      let op = (0.45 + 0.55 * t) * alpha;
      if (focused !== null) op = i === focused ? 0 : op * 0.45;
      c.el.style.opacity = op.toFixed(3);
      c.el.style.setProperty("--wash", ((1 - t) * 0.42).toFixed(3));
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    layout,
    reveal() {
      revealed = true;
    },
    setFocused(index: number | null) {
      focused = index;
    },
    getCard(index: number) {
      return cards[index]?.el ?? null;
    },
  };
}
