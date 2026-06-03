/**
 * Split whimsical wedding sketch PNG into separate SVG files (embedded raster per part).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SOURCE = process.argv[2] ?? "images/Скетчи/whimsical-quirky-wedding-hand-drawn-doodle.png";
const OUT_DIR = process.argv[3] ?? "images/Скетчи";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")),
  "..",
);
const sourcePath = path.isAbsolute(SOURCE) ? SOURCE : path.join(ROOT, SOURCE);
const outDir = path.isAbsolute(OUT_DIR) ? OUT_DIR : path.join(ROOT, OUT_DIR);

function labelComponents(width, height, mask) {
  const labels = new Int32Array(width * height);
  let nextLabel = 1;
  const parent = [0];

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function unite(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  }

  const idx = (x, y) => y * width + x;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[idx(x, y)]) continue;
      const left = x > 0 && mask[idx(x - 1, y)] ? labels[idx(x - 1, y)] : 0;
      const up = y > 0 && mask[idx(x, y - 1)] ? labels[idx(x, y - 1)] : 0;
      if (!left && !up) {
        labels[idx(x, y)] = nextLabel;
        parent[nextLabel] = nextLabel;
        nextLabel++;
      } else if (left && !up) {
        labels[idx(x, y)] = left;
      } else if (!left && up) {
        labels[idx(x, y)] = up;
      } else {
        labels[idx(x, y)] = Math.min(left, up);
        unite(left, up);
      }
    }
  }

  const rootToId = new Map();
  let compact = 1;
  for (let i = 0; i < labels.length; i++) {
    if (!labels[i]) continue;
    const root = find(labels[i]);
    if (!rootToId.has(root)) rootToId.set(root, compact++);
    labels[i] = rootToId.get(root);
  }

  return { labels, labelCount: compact - 1 };
}

function collectRegions(width, height, labels, labelCount, minPixels) {
  const regions = Array.from({ length: labelCount + 1 }, () => ({
    minX: width,
    minY: height,
    maxX: 0,
    maxY: 0,
    count: 0,
    sumX: 0,
    sumY: 0,
  }));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const id = labels[y * width + x];
      if (!id) continue;
      const r = regions[id];
      r.count++;
      r.sumX += x;
      r.sumY += y;
      if (x < r.minX) r.minX = x;
      if (y < r.minY) r.minY = y;
      if (x > r.maxX) r.maxX = x;
      if (y > r.maxY) r.maxY = y;
    }
  }

  return regions
    .map((r, id) => ({ id, ...r }))
    .filter((r) => r.id > 0 && r.count >= minPixels)
    .map((r) => ({
      id: r.id,
      count: r.count,
      cx: r.sumX / r.count,
      cy: r.sumY / r.count,
      minX: r.minX,
      minY: r.minY,
      maxX: r.maxX,
      maxY: r.maxY,
    }));
}

/** Split a merged blob using vertical gaps in the mask. */
function splitByVerticalGaps(region, mask, width, height, minGap = 14, minPart = 800) {
  const w = region.maxX - region.minX + 1;
  const colDensity = new Int32Array(w);
  for (let y = region.minY; y <= region.maxY; y++) {
    for (let x = region.minX; x <= region.maxX; x++) {
      if (mask[y * width + x]) colDensity[x - region.minX]++;
    }
  }

  const gaps = [];
  let gapStart = -1;
  for (let i = 0; i < w; i++) {
    if (colDensity[i] === 0) {
      if (gapStart < 0) gapStart = i;
    } else if (gapStart >= 0 && i - gapStart >= minGap) {
      gaps.push([gapStart, i - 1]);
      gapStart = -1;
    } else if (gapStart >= 0) {
      gapStart = -1;
    }
  }

  if (gaps.length === 0) return [region];

  const cuts = [region.minX, ...gaps.flatMap((g) => [region.minX + g[0], region.minX + g[1] + 1]), region.maxX + 1];
  const parts = [];
  for (let i = 0; i < cuts.length - 1; i += 2) {
    const left = cuts[i];
    const right = cuts[i + 1] - 1;
    if (right - left < 20) continue;

    let minY = height;
    let maxY = 0;
    let count = 0;
    let sumX = 0;
    let sumY = 0;
    for (let y = region.minY; y <= region.maxY; y++) {
      for (let x = left; x <= right; x++) {
        if (!mask[y * width + x]) continue;
        count++;
        sumX += x;
        sumY += y;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (count >= minPart) {
      parts.push({
        count,
        cx: sumX / count,
        cy: sumY / count,
        minX: left,
        minY,
        maxX: right,
        maxY,
      });
    }
  }

  return parts.length > 1 ? parts : [region];
}

function assignName({ cx, cy, minX, maxX, minY, maxY, count }) {
  const w = maxX - minX;
  const h = maxY - minY;

  if (cy < 200 && w > 280) return "03-bokal-shampanskogo-1";
  if (cy < 200 && cx > 1050) return "06-svecha-odna";
  if (cy < 650 && cx < 450) return "02-bant-bolshoy";
  if (cy < 650 && cx > 750 && cx < 980) return "04-bokal-shampanskogo-2";
  if (cy < 650 && cx > 1000 && cx < 1280) return "05-kandelabr";
  if (cy < 650 && cx > 1380 && cx < 1520) return "07-stolovye-pribory";
  if (cy < 650 && cx > 1650) return "08-bokal-malyy-lenta";
  if (cy > 750 && cy < 980 && cx < 420) return "09-serdtsa";
  if (cy > 650 && cy < 820 && cx > 450 && cx < 600) return "11-para-s-buketom";
  if (cy > 820 && cy < 1000 && cx > 620 && cx < 820) return "12-para-portret";
  if (cy > 650 && cy < 820 && cx > 780 && cx < 920) return "13-lenta-volna";
  if (cy > 1100 && cy < 1260 && w > 180 && h < 90) return "01-zagolovok-whimsical-wedding";
  if (cy > 1050 && cx < 700 && count > 80000) return "14-para-s-buketom-bolshaya";
  if (cy > 1280 && w > 500) return "15-lenta-volna-dlinnaya";
  if (cy > 700 && cy < 1150 && cx > 1580 && cy < 900) return "16-ptitsa-1";
  if (cy > 950 && cy < 1200 && cx > 1580) return "17-ptitsa-2";
  if (cy > 1250 && cx > 1580) return "17-ptitsa-2";
  if (cy > 850 && cy < 1100 && cx > 1000 && cx < 1400 && count > 40000) return "10-lenta-banner";
  if (cy > 850 && cy < 1100 && cx > 1000 && cx < 1400) return "18-ptitsa-1";
  return null;
}

function padBox(box, pad, width, height) {
  return {
    left: Math.max(0, box.minX - pad),
    top: Math.max(0, box.minY - pad),
    right: Math.min(width - 1, box.maxX + pad),
    bottom: Math.min(height - 1, box.maxY + pad),
  };
}

async function exportRegion(inputPath, box, name) {
  const w = box.right - box.left + 1;
  const h = box.bottom - box.top + 1;
  const pngBuffer = await sharp(inputPath)
    .extract({ left: box.left, top: box.top, width: w, height: h })
    .png()
    .toBuffer();
  const base64 = pngBuffer.toString("base64");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image width="${w}" height="${h}" xlink:href="data:image/png;base64,${base64}"/>
</svg>`;
  const outPath = path.join(outDir, `${name}.svg`);
  fs.writeFileSync(outPath, svg, "utf8");
  return { outPath, w, h };
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error("Source not found:", sourcePath);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const mask = new Uint8Array(width * height);

  for (let i = 0, p = 0; p < width * height; p++, i += 4) {
    const a = data[i + 3];
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    mask[p] = a > 20 || (r + g + b > 40 && r > g && r > b) ? 1 : 0;
  }

  const { labels, labelCount } = labelComponents(width, height, mask);
  let regions = collectRegions(width, height, labels, labelCount, 500);

  const expanded = [];
  for (const region of regions) {
    if (region.count > 45000 && region.maxX - region.minX > 400) {
      expanded.push(...splitByVerticalGaps(region, mask, width, height));
    } else {
      expanded.push(region);
    }
  }

  const used = new Set();
  const manifest = [];

  for (const region of expanded.sort((a, b) => a.cy - b.cy || a.cx - b.cx)) {
    let name = assignName(region);
    if (!name || used.has(name)) {
      name = `extra-${Math.round(region.cx)}-${Math.round(region.cy)}`;
    }
    used.add(name);

    const box = padBox(region, 28, width, height);
    const result = await exportRegion(sourcePath, box, name);
    manifest.push({
      name,
      ...result,
      cx: Math.round(region.cx),
      cy: Math.round(region.cy),
      pixels: region.count,
    });
    console.log(`  ${name}.svg (${result.w}×${result.h}) @ ${Math.round(region.cx)},${Math.round(region.cy)}`);
  }

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nSaved ${manifest.length} files to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
