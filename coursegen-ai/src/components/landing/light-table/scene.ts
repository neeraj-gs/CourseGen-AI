import * as THREE from "three";
import {
  CANDIDATES_PER_CHAPTER,
  CHAPTER_COUNT,
  STILL_THRESHOLD,
  buildField,
  type Candidate,
} from "@/components/landing/cutting-room-data";

/**
 * THE LIGHT TABLE — the signature.
 *
 * This is the only module in the repository that imports three.js. It is
 * reached exclusively through a `next/dynamic` boundary, so a visitor who
 * never renders the hero never downloads a byte of it.
 *
 * What it draws is the agent's actual job. Every chapter of a course gets a
 * column of candidate YouTube lessons laid out on a backlit editing bench,
 * receding into fog. Scrolling (or dragging the rank control) sweeps a cull
 * line through the field: rejected candidates sink, grey out and slide back
 * into the fog, and the one survivor per chapter rises off the table and
 * stands up. Thirteen columns in, thirteen lessons out — which is the course.
 *
 * Engineering contract:
 *   · one draw call for the whole field, plus one additive pass for survivors
 *   · zero allocation inside the frame loop
 *   · no React state anywhere near per-frame work
 *   · a single composed frame when the reader prefers reduced motion
 */

/* -------------------------------------------------------------------------- */
/* Palette — the same hexes the CSS uses, so the canvas and the DOM agree.    */
/* -------------------------------------------------------------------------- */

const EMULSION = new THREE.Color("#c2410c"); // screened, not yet judged
const TALLY = new THREE.Color("#0f766e"); // survived the cull
const DUST = new THREE.Color("#8a8880"); // rejected
const BORDER_LIGHT = new THREE.Color("#211f1b");
const BORDER_DARK = new THREE.Color("#3a3128");
const FOG_LIGHT = new THREE.Color("#f0efe9");
const FOG_DARK = new THREE.Color("#241d15");

/* -------------------------------------------------------------------------- */
/* Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const FRAME_VERT = /* glsl */ `
  attribute vec3 aOffset;
  attribute float aRank01;
  attribute float aScore;
  attribute float aSeed;

  uniform float uTime;
  uniform float uThreshold;
  uniform float uAssemble;
  uniform float uGlow;
  uniform float uUnit;
  uniform float uCompress;

  varying vec2 vUv;
  varying float vCull;
  varying float vWin;
  varying float vScore;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vUv = uv;
    vScore = aScore;
    vSeed = aSeed;

    // The cull line sweeps from the back of the bench toward the front. A
    // candidate is rejected once the line passes its rank.
    float keepLine = 1.0 - uThreshold;
    float isWinner = 1.0 - step(0.0001, aRank01);
    float cull = smoothstep(keepLine - 0.07, keepLine + 0.07, aRank01);
    cull *= 1.0 - isWinner;            // the best in a chapter is never culled
    float win = isWinner * uThreshold; // ...it is promoted instead

    vCull = cull;
    vWin = win;

    vec3 pos = position;
    pos *= 1.0 + win * 0.85 - cull * 0.22;
    pos *= mix(1.0, 2.35, uGlow);      // the additive pass draws a larger quad

    vec3 world = aOffset;

    // Entrance. Frames fall onto the bench, staggered by their own seed so
    // it lands as one gesture rather than forty separate ones.
    float t = clamp((uAssemble - aSeed * 0.34) / 0.66, 0.0, 1.0);
    float ease = 1.0 - pow(1.0 - t, 3.0);
    world.y += (1.0 - ease) * (2.8 + aSeed * 1.5) * uUnit;
    world.z -= (1.0 - ease) * 1.4 * uUnit;

    // Rejected: sinks, drifts back into the fog, scatters a little.
    world.y -= cull * (0.52 + aSeed * 0.36) * uUnit;
    world.z -= cull * (1.6 + aSeed * 0.9) * uUnit;
    world.x += cull * (aSeed - 0.5) * 0.55 * uUnit;

    // Survivor: lifts off the table, comes forward, and the thirteen of them
    // close up into a single readable strip.
    world.y += win * 0.34 * uUnit;
    world.z += win * 3.10 * uUnit;
    world.x *= mix(1.0, uCompress, win);

    // The bench breathes. Barely.
    world.y += sin(uTime * 0.55 + aSeed * 6.283) * 0.013 * (1.0 - cull);

    // Frames lie back on the table and stand up as they win.
    float tilt = -1.02 + win * 0.78 + cull * 0.30;
    float ca = cos(tilt);
    float sa = sin(tilt);
    vec3 p = vec3(pos.x, pos.y * ca - pos.z * sa, pos.y * sa + pos.z * ca);

    vec4 mv = modelViewMatrix * vec4(p + world, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAME_FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uEmulsion;
  uniform vec3 uTally;
  uniform vec3 uDust;
  uniform vec3 uBorder;
  uniform vec3 uFog;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uGlow;
  uniform float uLiftBase;
  uniform float uLiftRange;

  varying vec2 vUv;
  varying float vCull;
  varying float vWin;
  varying float vScore;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    float fog = smoothstep(uFogNear, uFogFar, vDepth);

    // --- additive pass: the halo under a survivor, and nothing else ---
    if (uGlow > 0.5) {
      float r = length(c);
      float halo = pow(max(0.0, 1.0 - r), 3.2) * vWin;
      gl_FragColor = vec4(uTally * 1.9 * halo * (1.0 - fog), halo * (1.0 - fog));
      return;
    }

    vec2 q = abs(c);
    float edge = max(q.x, q.y);
    float border = step(0.86, edge);
    // Sprocket notches punched down both sides of the stock.
    float notch =
      step(0.87, q.x) *
      step(0.58, abs(fract(vUv.y * 5.0) * 2.0 - 1.0));

    vec3 col = mix(uEmulsion, uDust, vCull);
    col = mix(col, uTally, vWin);

    // A stronger-scoring candidate reads as a brighter frame on the table,
    // and the bench lights every frame from below.
    float lift = uLiftBase + vScore * uLiftRange;
    float back = 0.66 + (1.0 - vUv.y) * 0.48;
    vec3 rgb = col * lift * back;

    // Emulsion grain, so flat colour reads as film rather than paint.
    rgb += (fract(sin(vSeed * 91.7 + vUv.y * 140.0) * 4390.0) - 0.5) * 0.05;

    rgb = mix(rgb, uBorder, border);
    rgb = mix(rgb, uBorder * 0.35, notch * border);
    rgb = mix(rgb, rgb * 0.5, vCull * 0.8);
    // Survivors have to out-read everything around them at every point in
    // the sweep, not only when the sweep has finished.
    rgb += (uTally * 1.5 + vec3(0.045)) * vWin * 0.95 * (1.0 - border);

    float alpha = 1.0 - vCull * 0.78;
    rgb = mix(rgb, uFog, fog);
    alpha *= 1.0 - fog * 0.9;

    gl_FragColor = vec4(rgb, alpha);
  }
`;

const TABLE_VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const TABLE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uGlowColour;
  uniform vec3 uFog;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    // The backlight itself: a soft pool under the middle of the bench.
    vec2 p = (vUv - vec2(0.5, 0.46)) * vec2(1.0, 1.55);
    float pool = pow(max(0.0, 1.0 - length(p) * 2.05), 2.8);

    // Brushed metal running across the table, well under the noise floor.
    float brush = sin(vUv.x * 620.0) * 0.008;

    vec3 rgb = uGlowColour * (pool + brush);
    float alpha = pool * 0.95;

    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    rgb = mix(rgb, uFog, fog);
    alpha *= 1.0 - fog;

    gl_FragColor = vec4(rgb, alpha);
  }
`;

/* -------------------------------------------------------------------------- */
/* Scene                                                                      */
/* -------------------------------------------------------------------------- */

export type LightTableHandle = {
  /** 0 → 1 as the hero scrolls. Drives the camera dolly and the default cull. */
  setProgress: (value: number) => void;
  /** Non-null takes the cull away from scroll and gives it to the reader. */
  setOverride: (value: number | null) => void;
  setPointer: (x: number, y: number) => void;
  setTheme: (dark: boolean) => void;
  /** Stops the loop when the canvas leaves the viewport or the tab is hidden. */
  setRunning: (running: boolean) => void;
  dispose: () => void;
};

export type LightTableOptions = {
  canvas: HTMLCanvasElement;
  /** Candidate depth per chapter. Dropped on narrow viewports for the frame budget. */
  perChapter: number;
  dark: boolean;
  /** True when the reader prefers reduced motion: compose one frame and stop. */
  still: boolean;
};

/**
 * Two gauges of stock. A portrait viewport sees a much narrower slice of the
 * world at the same distance, so rather than backing the camera off — which
 * would drop the bench out of the bottom of the frame — the bench itself is
 * cut on smaller stock. Same composition, more of it visible, and `uUnit`
 * keeps every displacement in the shader proportional to the gauge.
 */
const GAUGE = {
  wide: {
    colGap: 1.02,
    rowGap: 0.7,
    quad: [0.7, 0.5] as const,
    unit: 1,
    compress: 0.62,
  },
  narrow: {
    colGap: 0.52,
    rowGap: 0.52,
    quad: [0.44, 0.32] as const,
    unit: 0.74,
    // A portrait frame is narrower, so the strip has to close up harder for
    // all thirteen to be inside it and countable.
    compress: 0.4,
  },
};

/** Where the bench starts to dissolve, at the reference (wide) framing. */
const FOG_NEAR = 8.0;
const FOG_FAR = 20.0;

export function createLightTable({
  canvas,
  perChapter,
  dark,
  still,
}: LightTableOptions): LightTableHandle {
  const parent = canvas.parentElement as HTMLElement;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  // Capped so a three-year-old laptop on a retina panel is not asked to fill
  // four times the pixels it can afford.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);

  const gauge =
    perChapter >= CANDIDATES_PER_CHAPTER.wide ? GAUGE.wide : GAUGE.narrow;
  const colGap = gauge.colGap;
  const field: Candidate[] = buildField(perChapter);

  // Sorted back-to-front. The pass is alpha-blended with depth writes off, so
  // draw order *is* the depth sort — and because the camera barely moves, one
  // static ordering is correct for the whole session.
  field.sort((a, b) => b.rank - a.rank);

  const count = field.length;
  const offsets = new Float32Array(count * 3);
  const ranks = new Float32Array(count);
  const scores = new Float32Array(count);
  const seeds = new Float32Array(count);

  const centre = (CHAPTER_COUNT - 1) / 2;
  const denom = Math.max(1, perChapter - 1);

  for (let i = 0; i < count; i += 1) {
    const c = field[i];
    offsets[i * 3 + 0] = (c.chapter - centre) * colGap;
    offsets[i * 3 + 1] = 0;
    offsets[i * 3 + 2] = -c.rank * gauge.rowGap;
    ranks[i] = c.rank / denom;
    scores[i] = c.score;
    seeds[i] = c.seed;
  }

  function makeFieldGeometry() {
    const base = new THREE.PlaneGeometry(gauge.quad[0], gauge.quad[1]);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.attributes.position = base.attributes.position;
    geo.attributes.uv = base.attributes.uv;
    geo.instanceCount = count;
    geo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    geo.setAttribute("aRank01", new THREE.InstancedBufferAttribute(ranks, 1));
    geo.setAttribute("aScore", new THREE.InstancedBufferAttribute(scores, 1));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    base.dispose();
    return geo;
  }

  const shared = {
    uTime: { value: 0 },
    uThreshold: { value: 0 },
    uAssemble: { value: still ? 1 : 0 },
    uUnit: { value: gauge.unit },
    uCompress: { value: gauge.compress },
    uEmulsion: { value: EMULSION },
    uTally: { value: TALLY },
    uDust: { value: DUST },
    uBorder: { value: dark ? BORDER_DARK : BORDER_LIGHT },
    uFog: { value: dark ? FOG_DARK : FOG_LIGHT },
    uLiftBase: { value: dark ? 0.80 : 0.42 },
    uLiftRange: { value: dark ? 0.55 : 0.50 },
    uFogNear: { value: FOG_NEAR },
    uFogFar: { value: FOG_FAR },
  };

  const fieldMat = new THREE.ShaderMaterial({
    vertexShader: FRAME_VERT,
    fragmentShader: FRAME_FRAG,
    uniforms: { ...shared, uGlow: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // The halo under a survivor. Additive, so it reads as light on the bench
  // rather than a shape sitting on top of one — and it is the only bloom on
  // the page, confined to the elements that are genuinely emitting.
  const glowMat = new THREE.ShaderMaterial({
    vertexShader: FRAME_VERT,
    fragmentShader: FRAME_FRAG,
    uniforms: { ...shared, uGlow: { value: 1 } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const fieldMesh = new THREE.Mesh(makeFieldGeometry(), fieldMat);
  fieldMesh.frustumCulled = false;
  scene.add(fieldMesh);

  const glowMesh = new THREE.Mesh(makeFieldGeometry(), glowMat);
  glowMesh.frustumCulled = false;
  glowMesh.renderOrder = 2;
  scene.add(glowMesh);

  const tableMat = new THREE.ShaderMaterial({
    vertexShader: TABLE_VERT,
    fragmentShader: TABLE_FRAG,
    uniforms: {
      uGlowColour: { value: new THREE.Color(dark ? "#6b5024" : "#fff8e2") },
      uFog: shared.uFog,
      uFogNear: shared.uFogNear,
      uFogFar: shared.uFogFar,
    },
    transparent: true,
    depthWrite: false,
  });
  const table = new THREE.Mesh(new THREE.PlaneGeometry(46, 34), tableMat);
  table.rotation.x = -Math.PI / 2;
  table.position.y = -0.30;
  table.renderOrder = -1;
  scene.add(table);

  /* ---------------------------------------------------------------------- */
  /* Frame loop state. Every value below is preallocated: the loop itself    */
  /* allocates nothing and touches no React state.                          */
  /* ---------------------------------------------------------------------- */

  let progress = 0;
  let override: number | null = null;
  let running = !still;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let elapsed = 0;

  const pointer = { x: 0, y: 0 };
  const damped = { x: 0, y: 0 };
  let dampedThreshold = 0;
  let dampedProgress = 0;

  // The dolly is the argument, so it is a real move through the scene rather
  // than a nudge. It opens standing at the near end of the bench — stock
  // running off both edges, converging into fog at the back — and ends pulled
  // right back, far enough that all thirteen survivors read as one row.
  // Scaled to the gauge, so the framing is identical whichever stock the
  // bench was cut on — only the horizontal crop differs.
  const u = gauge.unit;
  const camNear = new THREE.Vector3(0, 3.7, 4.6).multiplyScalar(u);
  const camFar = new THREE.Vector3(0, 4.34, 10.6).multiplyScalar(u);
  const lookNear = new THREE.Vector3(0, -0.3, -5.0).multiplyScalar(u);
  const lookFar = new THREE.Vector3(0, 0.83, -1.4).multiplyScalar(u);
  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();

  // A portrait viewport sees a much narrower slice of the world at the same
  // distance, which turns the bench into a wall of four columns. Backing the
  // camera off along its own sightline restores the framing without moving
  // a single vertex or touching the composition's geometry.
  let fit = 1;
  let isDark = dark;

  /**
   * Fog is a distance relationship, not a constant — pulling the camera back
   * without moving the fog with it would drown the bench in haze.
   *
   * The darkroom needs it closer still. With the room light off the stock is
   * printed hotter, which makes the far rows visible when they should have
   * dissolved, and two hundred frames at once is a texture rather than a
   * bench. Bringing the fog in restores the same four-rows-then-haze reading
   * both themes are composed around.
   */
  function applyFog() {
    const reach = fit * gauge.unit * (isDark ? 0.72 : 1);
    shared.uFogNear.value = FOG_NEAR * reach;
    shared.uFogFar.value = FOG_FAR * reach;
  }

  function resize() {
    const w = parent.clientWidth || 1;
    const h = parent.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fit = THREE.MathUtils.clamp(1.6 / camera.aspect, 1, 1.25);
    applyFog();
  }

  function draw() {
    // Camera dolly: the reader moves through the bench, not past it.
    camPos.lerpVectors(camNear, camFar, dampedProgress);
    lookAt.lerpVectors(lookNear, lookFar, dampedProgress);

    // In place: no allocation, and the sightline is preserved exactly.
    camPos.sub(lookAt).multiplyScalar(fit).add(lookAt);
    camPos.x += damped.x;
    camPos.y += damped.y;

    camera.position.copy(camPos);
    camera.lookAt(lookAt);

    shared.uThreshold.value = dampedThreshold;
    shared.uTime.value = elapsed;

    renderer.render(scene, camera);
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    if (!running) return;

    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    elapsed += dt;

    // Critically damped-feeling approach. This is a heavy object on a bench:
    // pointer travel stays well under half a world unit and always settles.
    const k = 1 - Math.pow(0.001, dt);
    damped.x += (pointer.x * 0.34 - damped.x) * k;
    damped.y += (pointer.y * 0.2 - damped.y) * k;

    // Scroll is the playhead. The cull is scrubbed across the middle of the
    // section so the first screen holds a full bench and the last holds the
    // finished course, rather than the sweep starting the instant you move.
    const target =
      override ?? THREE.MathUtils.smoothstep(progress, 0.16, 0.78);
    dampedThreshold += (target - dampedThreshold) * (1 - Math.pow(0.004, dt));
    dampedProgress += (progress - dampedProgress) * (1 - Math.pow(0.01, dt));

    if (shared.uAssemble.value < 1) {
      shared.uAssemble.value = Math.min(1, shared.uAssemble.value + dt * 0.62);
    }

    draw();
  }

  resize();
  const ro = new ResizeObserver(() => {
    resize();
    if (still) draw();
  });
  ro.observe(parent);

  if (still) {
    // Reduced motion: one composed frame and nothing else. The camera sits at
    // the end of the dolly, and the cull is stopped part-way through so all
    // three states — screened, culled, in the cut — are on the bench at once
    // and the legend beside it is true. A deliberate composition, not a
    // frozen mid-animation pose and not an empty box.
    dampedThreshold = STILL_THRESHOLD;
    dampedProgress = 1;
    shared.uAssemble.value = 1;
    draw();
  } else {
    raf = requestAnimationFrame(tick);
  }

  return {
    setProgress(value) {
      // Under reduced motion the composed frame is the whole scene: linking
      // the camera to the scroll position would be exactly the motion the
      // reader asked not to have.
      if (still) return;
      progress = value;
    },
    setOverride(value) {
      override = value;
      // Direct manipulation is not animation: dragging the control still
      // recomposes, one frame per input, even under reduced motion.
      if (still && value !== null) {
        dampedThreshold = value;
        draw();
      }
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    setTheme(nextDark) {
      isDark = nextDark;
      shared.uBorder.value = nextDark ? BORDER_DARK : BORDER_LIGHT;
      shared.uFog.value = nextDark ? FOG_DARK : FOG_LIGHT;
      shared.uLiftBase.value = nextDark ? 0.8 : 0.42;
      shared.uLiftRange.value = nextDark ? 0.55 : 0.5;
      tableMat.uniforms.uGlowColour.value.set(nextDark ? "#6b5024" : "#fff8e2");
      applyFog();
      if (still) draw();
    },
    setRunning(next) {
      running = next;
      if (next) last = 0; // avoid a jump after being paused
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      fieldMesh.geometry.dispose();
      glowMesh.geometry.dispose();
      table.geometry.dispose();
      fieldMat.dispose();
      glowMat.dispose();
      tableMat.dispose();
      renderer.dispose();
    },
  };
}
