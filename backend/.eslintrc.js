module.exports = {
  env: {
    browser: false, // Not a browser environment
    commonjs: true,
    es2021: true, // or a newer version like es2022, es2023
    node: true,
    jest: true, // Assuming Jest is used for tests (it's in devDependencies)
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    // 'plugin:security/recommended', // Temporarily remove to see if it resolves the parsing error
  ],
  parserOptions: {
    ecmaVersion: 'latest', // Use the latest ECMAScript features
  },
  plugins: [
    'node',
    'security',
  ],
  rules: {
    // Basic Custom Rules (can be expanded)
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Warn in prod, allow in dev
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn for unused vars, ignore if prefixed with _
    'node/no-unpublished-require': 'off', // Often too noisy for scripts/tests if not configured carefully
    'node/no-missing-require': 'error', // Important for Node.js projects

    // Security specific rules (can be fine-tuned)
    // Example: 'security/detect-object-injection': 'warn', (already included in recommended)

    // Add any project-specific overrides here
    // e.g. if your project uses a specific style guide or has particular needs.
    "node/no-unsupported-features/es-syntax": ["error", {
      "version": ">=18.0.0", // Match Node.js version in package.json
      "ignores": []
    }]
  },
  overrides: [
    {
      files: ['src/migrations/**', 'src/seeds/**'], // Knex migration and seed files
      rules: {
        'node/no-unpublished-require': 'off', // Allow require for knex in these files
      },
    },
    {
      files: ['src/tests/**/*.js', '*.test.js'], // Test files
      rules: {
        'node/no-unpublished-require': 'off', // Allow devDependencies in tests
      }
    }
  ]
};
