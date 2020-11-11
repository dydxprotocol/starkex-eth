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
  },
};
