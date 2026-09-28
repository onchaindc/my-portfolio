import { PROJECTS } from "./projects";
import { motifSVG } from "./motifs";

export interface UiApi {
  openProject(index: number, source: HTMLElement | null): void;
  setActive(index: number | null): void;
}

const ABOUT_HTML = `
  <p class="p-eyebrow">Developer</p>
  <h2 id="panelTitle">Abdulsamad Ilias</h2>
  <p class="p-lead">Developer building full-stack, Web3 and AI products.</p>
  <p class="p-lead">I build products from the interface down to the underlying systems, with a focus on turning ambitious ideas into working software.</p>
  <button class="p-close" type="button">Close</button>`;

const STACK_HTML = `
  <p class="p-eyebrow">Abdulsamad Ilias</p>
  <h2 id="panelTitle">Stack</h2>
  <ul class="p-list">
    <li>TypeScript</li>
    <li>React</li>
    <li>Next.js</li>
    <li>Supabase</li>
    <li>PostgreSQL</li>
    <li>Web3</li>
    <li>Nimiq</li>
    <li>GenLayer</li>
    <li>AI</li>
  </ul>
  <button class="p-close" type="button">Close</button>`;

const CONTACT_HTML = `
  <p class="p-eyebrow">Contact</p>
  <h2 id="panelTitle">Abdulsamad Ilias</h2>
  <p class="p-lead">Developer — Full-stack · Web3 · AI.</p>
  <p class="p-lead">For enquiries, reach out through the profile or channel that brought you here.</p>
  <button class="p-close" type="button">Close</button>`;

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setInert(el: HTMLElement, on: boolean) {
  if (on) el.setAttribute("inert", "");
  else el.removeAttribute("inert");
}

function fallbackRect(): DOMRect {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return new DOMRect(w / 2 - 40, h / 2 - 40, 80, 80);
}

function rectOf(el: HTMLElement | null): DOMRect {
  if (!el || !el.isConnected) return fallbackRect();
  return el.getBoundingClientRect();
}

export function createUi(deps: {
  setFocused(index: number | null): void;
  getCard(index: number): HTMLElement | null;
}): UiApi {
  const body = document.body;
  const stage = document.getElementById("stage")!;
  const hdr = document.getElementById("hdr")!;
  const menuEl = document.getElementById("menu")!;
  const menuBtn = document.getElementById("menuBtn") as HTMLButtonElement;
  const gridEl = document.getElementById("grid")!;
  const gridBtn = document.getElementById("gridBtn") as HTMLButtonElement;
  const litEl = document.getElementById("lit")!;
  const plate = document.getElementById("plate")!;
  const plateArt = document.getElementById("plateArt")!;
  const litNum = document.getElementById("litNum")!;
  const litTitle = document.getElementById("litTitle")!;
  const litCat = document.getElementById("litCat")!;
  const litDesc = document.getElementById("litDesc")!;
  const litTech = document.getElementById("litTech")!;
  const litClose = document.getElementById("litClose") as HTMLButtonElement;
  const panelEl = document.getElementById("panel")!;
  const panelInner = document.getElementById("panelInner")!;

  /* active-project caption (bottom-left) */
  const fIdle = document.querySelector<HTMLElement>(".f-idle")!;
  const fActive = document.querySelector<HTMLElement>(".f-active")!;
  const fNum = document.querySelector<HTMLElement>(".f-num")!;
  const fName = document.querySelector<HTMLElement>(".f-name")!;
  const fCat = document.querySelector<HTMLElement>(".f-cat")!;
  const fDesc = document.querySelector<HTMLElement>(".f-desc")!;
  const fView = document.querySelector<HTMLButtonElement>(".f-view")!;

  let menuOpen = false;
  let gridOpen = false;
  let litOpen = false;
  let litClosing = false;
  let panelOpen = false;
  let litSource: HTMLElement | null = null;
  let activeIndex: number | null = null;

  /* ---------- focus / inert management ---------- */
  function syncInert() {
    const overlay = litOpen || menuOpen || panelOpen;
    setInert(stage, overlay || gridOpen);
    setInert(gridEl, overlay || !gridOpen);
    setInert(hdr, overlay);
    setInert(gridBtn, overlay);
    setInert(menuEl, !menuOpen);
  }

  function markDeep() {
    body.classList.add("deep");
  }

  /* ---------- active project caption ---------- */
  function setActive(index: number | null) {
    activeIndex = index;
    if (index === null || !PROJECTS[index]) {
      fActive.hidden = true;
      fIdle.hidden = false;
      body.classList.remove("focused");
      return;
    }
    const p = PROJECTS[index];
    fNum.textContent = String(index + 1).padStart(2, "0");
    fName.textContent = p.title;
    fCat.textContent = p.category;
    fDesc.textContent = p.description;
    fIdle.hidden = true;
    fActive.hidden = false;
    body.classList.add("focused");
  }

  fView.addEventListener("click", () => {
    if (activeIndex === null) return;
    openProject(activeIndex, deps.getCard(activeIndex));
  });

  /* ---------- flat archive ---------- */
  const gwrap = document.createElement("div");
  gwrap.className = "gwrap";
  gridEl.appendChild(gwrap);

  PROJECTS.forEach((p, i) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "g-item";
    item.dataset.index = String(i);
    item.setAttribute("aria-label", `Open project ${p.title}`);
    item.style.setProperty("--i", String(i));
    item.innerHTML = `
      <span class="g-art" aria-hidden="true">${motifSVG(p.motif)}<span class="g-num">${String(i + 1).padStart(2, "0")}</span></span>
      <span class="g-cap"><span class="gt">${p.title}</span><span class="gc">${p.category}</span></span>`;
    item.addEventListener("click", () => openProject(i, item));
    gwrap.appendChild(item);
  });

  function setGrid(open: boolean) {
    if (gridOpen === open) return;
    gridOpen = open;
    body.classList.toggle("gridview", open);
    gridBtn.setAttribute("aria-pressed", String(open));
    if (open) {
      markDeep();
      syncInert();
      gridBtn.focus({ preventScroll: true });
    } else {
      syncInert();
    }
  }

  gridBtn.addEventListener("click", () => setGrid(!gridOpen));

  /* ---------- fullscreen menu ---------- */
  function setMenu(open: boolean) {
    if (menuOpen === open) return;
    menuOpen = open;
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    syncInert();
    if (open) {
      const first = menuEl.querySelector<HTMLButtonElement>(".m-link");
      first?.focus({ preventScroll: true });
    } else {
      menuBtn.focus({ preventScroll: true });
    }
  }

  menuBtn.addEventListener("click", () => setMenu(!menuOpen));

  menuEl.querySelectorAll<HTMLButtonElement>(".m-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      setMenu(false);
      if (action === "work") setGrid(true);
      else if (action === "about") openPanel(ABOUT_HTML);
      else if (action === "stack") openPanel(STACK_HTML);
      else if (action === "contact") openPanel(CONTACT_HTML);
    });
  });

  /* ---------- about / stack / contact panel ---------- */
  function openPanel(html: string) {
    if (panelOpen) {
      panelInner.innerHTML = html;
      wirePanelClose();
      return;
    }
    panelInner.innerHTML = html;
    wirePanelClose();
    panelEl.hidden = false;
    void panelEl.offsetWidth;
    panelOpen = true;
    body.classList.add("panel-open");
    markDeep();
    syncInert();
    panelInner.querySelector<HTMLButtonElement>(".p-close")?.focus({
      preventScroll: true,
    });
  }

  function wirePanelClose() {
    panelInner
      .querySelector<HTMLButtonElement>(".p-close")
      ?.addEventListener("click", closePanel);
  }

  function closePanel() {
    if (!panelOpen) return;
    panelOpen = false;
    body.classList.remove("panel-open");
    syncInert();
    menuBtn.focus({ preventScroll: true });
    const ms = reduced() ? 200 : 520;
    window.setTimeout(() => {
      if (!panelOpen) panelEl.hidden = true;
    }, ms);
  }

  panelEl.addEventListener("click", (e) => {
    if (e.target === panelEl) closePanel();
  });

  /* ---------- lightbox with FLIP ---------- */
  function openProject(index: number, source: HTMLElement | null) {
    if (litOpen || litClosing) return;
    const p = PROJECTS[index];
    if (!p) return;

    litOpen = true;
    litSource = source;
    deps.setFocused(index);
    body.classList.add("lit");
    markDeep();

    plateArt.innerHTML = motifSVG(p.motif);
    litNum.textContent = `Project ${String(index + 1).padStart(2, "0")}`;
    litTitle.textContent = p.title;
    litCat.textContent = p.category;
    litDesc.textContent = p.description;
    litTech.innerHTML = "";
    for (const t of p.techs ?? []) {
      const li = document.createElement("li");
      li.textContent = t;
      litTech.appendChild(li);
    }

    litEl.hidden = false;
    syncInert();

    // FLIP: card rect → centered plate
    const dst = plate.getBoundingClientRect();
    const src = rectOf(source);
    const s = Math.max(0.04, src.width / Math.max(dst.width, 1));
    const scx = src.left + src.width / 2;
    const scy = src.top + src.height / 2;
    const dcx = dst.left + dst.width / 2;
    const dcy = dst.top + dst.height / 2;

    plate.classList.remove("anim");
    litEl.style.opacity = "0";
    plate.style.transform = `translate(${scx - dcx * s}px, ${scy - dcy * s}px) scale(${s})`;
    void plate.offsetWidth; // commit the first frame
    plate.classList.add("anim");
    litEl.style.opacity = "1";
    plate.style.transform = "";
    litClose.focus({ preventScroll: true });
  }

  function closeProject() {
    if (!litOpen || litClosing) return;
    litClosing = true;

    // restore the focused card first, then measure its current position
    deps.setFocused(null);

    const src = plate.getBoundingClientRect();
    const dst = rectOf(litSource);
    const s = Math.max(0.04, dst.width / Math.max(src.width, 1));
    const scx = dst.left + dst.width / 2;
    const scy = dst.top + dst.height / 2;
    const pcx = src.left + src.width / 2;
    const pcy = src.top + src.height / 2;

    plate.classList.add("anim");
    plate.style.transform = `translate(${scx - pcx * s}px, ${scy - pcy * s}px) scale(${s})`;
    litEl.style.opacity = "0";

    const ms = reduced() ? 180 : 640;
    window.setTimeout(() => {
      litEl.hidden = true;
      litEl.style.opacity = "";
      plate.classList.remove("anim");
      plate.style.transform = "";
      litOpen = false;
      litClosing = false;
      body.classList.remove("lit");
      syncInert();
      const back = litSource;
      litSource = null;
      if (back?.isConnected) back.focus({ preventScroll: true });
      else menuBtn.focus({ preventScroll: true });
    }, ms);
  }

  litClose.addEventListener("click", closeProject);
  litEl.addEventListener("click", (e) => {
    if (e.target === litEl) closeProject();
  });

  /* ---------- Escape: lightbox → menu → grid → panel ---------- */
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (litOpen) {
        closeProject();
        return;
      }
      if (menuOpen) {
        setMenu(false);
        return;
      }
      if (gridOpen) {
        setGrid(false);
        return;
      }
      if (panelOpen) {
        closePanel();
        return;
      }
      return;
    }

    if (e.key === "Tab") {
      const dialog: HTMLElement | null = litOpen
        ? plate
        : panelOpen
          ? panelEl
          : null;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? dialog.contains(active) : false;
      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------- custom cursor (fine pointers only) — a quiet dot ---------- */
  const cursor = document.getElementById("cursor")!;
  if (window.matchMedia("(pointer: fine)").matches) {
    let x = -60;
    let y = -60;
    let tx = -60;
    let ty = -60;
    let on = false;

    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return;
        tx = e.clientX;
        ty = e.clientY;
        if (!on) {
          on = true;
          body.classList.add("cursor-on");
          x = tx;
          y = ty;
        }
        const t = e.target as HTMLElement | null;
        cursor.classList.toggle("hot", !!(t?.closest?.("button, a, .card")));
      },
      { passive: true },
    );

    document.documentElement.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });
    document.documentElement.addEventListener("mouseenter", () => {
      if (on) cursor.style.opacity = "";
    });

    const tick = () => {
      x += (tx - x) * 0.55;
      y += (ty - y) * 0.55;
      // snap to target under 0.1px so the dot settles without residual drift
      if (Math.abs(tx - x) < 0.1) x = tx;
      if (Math.abs(ty - y) < 0.1) y = ty;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  syncInert();

  return { openProject, setActive };
}
