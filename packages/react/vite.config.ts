import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KreatiReact',
      formats: ['es', 'umd'],
      fileName: format => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@kreatiware/icons'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@kreatiware/icons': 'KreatiIcons',
        },
      },
    },
  },
});