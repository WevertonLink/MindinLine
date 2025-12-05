module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Produção - Sem console.log em produção
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // React/React Native
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'error',

    // Code Quality
    'no-debugger': 'error',
    'no-alert': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',

    // Performance
    'react/jsx-no-bind': ['warn', {
      allowArrowFunctions: true,
      allowBind: false,
      ignoreRefs: true
    }],
  },
  overrides: [
    {
      // Disable console.log warning in development files
      files: ['*.test.ts', '*.test.tsx', '__tests__/**/*'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
