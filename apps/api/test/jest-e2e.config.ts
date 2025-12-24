import type { JestConfigWithTsJest } from "ts-jest";

import baseConfig from "../jest.config";

const config: JestConfigWithTsJest = {
  ...baseConfig,
  // moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "../",
  // testEnvironment: "node",
  testRegex: ".e2e-spec.ts$",
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
};

module.exports = config;
