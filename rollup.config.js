import * as path from "path";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript";
import commonjs from "rollup-plugin-commonjs";
import globals from "rollup-plugin-node-globals";
import sass from "rollup-plugin-sass";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

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
    input: "ui/renderer.tsx",
    output: [{
      file: "dist/renderer.js",
      format: "iife",
      //sourcemap: "inline"
    }],
    plugins: [
      typescript(),
      resolve(),
      commonjs({
        include: 'node_modules/**',  // Default: undefined
        namedExports: { './node_modules/react/index.js': ['Component'] },
      }),
      sass({
        include: [ '**/*.css', '**/*.scss' ],
        options: {
          includePaths: [path.resolve('node_modules')]
        }
      }),
      globals(),
      serve({
        contentBase: ["dist", "dist/static"]
      }),
      livereload()
    ]
  }
];
