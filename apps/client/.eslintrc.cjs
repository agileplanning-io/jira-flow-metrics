module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "plugin:boundaries/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "boundaries"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "no-console": "error",
    "boundaries/element-types": [
      2,
      {
        default: "disallow",
        rules: [
          {
            from: "entities",
            allow: ["entities", "lib"],
          },
          {
            from: "usecases",
            allow: ["entities", "lib", "usecases"],
          },
          {
            from: "data",
            allow: ["entities", "lib", "usecases", "data"],
          },
          {
            from: "app",
            allow: ["entities", "lib", "usecases", "data", "app"],
          },
          {
            from: "main",
            allow: ["app", "data", "main"],
          },
        ],
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    "boundaries/elements": [
      {
        type: "lib",
        pattern: "src/lib",
      },
      {
        type: "entities",
        pattern: "src/domain/entities",
      },
      {
        type: "usecases",
        pattern: ["src/domain/usecases"],
      },
      {
        type: "data",
        pattern: "src/data",
      },
      {
        type: "app",
        pattern: ["src/app"],
      },
      {
        type: "main",
        pattern: ["src/main.tsx", "src/main.css"],
        mode: "file",
      },
      {
        type: "test",
        pattern: ["test"],
      },
    ],
    "boundaries/ignore": [
      "**/*.spec.ts",
      "**/*.e2e-spec.ts",
      "test/**/*",
      "vite.config.ts",
      "src/vite-env.d.ts",
      "src/chartjs.d.ts",
    ],
  },
};
