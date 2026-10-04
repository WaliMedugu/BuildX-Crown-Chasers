const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mdPath = path.join(__dirname, '..', 'KILIKORO_PITCH_AND_JUDGING_DOSSIER.md');
const outPdf1 = path.join(__dirname, '..', 'KILIKORO_PITCH_AND_JUDGING_DOSSIER.pdf');
const outPdf2 = path.join(__dirname, '..', '..', 'Kilikoro', 'KILIKORO_PITCH_AND_JUDGING_DOSSIER.pdf');

const mdContent = fs.readFileSync(mdPath, 'utf8');

// Basic Markdown to HTML converter
function markdownToHtml(md) {
  let html = md;

  // Escape HTML tags except what we generate
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1 class="doc-title">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="section-title">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="subsection-title">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="minor-title">$1</h4>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="divider"/>');

  // Blockquotes
  html = html.replace(/^&gt;\s?"?(.*?)"?$/gim, '<blockquote><p>"$1"</p></blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Paragraphs
  const lines = html.split('\n');
  const processed = [];
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inBlockquote) {
        processed.push('</blockquote>');
        inBlockquote = false;
      }
      processed.push('');
      continue;
    }

    if (line.startsWith('<blockquote>')) {
      inBlockquote = true;
      processed.push(line);
    } else if (line.endsWith('</blockquote>')) {
      inBlockquote = false;
      processed.push(line);
    } else if (line.startsWith('<h1') || line.startsWith('<h2') || line.startsWith('<h3') || line.startsWith('<h4') || line.startsWith('<hr')) {
      if (inBlockquote) {
        processed.push('</blockquote>');
        inBlockquote = false;
      }
      processed.push(line);
    } else if (inBlockquote) {
      processed.push(line);
    } else {
      processed.push(`<p>${line}</p>`);
    }
  }

  if (inBlockquote) {
    processed.push('</blockquote>');
  }

  return processed.join('\n');
}

const bodyHtml = markdownToHtml(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kilikoro Protocol - Pitch & Judging Dossier</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap');

    @page {
      size: A4 portrait;
      margin: 20mm 18mm 20mm 18mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 9pt;
        color: #7A5C4A;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10.5pt;
      line-height: 1.65;
      color: #2A1F17;
      background-color: #FAF6F0;
      margin: 0;
      padding: 0;
    }

    .doc-title {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 24pt;
      font-weight: 600;
      color: #1A110A;
      margin-top: 0;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 2px solid #C4724A;
      letter-spacing: -0.02em;
    }

    .section-title {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 16pt;
      font-weight: 600;
      color: #C4724A;
      margin-top: 24pt;
      margin-bottom: 8pt;
      padding-bottom: 4pt;
      border-bottom: 1px solid #E8DDD0;
      page-break-after: avoid;
    }

    .subsection-title {
      font-family: 'Inter', sans-serif;
      font-size: 12pt;
      font-weight: 700;
      color: #2A1F17;
      margin-top: 16pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }

    .minor-title {
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
      font-weight: 600;
      color: #5C3D2E;
      margin-top: 12pt;
      margin-bottom: 4pt;
      page-break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 8pt;
      text-align: justify;
    }

    blockquote {
      background-color: #FDF9F4;
      border-left: 3.5px solid #C4724A;
      margin: 10pt 0;
      padding: 10pt 14pt;
      border-radius: 0 6px 6px 0;
      box-shadow: 0 1px 3px rgba(42, 31, 23, 0.05);
      page-break-inside: avoid;
    }

    blockquote p {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 11pt;
      font-style: italic;
      color: #1A110A;
      line-height: 1.6;
      margin: 0;
      text-align: left;
    }

    hr.divider {
      border: 0;
      height: 1px;
      background: #E8DDD0;
      margin: 16pt 0;
    }

    strong {
      font-weight: 600;
      color: #1A110A;
    }

    em {
      font-style: italic;
    }

    .header-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: #E8DDD0;
      color: #5C3D2E;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="header-badge">BuildX 2026 Innovation Challenge • Team Crown Chasers</div>
  ${bodyHtml}
</body>
</html>`;

const tempHtmlPath = path.join(__dirname, 'temp_dossier.html');
fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

// Locate browser
let browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (!fs.existsSync(browserPath)) {
  browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

console.log(`[PDF Generator] Using browser: ${browserPath}`);
console.log(`[PDF Generator] Generating PDF from: ${tempHtmlPath}`);

try {
  const cmd = `"${browserPath}" --headless=new --disable-gpu --print-to-pdf="${outPdf1}" --no-pdf-header-footer "file:///${tempHtmlPath.replace(/\\\\/g, '/')}"`;
  execSync(cmd);
  console.log(`[PDF Generator] Successfully created: ${outPdf1}`);

  if (fs.existsSync(outPdf1)) {
    fs.copyFileSync(outPdf1, outPdf2);
    console.log(`[PDF Generator] Successfully synchronized copy to: ${outPdf2}`);
  }

  // Cleanup temp HTML
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
} catch (err) {
  console.error('[PDF Generator] Error:', err.message);
}
