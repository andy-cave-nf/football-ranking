// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import vitest from '@vitest/eslint-plugin'

export default defineConfig({
    files: ['tests/**'],
    plugins: {
        vitest,
    },
    rules: {
        ...vitest.configs.recommended.rules,
    },
},
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettierConfig,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {"argsIgnorePattern": "^_"}
            ]
        }
    }
)