#!/usr/bin/env node
/**
 * GitHub Pages 静态导出:临时挪走 app/api(Route Handler 与 output:export 不兼容),
 * 构建结束后再还原,本地 `next dev` 仍可走 DeepSeek 代理。
 */
import { existsSync } from "node:fs";
import { rename } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "src/app/api");
const stashDir = path.join(root, ".api-stash");

async function main() {
  let moved = false;
  try {
    if (existsSync(apiDir)) {
      await rename(apiDir, stashDir);
      moved = true;
    }
    const result = spawnSync("npx", ["next", "build"], {
      stdio: "inherit",
      env: { ...process.env, GITHUB_PAGES: "true" },
      shell: process.platform === "win32",
    });
    process.exitCode = result.status ?? 1;
  } finally {
    if (moved && existsSync(stashDir)) {
      await rename(stashDir, apiDir);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
