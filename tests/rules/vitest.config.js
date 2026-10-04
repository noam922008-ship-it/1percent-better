// Firestore security-rules tests. They need the Firestore emulator, so they are kept
// out of `npm test` and run with `npm run test:rules` (emulators:exec starts it).
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.js'],
    testTimeout: 20000,
    fileParallelism: false,
  },
})
