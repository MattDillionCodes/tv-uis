#!/usr/bin/env node
/* Bundles the site into one self-contained HTML body (dist/preview.html) for a hosted preview. */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

const html = read("index.html");
const body = html.slice(html.indexOf("<body>") + 6, html.indexOf("<noscript>")).trim();
const fonts = (html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]+>/) || [""])[0];

const out = `<title>MDS TV UIs</title>
${fonts}
<style>
${read("styles.css")}
</style>
${body}
<script>
window.ARTIFACT_MODE = true;
${read("config.js")}
${read("setup-data.js")}
${read("app.js")}
</script>
`;
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "preview.html"), out);
console.log("wrote dist/preview.html", out.length, "bytes");
