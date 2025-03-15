import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@verde/react',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
  },
  plugins: [
    dts({
      outDir: resolve(__dirname, 'dist'),
      entryRoot: resolve(__dirname, 'src'),
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
});
