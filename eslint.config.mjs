import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettier,
  {
    ignores: ["**/dist/**", "**/dist/**", "**/.generated/**", "**/node_modules/**", "Legal-NyayaConnect/frontend/mockup-sandbox/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { console: "readonly", process: "readonly", Buffer: "readonly", URL: "readonly", setTimeout: "readonly", self: "readonly", clients: "readonly" },
    },
  },
];
