import type { NextConfig } from "next";

// GitHub Pages 子路径部署时打开;本地 / CI 常规构建保持无 basePath,E2E 不受影响。
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // Pages 只托管静态文件;本地 `next dev` 仍可用 /api/narrate(需另开非 export 构建才 `next start`)。
  ...(isGitHubPages
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
  basePath: isGitHubPages ? "/yiju" : "",
  assetPrefix: isGitHubPages ? "/yiju/" : "",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/yiju" : "",
  },
};

export default nextConfig;
