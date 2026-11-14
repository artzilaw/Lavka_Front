import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error"
    }
  },
  {
    files: ["server/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-console": "off"
    }
  },
  {
    files: ["src/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        Handlebars: "readonly",
        apiClient: "readonly",
        API_ENDPOINTS: "readonly",
        AuthService: "readonly",
        AuthValidator: "readonly",
        AdsService: "readonly",
        Storage: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": ["warn", { allow: ["error", "warn"] }]
    }
  },
  {
    ignores: ["node_modules/", "public/"]
  }
];
