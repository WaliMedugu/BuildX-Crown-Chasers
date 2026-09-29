const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

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

console.log("[Build] Preparing public/ directory for Vercel...");
if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });

// Copy static assets
copyRecursive(path.join(ROOT, "index.html"), path.join(PUBLIC, "index.html"));
copyRecursive(path.join(ROOT, "logo_candidates.html"), path.join(PUBLIC, "logo_candidates.html"));
copyRecursive(path.join(ROOT, "css"), path.join(PUBLIC, "css"));
copyRecursive(path.join(ROOT, "js"), path.join(PUBLIC, "js"));
copyRecursive(path.join(ROOT, "assets"), path.join(PUBLIC, "assets"));
copyRecursive(path.join(ROOT, "data"), path.join(PUBLIC, "data"));

console.log("[Build] public/ successfully built for zero-config Vercel static CDN serving.");
