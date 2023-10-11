/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['./dist'],
  runner: 'groups',
  setupFiles: ['dotenv/config'],
};
