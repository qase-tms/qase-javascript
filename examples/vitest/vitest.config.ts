import { defineConfig } from 'vitest/config';
import { VitestQaseReporter } from '../../qase-vitest/src/index';

export default defineConfig({
  test: {
    watch: false,
    reporters: [new VitestQaseReporter()],
    include: ['**/*.test.ts']
  }
});
