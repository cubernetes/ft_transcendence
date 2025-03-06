import * as esbuild from "esbuild";
import postCssPlugin from "esbuild-style-plugin";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

const isWatch = process.argv.includes("--watch");
// /** @type {import('esbuild').BuildOptions} */

const config = {
  entryPoints: ["./src/scripts/index.ts", "./src/styles/styles.css"],
  bundle: true,
  outdir: "./dist",
  // minify: !isWatch,
  // sourcemap: isWatch,
  // loader: { ".css": "css" },
  plugins: [
    postCssPlugin({
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    }),
  ],
};

if (isWatch) {
  // Watch mode
  esbuild.context(config).then((ctx) => {
    ctx.watch();
    console.log("Watching for changes...");
  });
} else {
  // Build mode
  esbuild.build(config).catch(() => process.exit(1));
}
