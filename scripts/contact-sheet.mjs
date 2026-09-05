import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
const dir = 'public/images';
const files = (await readdir(dir)).filter(f=>f.endsWith('.png')).sort();
const CELL = 400, COLS = 5, ROWS = 2;
const cells = [];
for (let i=0;i<files.length;i++){
  const buf = await sharp(`${dir}/${files[i]}`)
    .resize(CELL, CELL, { fit:'contain', background:{r:10,g:8,b:6} })
    .toBuffer();
  const label = Buffer.from(
    `<svg width="${CELL}" height="46"><rect width="${CELL}" height="46" fill="#000"/>
     <text x="12" y="32" font-family="monospace" font-size="26" fill="#fff">${i+1}  ${files[i].match(/(\d\d_\d\d_\d\d) PM/)?.[1] ?? ''}</text></svg>`);
  const cell = await sharp({create:{width:CELL,height:CELL+46,channels:3,background:{r:10,g:8,b:6}}})
    .composite([{input:buf,top:0,left:0},{input:label,top:CELL,left:0}]).png().toBuffer();
  cells.push(cell);
}
const H = CELL+46;
await sharp({create:{width:CELL*COLS,height:H*ROWS,channels:3,background:{r:10,g:8,b:6}}})
  .composite(cells.map((input,i)=>({input,top:Math.floor(i/COLS)*H,left:(i%COLS)*CELL})))
  .jpeg({quality:82}).toFile('/tmp/contact-sheet.jpg');
console.log(files.map((f,i)=>`${i+1}. ${f}`).join('\n'));
