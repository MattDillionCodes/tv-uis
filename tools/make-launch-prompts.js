#!/usr/bin/env node
/*
  Fills prompts/launch-readiness.template.md with each UI's values from config.js
  and writes prompts/launch-<id>.md. Re-run after you edit config.js:
    node tools/make-launch-prompts.js
*/
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "config.js"), "utf8"), sandbox);
const uis = sandbox.window.UIS || [];

const template = fs.readFileSync(path.join(root, "prompts", "launch-readiness.template.md"), "utf8");

for (const ui of uis) {
  const values = {
    ID: ui.id,
    NAME: ui.name,
    INSPIRED_BY: ui.inspiredBy,
    REPO: String(ui.repo).replace(/\/$/, ""),
    APK_NAME: ui.apkName,
    PACKAGE: ui.packageName,
    HOME_ACTIVITY: ui.homeActivity,
    MIN_ANDROID: ui.minAndroid || "9",
  };
  const out = template.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in values ? values[k] : m));
  const file = path.join(root, "prompts", `launch-${ui.id}.md`);
  fs.writeFileSync(file, out);
  console.log("wrote", path.relative(root, file));
}
