/**
 * Measures text contrast where the ground is a photograph.
 *
 *   node scripts/contrast-over-media.mjs [baseUrl]
 *
 * The main harness can only resolve a single background colour, so text over
 * an image is reported there as unverifiable. This measures it properly:
 * hide the text, screenshot, sample the pixels its box actually covers, and
 * take the WORST contrast across that area — a label is only as readable as
 * its brightest patch of sky.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:3330';
const ROUTES = ['/', '/work'];
const AA_SMALL = 4.5, AA_LARGE = 3.0;

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
  args: ['--disable-background-networking','--no-first-run','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
});
const findings = [];

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);

  const panels = await page.evaluate(() => document.querySelectorAll('.project-panel').length || 1);

  for (let i = 0; i < panels; i++) {
    if (route === '/work' && i > 0) {
      await page.evaluate((n) => {
        const el = document.querySelectorAll('.project-panel')[n];
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
      }, i);
      await page.waitForTimeout(1200);
    }

    // Collect the boxes and colours of text sitting over an image/gradient.
    const targets = await page.evaluate(() => {
      const px = (s) => parseFloat(s) || 0;
      const overMedia = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const s = getComputedStyle(n);
          if (s.backgroundImage && s.backgroundImage !== 'none') return true;
          const bg = s.backgroundColor.match(/[\d.]+/g);
          if (bg && (bg[3] === undefined || parseFloat(bg[3]) >= 0.999)) return false;
          n = n.parentElement;
        }
        return false;
      };
      const out = [];
      for (const el of document.querySelectorAll('h1,h2,h3,p,span,a')) {
        const t = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).length;
        if (!t) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 6) continue;
        if (r.top > innerHeight || r.bottom < 0) continue;
        if (!overMedia(el)) continue;
        const s = getComputedStyle(el);
        const size = px(s.fontSize), weight = parseInt(s.fontWeight, 10) || 400;
        out.push({
          text: el.textContent.trim().slice(0, 32),
          color: s.color,
          large: size >= 24 || (size >= 18.66 && weight >= 700),
          box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
        });
      }
      return out;
    });
    if (!targets.length) continue;

    // Hide the text so the screenshot shows only what sits behind it.
    await page.evaluate(() => {
      document.querySelectorAll('h1,h2,h3,p,span,a').forEach(el => { el.style.color = 'transparent'; });
    });
    await page.waitForTimeout(250);
    const shot = await page.screenshot();
    await page.evaluate(() => {
      document.querySelectorAll('h1,h2,h3,p,span,a').forEach(el => { el.style.color = ''; });
    });

    const measured = await page.evaluate(async ({ b64, targets }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const lum = ([r, gg, b]) => {
        const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
        return 0.2126*f(r) + 0.7152*f(gg) + 0.0722*f(b);
      };
      const ratio = (a, b) => { const [x, y] = [a, b].sort((m, n) => n - m); return (x+0.05)/(y+0.05); };
      return targets.map(t => {
        const fg = lum(t.color.match(/\d+/g).slice(0, 3).map(Number));
        let worst = Infinity, at = null;
        for (let y = t.box.y; y < t.box.y + t.box.h; y += 3) {
          for (let x = t.box.x; x < t.box.x + t.box.w; x += 6) {
            if (x < 0 || y < 0 || x >= c.width || y >= c.height) continue;
            const d = g.getImageData(x, y, 1, 1).data;
            const r = ratio(fg, lum([d[0], d[1], d[2]]));
            if (r < worst) { worst = r; at = `${d[0]},${d[1]},${d[2]}`; }
          }
        }
        return { ...t, worst: Math.round(worst * 100) / 100, at };
      });
    }, { b64: shot.toString('base64'), targets });

    for (const m of measured) {
      const need = m.large ? AA_LARGE : AA_SMALL;
      findings.push({ route, panel: i, need, ...m, pass: m.worst >= need });
    }
  }
  await page.close();
}
await browser.close();

const fails = findings.filter(f => !f.pass);
console.log(`Text over photography — ${findings.length} nodes measured against real pixels\n`);
for (const f of findings.sort((a, b) => a.worst - b.worst).slice(0, 12)) {
  console.log(`  ${f.pass ? 'PASS' : 'FAIL'}  ${String(f.worst).padStart(6)}:1  (needs ${f.need})  ${f.route}#${f.panel}  "${f.text}"  worst bg rgb(${f.at})`);
}
console.log(fails.length ? `\n${fails.length} below AA.` : '\nAll text clears AA against its worst pixel.');
process.exit(fails.length ? 1 : 0);
