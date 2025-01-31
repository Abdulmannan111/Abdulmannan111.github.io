import adapter from '@sveltejs/adapter-static';
import path from 'path';

const config = {
	extensions: ['.svelte'],

	kit: {
		adapter: adapter(),
		target: '#svelte',
		paths:{
			base: process.env.NODE_ENV === 'production'?'/Abdulmannan111.github.io':'',
		},
		prerender: {
			entries: ['*', '/contact-success'],
		},

		vite: {
			resolve: {
				alias: {
					'@content': path.resolve('./content')
				}
			}
		}
	}
};

export default config;
