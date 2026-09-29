const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const MIME_MAP = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || "application/octet-stream";
}

const bundle = {};

function addFileToBundle(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) return;
  const mime = getMime(fullPath);
  const isBinary = mime.startsWith("image/") || mime === "application/octet-stream";
  const normKey = relPath.replace(/\\/g, "/");

  if (isBinary) {
    const data = fs.readFileSync(fullPath);
    bundle[normKey] = {
      mimeType: mime,
      isBinary: true,
      content: data.toString("base64")
    };
  } else {
    const text = fs.readFileSync(fullPath, "utf-8");
    bundle[normKey] = {
      mimeType: mime,
      isBinary: false,
      content: text
    };
  }
}

function scanDir(dirRel) {
  const fullDir = path.join(ROOT, dirRel);
  if (!fs.existsSync(fullDir)) return;
  for (const item of fs.readdirSync(fullDir)) {
    if (item === ".git" || item === "node_modules" || item === "local-config.js" || item.startsWith(".env") || item.includes("secret")) continue;
    const rel = path.join(dirRel, item);
    const stat = fs.statSync(path.join(ROOT, rel));
    if (stat.isDirectory()) {
      scanDir(rel);
    } else {
      addFileToBundle(rel);
    }
  }
}

console.log("[Bundler] Scanning and bundling files...");
addFileToBundle("index.html");
addFileToBundle("logo_candidates.html");
scanDir("css");
scanDir("js");
scanDir("assets");
scanDir("data");

const bundleJsPath = path.join(ROOT, "static-assets-bundle.js");
fs.writeFileSync(bundleJsPath, "module.exports = " + JSON.stringify(bundle) + ";\n", "utf-8");
console.log(`[Bundler] Wrote ${Object.keys(bundle).length} assets to ${bundleJsPath}`);

// Also copy to public/
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      if (file === "local-config.js" || file.startsWith(".env") || file === ".git") continue;
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });
copyRecursive(path.join(ROOT, "index.html"), path.join(PUBLIC, "index.html"));
copyRecursive(path.join(ROOT, "logo_candidates.html"), path.join(PUBLIC, "logo_candidates.html"));
copyRecursive(path.join(ROOT, "css"), path.join(PUBLIC, "css"));
copyRecursive(path.join(ROOT, "js"), path.join(PUBLIC, "js"));
copyRecursive(path.join(ROOT, "assets"), path.join(PUBLIC, "assets"));
copyRecursive(path.join(ROOT, "data"), path.join(PUBLIC, "data"));

console.log("[Bundler] Synced public/ folder successfully.");
