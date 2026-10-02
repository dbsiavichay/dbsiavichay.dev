// Lists every fact still waiting for confirmation: the literal marker
// "TODO: CONFIRM WITH DENIS" and every `pending(...)` call under src/.
//
//   npm run content:pending              human-readable list
//   npm run content:pending -- --github  GitHub Actions warning annotations
//
// It never fails: pending facts are hidden in production, so they don't block
// a deploy, but CI keeps them visible until each one is confirmed.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const MARKER = ["TODO", "CONFIRM WITH DENIS"].join(": ");
const IGNORE_FILE = "content-pending: ignore-file";
const EXTENSIONS = new Set([".ts", ".tsx", ".mdx", ".md", ".json"]);
const github = process.argv.includes("--github");

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.has(path.extname(entry.name))) yield full;
  }
}

const findings = [];
for (const file of walk("src")) {
  const text = readFileSync(file, "utf8");
  if (text.includes(IGNORE_FILE)) continue;
  text.split("\n").forEach((line, index) => {
    if (line.includes(MARKER) || /\bpending\(/.test(line)) {
      findings.push({ file, line: index + 1, text: line.trim() });
    }
  });
}

if (findings.length === 0) {
  console.log("No pending facts. Everything on the site is confirmed.");
  process.exit(0);
}

for (const { file, line, text } of findings) {
  if (github) {
    console.log(
      `::warning file=${file},line=${line},title=Pending confirmation::${text}`,
    );
  } else {
    console.log(`${file}:${line}  ${text}`);
  }
}
console.log(
  `\n${findings.length} pending fact(s). They are hidden in production until confirmed.`,
);
