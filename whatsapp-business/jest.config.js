/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/db/migrate.ts",
    "!src/db/seed.ts"
  ],
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }]
  }
};
