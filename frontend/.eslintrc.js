module.exports = {
  root: true, // Prevent ESLint from looking for configs higher up the directory tree
  env: {
    browser: true,
    es2021: true,
    node: true, // For config files like vite.config.ts, postcss.config.js etc.
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // For new JSX transform (React 17+)
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended', // Accessibility rules
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Specify project for type-aware linting
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'react-refresh', // From existing dependencies, for Vite specific fast refresh
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  rules: {
    // Basic Custom Rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Can be useful but sometimes too verbose
    'react/prop-types': 'off', // Not needed with TypeScript
    'react/react-in-jsx-scope': 'off', // Handled by new JSX transform

    // react-refresh plugin rules (from existing dependencies)
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // Add any project-specific overrides here
    // Example:
    // 'jsx-a11y/anchor-is-valid': ['error', { // Rule for anchor validity
    //   components: ['Link'],
    //   specialLink: ['to'],
    //   aspects: ['noHref', 'invalidHref', 'preferButton'],
    // }],
  },
  // ignorePatterns moved to .eslintignore
};
