import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import path from "path";

// Get the directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./", // Make all asset URLs relative instead of absolute
  server: {
    open: true,
  },
  build: {
    assetsDir: "assets", // Control where assets are placed
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        play: path.resolve(__dirname, "play.html"),
      },
    },
  },
});
