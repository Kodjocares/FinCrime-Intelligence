import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { window: true, document: true, console: true, fetch: true, localStorage: true, setTimeout: true, setInterval: true, clearInterval: true, URL: true, Blob: true, Math: true, Date: true, String: true, Array: true, Object: true, JSON: true, parseInt: true, parseFloat: true, Boolean: true },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
]
