import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ command, mode }) => {
  const isLibraryBuild = command === 'build' && mode !== 'demo';

  return {
    server: {
      port: 3001,
      strictPort: true,
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: isLibraryBuild
      ? {
          copyPublicDir: false,
          lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'BujetiGlobalSearch',
            formats: ['es', 'cjs'],
            fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
            cssFileName: 'styles',
          },
          rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
              },
            },
          },
        }
      : {
          outDir: 'demo-dist',
        },
  };
});
