import * as path from "path";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript";
import sass from "rollup-plugin-sass";

export default [
  {
    input: "ui/main.ts",
    external: ["electron", "electron-reloader", "path", "url"],
    output: [{ file: "dist/main.js", format: "cjs" }],
    plugins: [typescript()]
  },
  {
    input: "ui/preload.ts",
    external: ["electron", "electron-reloader", "path", "url"],
    output: [{ file: "dist/preload.js", format: "cjs" }],
    plugins: [typescript()]
  },
  {
    input: "ui/renderer.ts",
    output: [{ file: "dist/renderer.js", format: "iife" }],
    plugins: [
      typescript(),
      resolve(),
      sass({
        include: [ '**/*.css', '**/*.scss' ],
        options: {
          includePaths: [path.resolve('node_modules')]
        }
      })
    ]
  }
];
