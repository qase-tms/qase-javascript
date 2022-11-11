import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            provider: 'istanbul', // or 'c8'
            reporter: ['text', 'json', 'html'],
        },
        exclude: [...configDefaults.exclude, 'examples', 'test/__mock__'],
        setupFiles: ['./test/__mock__/setup-env.ts'],
    }
})