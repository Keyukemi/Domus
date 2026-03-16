import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        jsx: "react-jsx",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css)$": "<rootDir>/__tests__/__mocks__/styleMock.ts",
    "^next/image$": "<rootDir>/__tests__/__mocks__/nextImage.tsx",
    "^next/link$": "<rootDir>/__tests__/__mocks__/nextLink.tsx",
    "^next/navigation$": "<rootDir>/__tests__/__mocks__/nextNavigation.ts",
  },
  setupFiles: ["<rootDir>/__tests__/setup.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
};

export default config;
