/**
 * Casa del Espacio — QA harness.
 *
 *   node scripts/qa.mjs [baseUrl]
 *
 * Runs every route at three viewports and checks the things that actually
 * break on a photography-led, motion-heavy site: contrast, overflow, focus,
 * touch targets, heading order, resting visibility, and reduced motion.
 *
 * Exits non-zero if any FAIL is found. WARNs are reported, not fatal.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:3300';
const ROUTES = ['/', '/work', '/studio', '/services', '/journal', '/contact'];
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: false },
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
];

const findings = [];
const add = (level, route, vp, check, detail) =>
  findings.push({ level, route, vp, check, detail });

/* ---------- in-page audit ---------------------------------------- */
const AUDIT = () => {
  const px = (s) => parseFloat(s) || 0;

  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };

  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };

  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };

  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });

  // Composite every translucent background layer up to the root.
  const effectiveBg = (el) => {
    const layers = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a >= 0.999) break;
      }
      n = n.parentElement;
    }
    const root = parse(getComputedStyle(document.body).backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 };
    let acc = layers.length && layers[layers.length - 1].a >= 0.999 ? layers.pop() : root;
    while (layers.length) acc = over(layers.pop(), acc);
    return acc;
  };

  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || px(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const out = {
    contrast: [],
    overflow: null,
    headings: [],
    imagesNoAlt: [],
    smallTargets: [],
    hiddenAtRest: [],
    landmarks: {},
    focusables: 0,
  };

  /* --- horizontal overflow --- */
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) {
    const culprits = [...document.querySelectorAll('*')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > de.clientWidth + 1 && visible(el);
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`);
    out.overflow = { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, culprits };
  }

  /* --- text contrast --- */
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim())
      .join(' ');
    if (!text) continue;

    const s = getComputedStyle(el);
    const fg = parse(s.color);
    if (!fg || fg.a === 0) continue;
    const bg = effectiveBg(el);
    const composed = fg.a < 1 ? over(fg, bg) : fg;
    const r = ratio(composed, bg);

    const size = px(s.fontSize);
    const weight = parseInt(s.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;

    const key = `${s.color}|${s.fontSize}|${text.slice(0, 24)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (r < need) {
      out.contrast.push({
        text: text.slice(0, 46),
        color: s.color,
        bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
        size: `${size}px`,
        ratio: Math.round(r * 100) / 100,
        need,
        sel: `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`,
      });
    }
  }

  /* --- headings --- */
  out.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter(visible)
    .map((h) => ({ level: +h.tagName[1], text: h.textContent.trim().slice(0, 40) }));

  /* --- images --- */
  out.imagesNoAlt = [...document.querySelectorAll('img')]
    .filter((i) => i.getAttribute('alt') === null)
    .map((i) => i.currentSrc || i.src || '(no src)')
    .slice(0, 5);

  /* --- interactive targets --- */
  const focusables = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(visible);
  out.focusables = focusables.length;
  out.smallTargets = focusables
    .filter((el) => {
      const r = el.getBoundingClientRect();
      // Inline links inside a sentence are exempt; standalone controls are not.
      const inline = getComputedStyle(el).display.includes('inline') && el.closest('p,nav,li');
      return !inline && (r.height < 44 || r.width < 24);
    })
    .slice(0, 6)
    .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 20)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);

  /* --- content hidden at rest (the classic scroll-reveal bug) --- */
  out.hiddenAtRest = [...document.querySelectorAll('h1,h2,h3,p,li,figure,img,section')]
    .filter((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const onScreen = r.top < innerHeight && r.bottom > 0 && r.width > 0;
      return onScreen && (px(s.opacity) === 0 || s.visibility === 'hidden');
    })
    .slice(0, 6)
    .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`);

  /* --- landmarks --- */
  out.landmarks = {
    header: !!document.querySelector('header'),
    main: !!document.querySelector('main'),
    footer: !!document.querySelector('footer'),
    navLabelled: [...document.querySelectorAll('nav')].every(
      (n) => n.getAttribute('aria-label') || n.getAttribute('aria-labelledby')
    ),
    h1Count: document.querySelectorAll('h1').length,
    lang: document.documentElement.lang || '(missing)',
    title: document.title || '(missing)',
  };

  return out;
};

/* ---------- driver ------------------------------------------------ */
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
  // ANGLE, not the legacy SwiftShader GL path: that path drops the first
  // tile row of a WebGL canvas sitting under a sticky layer, which shows up
  // as a black band across the top of the hero. Real browsers go through
  // ANGLE, so testing on it avoids chasing an artifact that does not exist
  // outside headless software rendering.
  args: ['--disable-background-networking', '--no-first-run', '--disable-component-update',
         '--disable-sync', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    deviceScaleFactor: 1,
  });

  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    const badRequests = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 140)));
    page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message.slice(0, 140)));
    page.on('response', (r) => r.status() >= 400 && badRequests.push(`${r.status()} ${r.url().replace(BASE, '')}`));

    await page.goto(BASE + route, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(2200); // let reveals settle

    const a = await page.evaluate(AUDIT);

    if (consoleErrors.length) add('FAIL', route, vp.name, 'console', consoleErrors.join(' | '));
    if (badRequests.length) add('FAIL', route, vp.name, 'requests', badRequests.join(' | '));
    if (a.overflow)
      add('FAIL', route, vp.name, 'h-overflow',
        `${a.overflow.scrollWidth}px in ${a.overflow.clientWidth}px — ${a.overflow.culprits.join(', ')}`);
    for (const c of a.contrast)
      add('FAIL', route, vp.name, 'contrast',
        `${c.ratio}:1 (needs ${c.need}) ${c.sel} ${c.size} ${c.color} on ${c.bg} — "${c.text}"`);
    if (a.hiddenAtRest.length)
      add('FAIL', route, vp.name, 'hidden-at-rest', a.hiddenAtRest.join(', '));
    if (a.imagesNoAlt.length)
      add('FAIL', route, vp.name, 'img-alt', a.imagesNoAlt.join(', '));
    if (a.landmarks.h1Count !== 1)
      add('FAIL', route, vp.name, 'h1', `found ${a.landmarks.h1Count}, expected 1`);
    if (!a.landmarks.navLabelled)
      add('FAIL', route, vp.name, 'nav-label', 'a <nav> has no accessible name');
    if (a.landmarks.lang === '(missing)')
      add('FAIL', route, vp.name, 'lang', 'html has no lang');

    // heading order
    let prev = 0;
    for (const h of a.headings) {
      if (prev && h.level > prev + 1)
        add('WARN', route, vp.name, 'heading-order', `h${prev} -> h${h.level} at "${h.text}"`);
      prev = h.level;
    }
    if (a.smallTargets.length)
      add('WARN', route, vp.name, 'touch-target', a.smallTargets.join(' | '));

    // focus visibility — first few focusables must show a visible ring
    const focusIssues = await page.evaluate(() => {
      const bad = [];
      const isVisible = (el) => {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      // Links hidden at this breakpoint (the desktop nav on mobile) cannot
      // take focus, so testing them reports a ring that was never missing.
      const els = [...document.querySelectorAll('a[href],button')].filter(isVisible).slice(0, 6);
      for (const el of els) {
        el.focus();
        const s = getComputedStyle(el);
        const ring =
          (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ||
          s.boxShadow !== 'none' ||
          s.textDecorationLine !== 'none';
        if (!ring) bad.push(`${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 18)}"`);
      }
      return bad;
    });
    if (focusIssues.length) add('FAIL', route, vp.name, 'focus-ring', focusIssues.join(', '));

    await page.close();
  }
  await ctx.close();
}

/* ---------- reduced motion ---------------------------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 25000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return {
      h1Opacity: getComputedStyle(h1).opacity,
      h1Text: (h1.getAttribute('aria-label') || h1.textContent || '').trim().slice(0, 40),
      tier: document.querySelector('.lightfall')?.dataset.tier ?? '(none)',
      hidden: [...document.querySelectorAll('h1,h2,p')].filter(
        (el) => getComputedStyle(el).opacity === '0'
      ).length,
    };
  });
  if (r.hidden > 0) add('FAIL', '/', 'reduced-motion', 'hidden-content', `${r.hidden} elements at opacity 0`);
  if (r.tier !== '3') add('FAIL', '/', 'reduced-motion', 'tier', `expected T3, got T${r.tier}`);
  if (!r.h1Text) add('FAIL', '/', 'reduced-motion', 'h1-text', 'h1 has no accessible text');
  await ctx.close();
}

await browser.close();

/* ---------- report ------------------------------------------------ */
const fails = findings.filter((f) => f.level === 'FAIL');
const warns = findings.filter((f) => f.level === 'WARN');

const key = (f) => `${f.check}|${f.detail}`;
const dedupe = (list) => {
  const m = new Map();
  for (const f of list) {
    const k = key(f);
    if (!m.has(k)) m.set(k, { ...f, where: new Set() });
    m.get(k).where.add(`${f.route}@${f.vp}`);
  }
  return [...m.values()];
};

const print = (list, label) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length} unique)`);
  for (const f of list) {
    console.log(`  [${f.check}] ${f.detail}`);
    console.log(`      ${[...f.where].join(', ')}`);
  }
};

console.log(`QA · ${ROUTES.length} routes × ${VIEWPORTS.length} viewports + reduced-motion`);
print(dedupe(fails), 'FAIL');
print(dedupe(warns), 'WARN');
if (!fails.length && !warns.length) console.log('\nAll checks passed.');
else console.log(`\n${fails.length} failures, ${warns.length} warnings (raw occurrences).`);

process.exit(fails.length ? 1 : 0);
