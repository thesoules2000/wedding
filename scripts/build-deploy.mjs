import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJs } from "terser";
import CleanCSS from "clean-css";
import JavaScriptObfuscator from "javascript-obfuscator";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const copyOnly = [
  "favicon.svg",
  "favicon-16.png",
  "favicon-32.png",
  "apple-touch-icon.png",
  "images",
];

const JS_BUNDLE = "js/app.min.js";
const CSS_OUT = "css/styles.min.css";

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

async function buildCss() {
  const src = path.join(root, "css", "styles.css");
  const result = new CleanCSS({ level: 2 }).minify(
    fs.readFileSync(src, "utf8")
  );
  if (result.errors.length) {
    throw new Error(`CSS minify: ${result.errors.join("; ")}`);
  }
  const outPath = path.join(dist, CSS_OUT);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, result.styles);
}

async function buildJsBundle() {
  const config = fs.readFileSync(path.join(root, "js", "config.js"), "utf8");
  const main = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");
  const combined = `${config}\n${main}`;

  const minified = await minifyJs(combined, {
    compress: true,
    mangle: true,
    format: { comments: false },
  });
  if (!minified.code) {
    throw new Error("JS minify produced empty output");
  }

  const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.4,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    reservedNames: ["^WEDDING_CONFIG$"],
    reservedStrings: ["WEDDING_CONFIG"],
    selfDefending: false,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.75,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
  });

  const outPath = path.join(dist, JS_BUNDLE);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, obfuscated.getObfuscatedCode());
}

async function buildHtml() {
  let html = fs.readFileSync(path.join(root, "index.html"), "utf8");

  html = html.replace(
    /<link rel="stylesheet" href="css\/styles\.css">/,
    `<link rel="stylesheet" href="${CSS_OUT}">`
  );
  html = html.replace(
    /\s*<script src="js\/config\.js"><\/script>\s*<script src="js\/main\.js"><\/script>/,
    `\n  <script src="${JS_BUNDLE}" defer></script>`
  );

  const minified = await minifyHtml(html, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    removeOptionalTags: false,
    minifyCSS: false,
    minifyJS: false,
  });

  fs.writeFileSync(path.join(dist, "index.html"), minified);
}

removeDir(dist);
fs.mkdirSync(dist);

for (const item of copyOnly) {
  const src = path.join(root, item);
  if (!fs.existsSync(src)) {
    console.warn(`skip missing: ${item}`);
    continue;
  }
  copyRecursive(src, path.join(dist, item));
}

fs.copyFileSync(path.join(root, ".nojekyll"), path.join(dist, ".nojekyll"));

await buildCss();
await buildJsBundle();
await buildHtml();

console.log(`Built ${dist} (minified HTML/CSS, obfuscated JS bundle)`);
