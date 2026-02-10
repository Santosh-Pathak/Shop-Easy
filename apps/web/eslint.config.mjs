import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'

export default [
   js.configs.recommended,
   ...tseslint.configs.recommended,
   {
      ignores: [
         '.next/**/*',
         'out/**/*',
         'public/**/*',
         'node_modules/**/*',
         'dist/**/*',
         'build/**/*',
      ],
   },
   {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: {
         react: reactPlugin,
         'react-hooks': reactHooksPlugin,
         '@next/next': nextPlugin,
      },
      languageOptions: {
         parser: tseslint.parser,
         parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            ecmaFeatures: {
               jsx: true,
            },
         },
         globals: {
            console: 'readonly',
            process: 'readonly',
            Buffer: 'readonly',
            global: 'readonly',
            window: 'readonly',
            document: 'readonly',
            navigator: 'readonly',
            location: 'readonly',
            localStorage: 'readonly',
            sessionStorage: 'readonly',
            fetch: 'readonly',
            React: 'readonly',
         },
      },
      rules: {
         ...reactPlugin.configs.recommended.rules,
         ...reactHooksPlugin.configs.recommended.rules,
         ...nextPlugin.configs.recommended.rules,
         // Disable problematic rules for development
         'react/react-in-jsx-scope': 'off',
         'react/prop-types': 'off', // TypeScript handles prop types
         'react/no-unescaped-entities': 'off', // Disable completely
         '@typescript-eslint/no-unused-vars': 'off', // Disable for now
         '@typescript-eslint/no-explicit-any': 'off', // Disable for now
         '@typescript-eslint/no-require-imports': 'off', // Disable require import warnings
         '@typescript-eslint/no-empty-object-type': 'off', // Disable empty interface warnings
         '@next/next/no-img-element': 'off', // Disable img element warnings
         'no-prototype-builtins': 'off', // Disable prototype builtin warnings
         'no-useless-catch': 'off', // Disable useless catch warnings
         'prefer-const': 'off', // Disable prefer const warnings
         'no-case-declarations': 'off', // Disable case declaration warnings
      },
      settings: {
         react: {
            version: 'detect',
         },
      },
   },
]
