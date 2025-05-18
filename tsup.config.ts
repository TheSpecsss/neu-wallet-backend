import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs"],
	dts: true,
	clean: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	outDir: "dist",
	esbuildOptions(options) {
		options.alias = {
			"@": "./src",
		};
	},
});
