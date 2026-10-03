// Regenerates the Geist subsets in src/fonts/ from the `geist` package: only
// the characters listed in src/fonts/subset.json, with the weight axis and
// every OpenType feature kept. Run it after upgrading `geist` or widening the
// ranges; a unit test fails when the site writes a character they leave out.
//
//   pip install fonttools brotli    # provides pyftsubset
//   node scripts/subset-fonts.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const config = JSON.parse(readFileSync("src/fonts/subset.json", "utf8"));
const sourceDir = path.join("node_modules", config.source, "dist", "fonts");

for (const [source, output] of Object.entries(config.fonts)) {
  const target = path.join("src", "fonts", output);
  execFileSync(
    "pyftsubset",
    [
      path.join(sourceDir, source),
      `--unicodes=${config.unicodes.join(",")}`,
      "--layout-features=*",
      "--flavor=woff2",
      `--output-file=${target}`,
    ],
    { stdio: "inherit" },
  );
  const kb = (statSync(target).size / 1024).toFixed(1);
  console.log(`${target}: ${kb} KB`);
}
