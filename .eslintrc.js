module.exports = {
  extends: './node_modules/@dydxprotocol/node-service-base-dev/.eslintrc.js',

  // Override the base configuration to set the correct tsconfigRootDir.
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'no-param-reassign': 0,
    // These lint checks triggered for https://linear.app/dydx/issue/BAC-2265
    // Ignore them for now since we violate them across the codebase too often
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
