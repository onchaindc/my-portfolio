import { PROJECTS } from "./projects";
import { motifSVG } from "./motifs";

const ROT = 0.13; // degrees per pointer pixel
const TILT = -4;
const PITCH = 32;
const ROLL = 4.5; // subtle world roll while dragging — physical, not showy
const AMBIENT = 1.15; // deg per second — the constellation never fully rests

interface CardState {
  el: HTMLButtonElement;
  /** unit position on the sphere */
  ux: number;
  uy: number;
  uz: number;
  /** outward-facing card orientation (degrees) */
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

export function createScene(
  onOpen: (index: number, el: HTMLElement) => void,
  onActive?: (index: number | null) => void,
): SceneApi {
  const root = document.documentElement;
  const body = document.body;
  const stage = document.getElementById("stage")!;
  const world = document.getElementById("world")!;
  const orb = document.getElementById("orb")!;
  const headline = document.getElementById("headline")!;

  /* ---------- landing statement, word by word (claim only — eyebrow and hint stay) ---------- */
  const claim = headline.querySelector(".hl-claim")!;
  const words = "DC’s Lab".split(" ");
  claim.innerHTML = words
    .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`)
    .join(" ");

  /* ---------- Fibonacci sphere layout ----------
   * The original arrangement: cards distributed evenly across a sphere,
   * each facing outward from its surface point.
   */
  const cards: CardState[] = [];
  const N = PROJECTS.length;
  const GA = Math.PI * (3 - Math.sqrt(5));
  let hoverIndex: number | null = null;

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
    el.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch") return;
      hoverIndex = i;
    });
    el.addEventListener("pointerleave", () => {
      if (hoverIndex === i) hoverIndex = null;
    });
    orb.appendChild(el);

    cards.push({ el, ux: x, uy: y, uz: z, lat, lon });
  });

  /* ---------- layout metrics ---------- */
  let R = 240;
  let cw = 200;
  let wWorld = 0; // px offset of the constellation centre from screen centre
  let hWorld = 0;

  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let hr: number, wr: number, floor: number, scale: number, persp: number;

    if (w <= 380) {
      hr = 0.42;
      wr = 0.52;
      floor = 120;
      scale = 0.5;
      persp = 700;
    } else if (w <= 640) {
      hr = 0.44;
      wr = 0.56;
      floor = 132;
      scale = 0.52;
      persp = 820;
    } else {
      hr = 0.46;
      wr = 0.58;
      floor = 165;
      scale = 0.46;
      persp = w <= 900 ? 980 : 1150;
    }

    R = Math.max(floor, Math.min(520, h * hr, w * wr));
    cw = Math.round(Math.max(96, R * scale));

    // constellation is centred — cards surround the statement on all sides
    wWorld = 0;
    hWorld = 0;

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

  // pointer parallax (normalized -1..1, eased)
  let mx = 0;
  let my = 0;
  let mxT = 0;
  let myT = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      mxT = (e.clientX / window.innerWidth - 0.5) * 2;
      myT = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  // scroll sequence position (eased)
  let seqPos = 0;
  let lastActive: number | null = -1; // sentinel: forces the first emit

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

  /* ---------- ambient drift ---------- */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastT = 0;

  /* ---------- the loop ---------- */
  function frame(t: number) {
    const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016);
    lastT = t;

    // slow continuous orbit — yields the moment the user takes hold,
    // and holds still while a card is being inspected
    if (!reducedMotion && !dragging && focused === null && hoverIndex === null) {
      dragX += AMBIENT * dt;
    }

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

    // pointer parallax easing
    mx += (mxT - mx) * 0.045;
    my += (myT - my) * 0.045;

    // scroll dolly + sequence focus
    const maxScroll = Math.max(1, window.innerHeight * 0.16);
    const p = clamp(window.scrollY / maxScroll, 0, 1);
    const camZTarget = p * Math.min(64, R * 0.12);
    camZ += (camZTarget - camZ) * 0.075;

    // which project is "current" per scroll progress (0..1 → 0..N-1)
    const sequencing = p > 0.04;
    const target = p * (N - 1);
    seqPos += (target - seqPos) * (dragging ? 0.04 : 0.08);
    const near = clamp(Math.round(seqPos), 0, N - 1);
    const effective = hoverIndex ?? (sequencing && focused === null ? near : null);
    if (effective !== lastActive) {
      lastActive = effective;
      onActive?.(effective);
    }

    const sx = TILT + dragY + my * 1.4;
    const sy = spin + dragX + mx * 2.2;
    const roll = dragging ? clamp(velX * 0.55, -ROLL, ROLL) : 0;

    // world: constellation offset → dolly → drag rotation → parallax
    world.style.transform = `translate3d(${(wWorld - mx * 26).toFixed(2)}px, ${(hWorld - my * 18).toFixed(2)}px, ${camZ.toFixed(2)}px) rotateY(${sy.toFixed(3)}deg) rotateX(${sx.toFixed(3)}deg) rotateZ(${roll.toFixed(3)}deg)`;

    // statement counter-rotation — rightmost translateZ applies first
    headline.style.transform = `rotateX(${(-sx).toFixed(3)}deg) rotateY(${(-sy).toFixed(3)}deg) translateZ(${(R * 0.62).toFixed(2)}px)`;
    headline.style.opacity = String(Math.max(0, 1 - p * 0.5));

    // scene alpha (splash → reveal)
    if (revealed && alpha < 1) {
      alpha = Math.min(1, alpha + (1 - alpha) * 0.06 + 0.004);
    }

    // immersion state: hide the big identity + cue while actively orbiting
    // (ambient drift is excluded on purpose — it must never dim the identity)
    const speed = Math.abs(velX) + Math.abs(velY);
    body.classList.toggle("deep", dragging || speed > 0.05 || focused !== null);

    // depth shading per card — constellation z + scroll focus
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

      // the sequenced/hovered project comes forward, the rest recede slightly
      const d = Math.abs(i - seqPos);
      const boost = sequencing ? clamp(1 - d * 0.32, 0.72, 1) : 1;
      const t = clamp((z2 + 1) * 0.5 * boost, 0, 1);

      let op = (0.6 + 0.4 * t) * alpha; // readable floor — cards stay visible
      let wash = (1 - t) * 0.45;

      if (focused !== null) {
        if (i === focused) {
          op = 0;
        } else {
          op = op * 0.4;
          wash = Math.min(0.75, wash + 0.2);
        }
      }
      c.el.style.opacity = op.toFixed(3);
      c.el.style.setProperty("--wash", wash.toFixed(3));
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
