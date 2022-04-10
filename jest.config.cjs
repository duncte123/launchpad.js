/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: 'node',

  // Necessary for ESM support (maps the .js imports to the correct .ts files)
  preset: 'ts-jest/presets/default-esm', // or other ESM presets
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
