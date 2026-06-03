import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const copyItems = [
  "index.html",
  "favicon.svg",
  "favicon-16.png",
  "favicon-32.png",
  "apple-touch-icon.png",
  "css",
  "js",
  "images",
];

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

removeDir(dist);
fs.mkdirSync(dist);

for (const item of copyItems) {
  const src = path.join(root, item);
  if (!fs.existsSync(src)) {
    console.warn(`skip missing: ${item}`);
    continue;
  }
  copyRecursive(src, path.join(dist, item));
}

fs.copyFileSync(path.join(root, ".nojekyll"), path.join(dist, ".nojekyll"));

console.log(`Built ${dist}`);
