import typescript from "rollup-plugin-typescript";

export default {
  input: "main.ts",
  external: ["@slye/core", "THREE"],
  output: [{
    file: "dist/main.js",
    format: "iife",
    name: "SlyeModule",
    globals: {
      "@slye/core": "slye"
    }
  }],
  plugins: [typescript()]
};
