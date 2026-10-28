// Builds the isometric desk figure on the landing page.
// node scripts/desk-figure/build.mjs            -> src/components/DeskFigure.astro
// node scripts/desk-figure/build.mjs --preview  -> also writes standalone preview pages to --out <dir>
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const WIDTH = 640;
const HEIGHT = 420;

// Desk: a top on four legs, an apron under the top and one drawer in its front.
const DESK = { x: -150, y: -62, w: 300, d: 124, r: 3 };
const TOP_Z = 100;
const TOP_H = 5;
const UNDER = TOP_Z - TOP_H;
const GLIDE_H = 2;
const LEG = 7;
const LEG_INSET = 6;
const APRON = k.insetPlan({ ...DESK, r: 0 }, 9);
const APRON_Z = 82;
const FRONT_FACE = APRON.y + APRON.d;
const DRAWER = { x0: 24, x1: 112, z0: 84.5, z1: 93 };

// Monitor: a foot, a neck and a thin panel with its screen facing +y.
const BASE = { x: -28, y: -50, w: 56, d: 30, r: 8 };
const BASE_H = 2.5;
const NECK = { x: -6, y: -45, w: 12, d: 6, r: 2 };
const PANEL = { x: -72, y: -39, w: 144, d: 5, r: 1.5 };
const PANEL_Z0 = 116;
const PANEL_Z1 = 198;
const GLASS_Y = PANEL.y + PANEL.d;
const SCREEN = { x0: -68, x1: 68, z0: 124, z1: 194, r: 1, depth: 0.8 };

// Keyboard: 61 keys on a low case in front of the monitor.
const KB = { x: -56, y: 6, w: 112, d: 40, r: 3 };
const KB_H = 3.4;
const U = 6.6;
const KEYS_X = -U * 7.5;
const KEYS_Y = KB.y + 3.5;
const ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
  [1.5, 1.5, 9, 1.5, 1.5],
];
const ROW_H = [2.6, 2.4, 2.2, 2, 1.8];

// Plant: a snake plant in a tapered pot on a saucer, back left on the desk.
const POT = { x: -114, y: -30 };
const SAUCER = { r: 16.5, h: 2.4 };
const POT_PROFILE = [[0, 10.5], [19, 13.2], [19, 14.8], [24, 14.8]];
const POT_TOP = TOP_Z + SAUCER.h + 24;
const SOIL_R = 13;

const P = k.fitProjection(
  [
    ...k.boxCorners(DESK, 0, TOP_Z),
    ...k.boxCorners(PANEL, PANEL_Z0, PANEL_Z1),
    [POT.x, POT.y, POT_TOP + 64],
  ],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 62 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const planeOf = (y) => k.sideMatrix([0, y], 0, P, "left");
const flat = (x0, z0, x1, z1, r, steps = 6) =>
  k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);
const byDepth = (items, key) => [...items].sort((a, b) => k.depthOf(key(a), P) - k.depthOf(key(b), P));

// A rounded opening sunk into a face at constant y, with its walls drawn and
// `back` drawn in the plane of its floor (from the anatomy desk-computer example).
let clips = 0;
function recess({ x0, x1, z0, z1, r, depth }, y, back = "", backClass = "dk-well") {
  const id = `dk-clip-${clips++}`;
  const ring = k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 6);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const { sinA } = k.cameraOf(P);
  const tops = [];
  const sides = [[], [], [], []];
  ring.forEach(([ax, az], index) => {
    const [bx, bz] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bx - ax, bz - az) || 1;
    let [nx, nz] = [(bz - az) / length, -(bx - ax) / length];
    if (nx * (cx - (ax + bx) / 2) + nz * (cz - (az + bz) / 2) < 0) [nx, nz] = [-nx, -nz];
    if (nx <= 0 && nz <= 0) return;
    const quad = k.pathOf([at([ax, y, az]), at([bx, y, bz]), at([bx, y - depth, bz]), at([ax, y - depth, az])], true);
    if (nz >= nx) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((nx * -sinA + 1) / 2) * 4)))].push(quad);
  });
  const shape = flat(x0, z0, x1, z1, r);
  return [
    `<clipPath id="${id}"><path transform="${planeOf(y)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `<g transform="${planeOf(y - depth)}"><path class="${backClass}" d="${shape}"/>${back}<path class="iso-line" data-tone="faint" d="${shape}"/></g>`,
    `</g>`,
    `<g transform="${planeOf(y)}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  ].join("");
}

function legAt([cx, cy]) {
  const plan = { x: cx - LEG / 2, y: cy - LEG / 2, w: LEG, d: LEG, r: 1 };
  return (
    S(k.cylinder(cx, cy, 2.9, 0, GLIDE_H, P, 20), { tone: "lo" }) +
    S(k.slabOf(plan, GLIDE_H, UNDER - GLIDE_H, P, 3, 0.4), { tone: "mid" })
  );
}

function desk() {
  const legs = k.corners(DESK, LEG_INSET + LEG / 2);
  const [behind, ...front] = byDepth(legs, ([x, y]) => [x, y, 0]);
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(DESK, 16), 0, 4, P)}"/>`];
  out.push(legAt(behind));
  out.push(S(k.slabOf(APRON, APRON_Z, UNDER - APRON_Z, P, 2), { tone: "mid" }));
  // Drawer: a front set flush in the apron, a shadow gap round it and a pull.
  out.push(recess({ x0: DRAWER.x0 - 1, x1: DRAWER.x1 + 1, z0: DRAWER.z0 - 1, z1: DRAWER.z1 + 1, r: 0.8, depth: 0.6 }, FRONT_FACE, "", "dk-dark"));
  out.push(`<g transform="${planeOf(FRONT_FACE)}"><path class="dk-face" d="${flat(DRAWER.x0, DRAWER.z0, DRAWER.x1, DRAWER.z1, 0.6)}"/>${L(flat(DRAWER.x0, DRAWER.z0, DRAWER.x1, DRAWER.z1, 0.6), { tone: "lo" })}</g>`);
  const pull = (DRAWER.x0 + DRAWER.x1) / 2;
  out.push(S(k.slabOf({ x: pull - 9, y: FRONT_FACE, w: 18, d: 1.6, r: 0.6 }, 88, 1.6, P, 2), { tone: "mid" }));
  out.push(D([at([pull - 7, FRONT_FACE + 1.6, 88.8]), at([pull + 7, FRONT_FACE + 1.6, 88.8])], { size: 0.35, tone: "mid" }));
  for (const leg of byDepth(front, ([x, y]) => [x, y, 0])) out.push(legAt(leg));
  // Top: an edge band seam just under the surface and a faint inlay line.
  out.push(
    S(k.slabOf(DESK, UNDER, TOP_H, P, 3, 0.8), {
      tone: "mid",
      inner: L(k.sideSeam(DESK, UNDER + 1.4, P, 3), { tone: "faint" }),
    }),
  );
  return out.join("");
}

function editor() {
  // Code lines as rule lines in the screen's plane: [indent, length] in columns.
  const lines = [
    [0, 14], [1, 22], [2, 17], [2, 25], [1, 9], [0, 0],
    [0, 18], [1, 27], [2, 12], [3, 20], [2, 8], [1, 15], [0, 4],
  ];
  const col = 1.9;
  const left = SCREEN.x0 + 16;
  const top = SCREEN.z1 - 12;
  const gap = 4.2;
  const rules = [];
  const strong = [];
  lines.forEach(([indent, length], i) => {
    if (!length) return;
    const z = -(top - i * gap);
    const x0 = left + indent * col * 2;
    const d = `M${x0} ${z}H${x0 + length * col}`;
    (i % 6 === 1 ? strong : rules).push(d);
  });
  const gutter = lines.map((_, i) => [SCREEN.x0 + 8, -(top - i * gap)]);
  const cursorAt = lines.length;
  const cz = -(top - cursorAt * gap);
  const bar = SCREEN.z1 - 4.5;
  return [
    `<path class="dk-glow" d="${flat(SCREEN.x0 + 10, SCREEN.z0 + 8, SCREEN.x1 - 10, SCREEN.z1 - 8, 20, 10)}"/>`,
    `<path class="iso-line" data-tone="faint" d="M${SCREEN.x0} ${-(bar - 3)}H${SCREEN.x1}M${SCREEN.x0 + 12} ${-(bar - 3)}V${-SCREEN.z0}"/>`,
    `<g class="dk-dots">${[0, 1, 2].map((i) => `<circle cx="${SCREEN.x0 + 4 + i * 3}" cy="${-bar}" r="0.8"/>`).join("")}</g>`,
    `<g class="dk-gutter">${gutter.map(([x, z]) => `<circle cx="${x}" cy="${z}" r="0.45"/>`).join("")}</g>`,
    `<path class="dk-code" d="${rules.join("")}" data-free=""/>`,
    `<path class="dk-code" data-strong="" d="${strong.join("")}" data-free=""/>`,
    `<rect class="dk-cursor" x="${left}" y="${cz - 1.6}" width="1.3" height="3.2"/>`,
  ].join("");
}

function monitor() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, TOP_Z, 3, P)}"/>`];
  out.push(S(k.slabOf(BASE, TOP_Z, BASE_H, P, 8, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 3.5), TOP_Z + BASE_H, P, 8), { tone: "faint" }));
  out.push(S(k.slabOf(NECK, TOP_Z + BASE_H, PANEL_Z0 + 30 - TOP_Z - BASE_H, P, 3, 0.4), { tone: "mid" }));
  // Cable slot through the neck, seen on its +x face.
  const slot = k.roundedPlan({ x: NECK.y + 2, y: TOP_Z + 6, w: 2, d: 7, r: 1 }, 4).map(([u, z]) => at([NECK.x + NECK.w, u, z]));
  out.push(L(k.pathOf(slot, true), { tone: "lo" }));
  out.push(S(k.slabOf(PANEL, PANEL_Z0, PANEL_Z1 - PANEL_Z0, P, 3, 0.5), { tone: "mid" }));
  out.push(recess(SCREEN, GLASS_Y, editor(), "dk-glass"));
  // Chin: a centred badge and a power LED.
  out.push(`<g transform="${planeOf(GLASS_Y)}">${L(flat(-5, 119, 5, 121, 1, 3), { tone: "lo" })}</g>`);
  out.push(D([at([SCREEN.x1 - 3, GLASS_Y, 120])], { size: 0.6, tone: "hi" }));
  // Buttons on the right side of the panel.
  const side = PANEL.x + PANEL.w;
  out.push(D([0, 1, 2].map((i) => at([side, PANEL.y + 2.5, PANEL_Z0 + 5 + i * 3.2])), { size: 0.45, tone: "mid" }));
  return out.join("");
}

function keyboard() {
  const out = [`<path class="iso-halo" d="${k.haloOf(KB, TOP_Z, 3, P)}"/>`];
  out.push(S(k.slabOf(KB, TOP_Z, KB_H, P, 4, 0.6), { tone: "mid" }));
  const well = { x: KEYS_X - 1, y: KEYS_Y - 1, w: U * 15 + 2, d: U * 5 + 2, r: 1.5 };
  out.push(L(k.planOutline(well, TOP_Z + KB_H, P, 3), { tone: "lo" }));
  out.push(D([at([KB.x + KB.w - 3.5, KB.y + 2, TOP_Z + KB_H])], { size: 0.4, tone: "hi" }));
  ROWS.forEach((row, r) => {
    let x = KEYS_X;
    for (const width of row) {
      const plan = { x: x + 0.5, y: KEYS_Y + r * U + 0.5, w: width * U - 1, d: U - 1, r: 1 };
      const h = ROW_H[r];
      const dish = k.planOutline(k.insetPlan(plan, 1.1), TOP_Z + KB_H + h, P, 3);
      out.push(S(k.slabOf(plan, TOP_Z + KB_H, h, P, 3, 0.3), { tone: "mid", crease: "faint", inner: "" }) + L(dish, { tone: "faint" }));
      x += width * U;
    }
  });
  return out.join("");
}

// One sword-shaped leaf, a flat blade in 3D that leans out of the pot and twists a little.
function leafOf({ phi, length, lean, width, twist, from }) {
  const base = [POT.x + Math.cos(phi) * from, POT.y + Math.sin(phi) * from, POT_TOP];
  const out = [Math.cos(phi), Math.sin(phi), 0];
  const N = 18;
  const left = [];
  const right = [];
  const mid = [];
  let normal = [0, 0, 0];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const reach = length * Math.sin(lean) * Math.pow(t, 1.7);
    const c = [base[0] + out[0] * reach, base[1] + out[1] * reach, base[2] + length * Math.cos(lean * t) * t];
    const turn = phi + Math.PI / 2 + twist * t;
    const across = [Math.cos(turn), Math.sin(turn), 0];
    const w = (width / 2) * Math.pow(1 - t, 0.55) * (0.72 + 0.28 * Math.min(1, t * 5));
    left.push([c[0] - across[0] * w, c[1] - across[1] * w, c[2]]);
    right.push([c[0] + across[0] * w, c[1] + across[1] * w, c[2]]);
    mid.push(c);
    if (i === Math.round(N / 2)) {
      const up = [out[0] * Math.sin(lean), out[1] * Math.sin(lean), Math.cos(lean)];
      normal = G.cross3(across, up);
    }
  }
  if (G.dot3(normal, G.viewOf(P)) < 0) normal = G.mul3(normal, -1);
  const shade = G.toneOf(normal, P);
  const d = k.pathOf([...left, ...right.reverse()].map(at), true);
  // Snake-plant bands: faint chevrons from edge to edge.
  const bands = [];
  for (let b = 1; b <= 5; b++) {
    const i = Math.round((b / 6.3) * N);
    const j = Math.min(N, i + 1);
    const l = left[i];
    const r = right[N - i];
    const m = mid[j];
    bands.push(k.pathOf([l, m, r].map(at)));
  }
  const paths = { fill: d, outline: d, crease: "", top: "", shades: [0, 1, 2, 3].map((s) => (s === shade ? d : "")) };
  return {
    depth: k.depthOf(mid[Math.round(N * 0.35)], P),
    svg: S(paths, {
      tone: "mid",
      crease: "none",
      inner: L(bands.join(""), { tone: "faint" }) + L(k.pathOf(mid.map(at)), { tone: "lo" }),
    }),
  };
}

function plant() {
  const F = G.frameOf([POT.x, POT.y, TOP_Z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const pot = G.frameOf([POT.x, POT.y, TOP_Z + SAUCER.h], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: POT.x - SAUCER.r, y: POT.y - SAUCER.r, w: SAUCER.r * 2, d: SAUCER.r * 2, r: SAUCER.r }, TOP_Z, 3, P)}"/>`];
  out.push(S(G.disc(0, SAUCER.h, SAUCER.r, F, P), { tone: "mid", inner: L(G.arcOf(F, SAUCER.h - 0.8, SAUCER.r, P), { tone: "faint" }) }));
  out.push(
    S(G.solidOf(POT_PROFILE, pot, P), {
      tone: "mid",
      inner: L(G.arcOf(pot, 1.6, 10.5 + (2.7 * 1.6) / 19, P, { slope: 2.7 / 19 }), { tone: "faint" }),
    }),
  );
  // Soil inside the rim, with a few grains.
  const soilRing = k.ring(POT.x, POT.y, SOIL_R, POT_TOP, P, 48);
  out.push(`<path class="dk-soil" d="${soilRing}"/>`, L(soilRing, { tone: "lo" }));
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const grains = [];
  for (let i = 0; i < 34; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (SOIL_R - 1.5);
    grains.push(at([POT.x + Math.cos(a) * r, POT.y + Math.sin(a) * r, POT_TOP]));
  }
  out.push(D(grains, { size: 0.32, tone: "lo" }));
  const leaves = [
    { phi: 0.3, length: 50, lean: 0.16, width: 11, twist: 0.5, from: 2.5 },
    { phi: 1.3, length: 38, lean: 0.32, width: 10, twist: -0.4, from: 4 },
    { phi: 2.3, length: 56, lean: 0.12, width: 12, twist: 0.3, from: 2 },
    { phi: 3.3, length: 42, lean: 0.28, width: 10.5, twist: -0.5, from: 4 },
    { phi: 4.2, length: 54, lean: 0.14, width: 11.5, twist: 0.4, from: 2.5 },
    { phi: 5.2, length: 34, lean: 0.36, width: 9.5, twist: -0.3, from: 5 },
    { phi: 0.8, length: 28, lean: 0.4, width: 8.5, twist: 0.2, from: 6.5 },
  ].map(leafOf);
  for (const leaf of leaves.sort((a, b) => a.depth - b.depth)) out.push(leaf.svg);
  return out.join("");
}

// Painter's order on the desk top: back to front by each item's depth.
const onTop = [
  { depth: k.depthOf([POT.x, POT.y, TOP_Z], P), svg: plant() },
  { depth: k.depthOf([0, -42, TOP_Z], P), svg: monitor() },
  { depth: k.depthOf([0, KB.y + KB.d / 2, TOP_Z], P), svg: keyboard() },
].sort((a, b) => a.depth - b.depth);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "An isometric drawing of a desk on four legs with a drawer, a monitor showing a code editor with a blinking cursor, a keyboard, and a snake plant in a pot.",
  body: [desk(), ...onTop.map((item) => item.svg)],
});

const FIG_CSS = `
.dk-well{fill:var(--anatomy-shade-1)}
.dk-dark{fill:var(--anatomy-shade-0)}
.dk-face{fill:var(--anatomy-shade-2)}
.dk-glass{fill:var(--anatomy-lit-shade)}
.dk-glow{fill:var(--anatomy-lit);opacity:.05;filter:blur(6px)}
.dk-code{fill:none;stroke:var(--anatomy-mid);stroke-width:1.1px;stroke-linecap:round;vector-effect:non-scaling-stroke}
.dk-code[data-strong]{stroke:var(--anatomy-hi)}
.dk-gutter circle{fill:var(--anatomy-lo)}
.dk-dots circle{fill:var(--anatomy-lo)}
.dk-cursor{fill:var(--anatomy-lit);animation:dk-blink 1.06s steps(1,end) infinite}
.dk-soil{fill:var(--anatomy-shade-0)}
@keyframes dk-blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.dk-cursor{animation:none}}
`;

// The kit's CSS is dark by default with a light override. The site is light by
// default with `.dark` on <html>, so swap the two blocks onto that scheme.
function siteCss() {
  const css = k.ISO_CSS;
  const darkVars = css.match(/^\.iso\{([^}]*)\}/m)[1];
  const lightVars = css.match(/^\.iso\[data-theme="light"\]\{([^}]*)\}/m)[1];
  const rest = css
    .replace(/^\.iso\{[^}]*\}\n?/m, "")
    .replace(/^\.iso\[data-theme="light"\]\{[^}]*\}\n?/m, "")
    .split("\n")
    .filter((line) => !/^\.iso-(figure|plate|legend|keys|key|swatch)/.test(line) && !/^@media \(max-width/.test(line))
    .join("\n");
  return [
    `.desk-figure{${lightVars};--anatomy-paper:var(--color-neutral-100,#f5f5f5)}`,
    `.dark .desk-figure{${darkVars};--anatomy-paper:var(--color-neutral-900,#171717)}`,
    rest,
    FIG_CSS,
  ].join("\n");
}

const component = `---
// Generated by scripts/desk-figure/build.mjs. Edit the script, not this file.
---

<figure class="desk-figure animate not-prose mb-10">
  ${svg}
</figure>

<style is:global>
${siteCss()}
</style>
`;
writeFileSync(join(ROOT, "src/components/DeskFigure.astro"), component);
console.log("wrote src/components/DeskFigure.astro");

const outAt = process.argv.indexOf("--out");
if (process.argv.includes("--preview") && outAt > 0) {
  const dir = process.argv[outAt + 1];
  const css = `<style>${FIG_CSS}</style>`;
  for (const theme of ["dark", "light"]) {
    const body = css + k.plateHtml({ fig: "Fig 1", title: "Desk", hint: "", readout: "", keys: [], caption: "", body: svg });
    writeFileSync(join(dir, `desk-${theme}.html`), k.pageHtml({ title: "Desk", theme, body, width: 900 }));
  }
  console.log("wrote previews to", dir);
}
