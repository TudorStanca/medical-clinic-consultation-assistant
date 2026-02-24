import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier,
    },
    rules: {
      // bring in the recommended react-hooks rules (flat-friendly)
      ...reactHooks.configs.recommended.rules,

      // Vite/React Fast Refresh rule (commonly used)
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // make Prettier show up as ESLint findings
      "prettier/prettier": "warn",
    },
  },

  // disable ESLint rules that conflict with Prettier (keep last)
  eslintConfigPrettier
);
