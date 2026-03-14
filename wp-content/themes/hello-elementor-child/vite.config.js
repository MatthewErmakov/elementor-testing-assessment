import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: 'assets',
		emptyOutDir: false,
		assetsDir: '',
		rollupOptions: {
			input: {
				admin: path.resolve(__dirname, 'src/admin.tsx')
			},
			output: {
				format: 'iife',
				name: 'HelloElChildProductsAdmin',
				entryFileNames: 'admin.js',
				assetFileNames: (assetInfo) => {
					if (assetInfo.name === 'admin.css') {
						return 'admin.css';
					}
					return '[name][extname]';
				}
			}
		}
	}
});
