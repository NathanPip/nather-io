import solid from "solid-start/vite";
import { defineConfig } from "vite";
// @ts-expect-error no typing
import vercel from "solid-start-vercel";
import { svgrComponent } from 'vite-plugin-svgr-component';

export default defineConfig(() => {
  return {
    plugins: [
      solid({ ssr: false, adapter: vercel({ edge: false }) }),
      svgrComponent(),
    ],
  };
});
