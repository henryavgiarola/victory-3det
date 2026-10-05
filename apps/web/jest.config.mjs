/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["/.next/"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          strict: true,
          module: "commonjs",
          moduleResolution: "node",
          target: "ES2022",
          isolatedModules: true,
          skipLibCheck: true,
        },
      },
    ],
  },
};
