import { defineConfig } from "vite";

export default defineConfig({
	base: "./", // Fixes broken file:// paths in packaged Electron builds
	server: {
		port: 5173,
		strictPort: true,
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
});
