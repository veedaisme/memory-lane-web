import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    base: '/',
    define: {
      // Make environment variables available to the client
      'process.env.VITE_APP_BASE_URL': JSON.stringify(env.VITE_APP_BASE_URL || ''),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Disable sourcemap in production to save memory
      sourcemap: mode === 'development',
      // Use esbuild for minification (faster and uses less memory)
      minify: 'esbuild',
      // Increase the size limit for chunks to avoid warnings
      chunkSizeWarningLimit: 1000,
      // Optimize build for memory usage
      rollupOptions: {
        output: {
          // Limit the number of chunks to reduce memory usage
          manualChunks: {
            vendor: [
              'react', 
              'react-dom',
              'react-router-dom',
            ],
          }
        }
      },
      // Reduce memory usage by limiting concurrent tasks
      assetsInlineLimit: 4096, // 4kb
      target: 'es2015', // Older target for better compatibility and smaller bundle
    }
  };
});
