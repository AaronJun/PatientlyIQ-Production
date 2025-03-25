import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const directoryImportPlugin = () => {
	return {
	  name: 'vite-plugin-directory-import',
	  resolveId(source, importer) {
		if (source.includes('@xyflow/svelte/dist/lib/container/SvelteFlow')) {
		  // Replace the directory import with a file import
		  return resolve(__dirname, 'node_modules/@xyflow/svelte/dist/lib/container/SvelteFlow/index.js');
		}
		return null;
	  }
	};
};

// Plugin to handle markdown imports
const markdownPlugin = () => {
  return {
    name: 'vite-plugin-markdown',
    transform(code, id) {
      if (id.endsWith('.md')) {
        // For ?raw imports, return the content as a string
        if (id.includes('?raw')) {
          return `export default ${JSON.stringify(code)};`;
        }
      }
      return null;
    }
  };
};  

export default defineConfig({
	plugins: [
		directoryImportPlugin(),
		markdownPlugin(),
		sveltekit()
	],

	resolve: {
		preserveSymlinks: true, // Sometimes helps with import resolution
		// Add mainFields to prioritize certain module formats
		mainFields: ['svelte', 'browser', 'module', 'main']
	},
	optimizeDeps: {
		include: [
			'@xyflow/svelte',
			'zwitch',
			'hast-util-to-html',
			'property-information',
			'unist-util-is'
		]
	}
	// optimizeDeps:{
	// 	disabled: 'dev',
	// 	noDiscovery: true,
	// }
});

