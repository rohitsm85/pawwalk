import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  { ignores: ["lib/**", "generated/**"] },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      quotes: ["error", "double"],
      indent: ["error", 2],
    },
  }
);
