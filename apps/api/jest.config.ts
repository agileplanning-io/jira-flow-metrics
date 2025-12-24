import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  verbose: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@app/(.*)$": ["<rootDir>/src/app/$1"],
    "^@data/(.*)$": ["<rootDir>/src/data/$1"],
    "^@entities/(.*)$": ["<rootDir>/src/domain/entities/$1"],
    "^@usecases/(.*)$": ["<rootDir>/src/domain/usecases/$1"],
    "^@lib/(.*)$": ["<rootDir>/src/lib/$1"],
    "^@fixtures/(.*)$": ["<rootDir>/test/fixtures/$1"],
  },
};

export default config;
