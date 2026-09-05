import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const SP = '/tmp/claude-0/-home-user-Product-Website/5b782f97-2058-5a5e-825c-bb9875eaa443/scratchpad';

// Crop to the slot ratio at a chosen vertical focal fraction, then encode
// small enough that ten of them fit comfortably inside one artifact.
async function uri(file, w, ratio, focal = 0.5, q = 68) {
  const src = sharp(`public/images/${file}`);
  const { width, height } = await src.metadata();
  const targetH = Math.round(width / ratio);
  let top = Math.round(height * focal - targetH / 2);
  top = Math.max(0, Math.min(height - Math.min(targetH, height), top));
  const buf = await sharp(`public/images/${file}`)
    .extract({ left: 0, top, width, height: Math.min(targetH, height) })
    .resize(w, null, { withoutEnlargement: true })
    .jpeg({ quality: q, mozjpeg: true })
    .toBuffer();
  return { uri: `data:image/jpeg;base64,${buf.toString('base64')}`, kb: Math.round(buf.length / 1024) };
}

const assets = {
  HERO:  await uri('pavilion-exterior-dusk.png', 1500, 16/9, 0.58, 72),
  PANEL1: await uri('pavilion-exterior-dusk.png', 1280, 16/9, 0.58),
  PANEL2: await uri('courtyard-entry-street.png', 1280, 16/9, 0.62),
  PANEL3: await uri('olive-kitchen-island.png',   1280, 16/9, 0.48),
  CARD1: await uri('pavilion-bathroom.png',   560, 4/5, 0.45),
  CARD2: await uri('courtyard-entry-hall.png', 560, 4/5, 0.42),
  CARD3: await uri('olive-powder-room.png',    560, 4/5, 0.50),
};
for (const [k, v] of Object.entries(assets)) console.log(k.padEnd(8), v.kb + 'KB');
console.log('total', Object.values(assets).reduce((a, b) => a + b.kb, 0) + 'KB');

let h = await readFile(`${SP}/casa-preview.html`, 'utf8');

// Panels and cards: real photographs instead of sampled gradients.
h = h.replace(/\.p1 \.panel__bg\{background:[^}]+\}/,
  `.p1 .panel__bg{background-image:url("${assets.PANEL1.uri}");background-size:cover;background-position:center}`);
h = h.replace(/\.p2 \.panel__bg\{background:[^}]+\}/,
  `.p2 .panel__bg{background-image:url("${assets.PANEL2.uri}");background-size:cover;background-position:center}`);
h = h.replace(/\.p3 \.panel__bg\{background:[^}]+\}/,
  `.p3 .panel__bg{background-image:url("${assets.PANEL3.uri}");background-size:cover;background-position:center}`);
h = h.replace(/\.c1 \.card__bg\{background:[^}]+\}/,
  `.c1 .card__bg{background-image:url("${assets.CARD1.uri}");background-size:cover;background-position:center}`);
h = h.replace(/\.c2 \.card__bg\{background:[^}]+\}/,
  `.c2 .card__bg{background-image:url("${assets.CARD2.uri}");background-size:cover;background-position:center}`);
h = h.replace(/\.c3 \.card__bg\{background:[^}]+\}/,
  `.c3 .card__bg{background-image:url("${assets.CARD3.uri}");background-size:cover;background-position:center}`);

// Match the app's measured scrim so the preview tells the truth about contrast.
h = h.replace(/background:linear-gradient\(180deg,rgba\(20,16,13,\.72\)[^}]+\}/,
`background:linear-gradient(180deg,rgba(20,16,13,.84) 0%,rgba(20,16,13,.74) 18%,
    rgba(20,16,13,.20) 42%,rgba(20,16,13,.26) 58%,rgba(20,16,13,.74) 82%,
    rgba(20,16,13,.90) 100%)}`);

// Give the preview shader the same texture path the app uses, so W.01 runs
// over the real photograph rather than the procedural interior.
h = h.replace("'uniform float uTime;uniform vec2 uRes;uniform vec2 uPointer;',",
  "'uniform float uTime;uniform vec2 uRes;uniform vec2 uPointer;',\n    'uniform sampler2D uTex;uniform float uHasTex;',");
h = h.replace(`    '  vec3 espresso=vec3(0.078,0.063,0.051);',
    '  vec3 coffee=vec3(0.231,0.165,0.129);',
    '  vec3 mahogany=vec3(0.353,0.204,0.157);',
    '  vec3 col=mix(espresso,coffee,smoothstep(0.0,1.0,uv.y));',
    '  col=mix(col,mahogany,smoothstep(0.78,0.12,uv.x)*0.34);',
    '  col+=vec3(0.10,0.08,0.06)*smoothstep(0.86,0.99,uv.x)*smoothstep(0.05,0.70,uv.y);',`,
`    '  vec3 espresso=vec3(0.078,0.063,0.051);',
    '  vec3 coffee=vec3(0.231,0.165,0.129);',
    '  vec3 mahogany=vec3(0.353,0.204,0.157);',
    '  vec3 col;',
    '  if(uHasTex>0.5){ col=texture2D(uTex,vec2(uv.x,1.0-uv.y)).rgb; }',
    '  else {',
    '    col=mix(espresso,coffee,smoothstep(0.0,1.0,uv.y));',
    '    col=mix(col,mahogany,smoothstep(0.78,0.12,uv.x)*0.34);',
    '    col+=vec3(0.10,0.08,0.06)*smoothstep(0.86,0.99,uv.x)*smoothstep(0.05,0.70,uv.y);',
    '  }',`);
h = h.replace(`    var uT=gl.getUniformLocation(pr,'uTime'),
        uR=gl.getUniformLocation(pr,'uRes'),
        uP=gl.getUniformLocation(pr,'uPointer');`,
`    var uT=gl.getUniformLocation(pr,'uTime'),
        uR=gl.getUniformLocation(pr,'uRes'),
        uP=gl.getUniformLocation(pr,'uPointer'),
        uHT=gl.getUniformLocation(pr,'uHasTex'),
        uTx=gl.getUniformLocation(pr,'uTex');
    gl.uniform1f(uHT,0.0);
    gl.uniform1i(uTx,0);
    // Non-power-of-two texture: clamp and use LINEAR, no mipmaps.
    var tex=gl.createTexture();
    var heroImg=new Image();
    heroImg.onload=function(){
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,heroImg);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.uniform1f(uHT,1.0);
    };
    heroImg.src=HERO_SRC;`);
// The hero ground also carries the photograph, so T2/T3 shows it too.
h = h.replace('<div class="lf__ground"></div>',
  `<div class="lf__ground" style="background-image:url('${assets.HERO.uri}');background-size:cover;background-position:center 58%"></div>`);
h = h.replace('<script>\n(function(){', `<script>\nvar HERO_SRC="${assets.HERO.uri}";\n(function(){`);
h = h.replace('IM.01 · procedural placeholder · awaiting photography',
              'Pavilion House · Lagos · W.01 light-fall over the photograph');
h = h.replace('<b>gradients sampled from your references</b> — each is an image slot',
              '<b>real photography</b> — W.01 shader running over the hero');
h = h.replace('PREVIEW &middot; REV B', 'PREVIEW &middot; REV C');

await writeFile(`${SP}/casa-preview.html`, h);
console.log('preview size', Math.round(Buffer.byteLength(h) / 1024) + 'KB');
