import { sveltekit } from "@sveltejs/kit/vite";
import adapterBun from "@sveltejs/adapter-bun";
import adapterVercel from "@sveltejs/adapter-vercel";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig, loadEnv } from "vite";
import process from "process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(process.env.APP_PORT || env.APP_PORT) || 3005;

  return {
    plugins: [
      sveltekit({
        // Vercel mengatur VERCEL=1 saat build; di Jenkins/lokal tetap adapter-bun.
        adapter: process.env.VERCEL
          ? adapterVercel({
              images: {
                sizes: [64, 96, 128, 256, 384, 640, 828, 1080, 1280],
                domains: ["open-api.delcom.org"],
                remotePatterns: [{ protocol: "https", hostname: "open-api.delcom.org" }],
                formats: ["image/avif", "image/webp"],
                minimumCacheTTL: 31536000,
              },
            })
          : adapterBun({
              envPrefix: "APP_",
              precompress: true,
              serverOptions: {
                port: port,
              },
            }),
      }),
      tailwindcss(),
      svelteTesting(),
    ],
    server: {
      port: port,
      host: "0.0.0.0",
    },
    preview: {
      port: port,
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
    define: {
      IMAGE_OPTIMIZER: JSON.stringify(process.env.VERCEL ? "vercel" : ""),
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,ts,svelte}"],
        exclude: [
          "src/app.d.ts",
          "src/env.d.ts",
          "src/setupTests.ts",
          "src/test-utils.ts",
          "**/*.test.{js,ts}",
          "node_modules/**",
          ".svelte-kit/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
