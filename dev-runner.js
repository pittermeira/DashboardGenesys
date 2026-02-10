import { context } from "esbuild";
import { spawn } from "child_process";

let child;

async function main() {
  const ctx = await context({
    entryPoints: ["server/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    platform: "node",
    packages: "external",
    format: "esm",
    define: {
      "import.meta.dirname": "__dirname",
    },
    banner: {
      js: `import nodePath from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);
`
    },
    plugins: [{
      name: "rebuild-notify",
      setup(build) {
        build.onEnd(result => {
          if (result.errors.length === 0) {
            console.log("⚡ Backend rebuild complete. Restarting server...");
            if (child) child.kill();
            child = spawn("node", ["dist/index.js"], { stdio: "inherit" });
          }
        });
      }
    }]
  });

  await ctx.watch();
  console.log("👀 Watching server for changes...");
}

main();