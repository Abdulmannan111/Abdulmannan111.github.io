import { respond } from '@sveltejs/kit/ssr';
import root from './generated/root.svelte';
import { set_paths, assets } from './runtime/paths.js';
import { set_prerendering } from './runtime/env.js';
import * as user_hooks from "./hooks.js";

const template = ({ head, body }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n\t<meta charset=\"utf-8\" />\n\t<link rel=\"icon\" href=\"/images/file.png\" />\n\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n\t" + head + "\n</head>\n\n<body>\n\t<div id=\"svelte\">" + body + "</div>\n</body>\n\n</html>";

let options = null;

const default_settings = { paths: {"base":"","assets":""} };

// allow paths to be overridden in svelte-kit preview
// and in prerendering
export function init(settings = default_settings) {
	set_paths(settings.paths);
	set_prerendering(settings.prerendering || false);

	const hooks = get_hooks(user_hooks);

	options = {
		amp: false,
		dev: false,
		entry: {
			file: assets + "/_app/start-26382fc9.js",
			css: [assets + "/_app/assets/start-61d1577b.css"],
			js: [assets + "/_app/start-26382fc9.js",assets + "/_app/chunks/vendor-fb0024c4.js",assets + "/_app/chunks/preload-helper-ec9aa979.js"]
		},
		fetched: undefined,
		floc: false,
		get_component_path: id => assets + "/_app/" + entry_lookup[id],
		get_stack: error => String(error), // for security
		handle_error: (error, request) => {
			hooks.handleError({ error, request });
			error.stack = options.get_stack(error);
		},
		hooks,
		hydrate: true,
		initiator: undefined,
		load_component,
		manifest,
		paths: settings.paths,
		prerender: true,
		read: settings.read,
		root,
		service_worker: null,
		router: true,
		ssr: true,
		target: "#svelte",
		template,
		trailing_slash: "never"
	};
}

// input has already been decoded by decodeURI
// now handle the rest that decodeURIComponent would do
const d = s => s
	.replace(/%23/g, '#')
	.replace(/%3[Bb]/g, ';')
	.replace(/%2[Cc]/g, ',')
	.replace(/%2[Ff]/g, '/')
	.replace(/%3[Ff]/g, '?')
	.replace(/%3[Aa]/g, ':')
	.replace(/%40/g, '@')
	.replace(/%26/g, '&')
	.replace(/%3[Dd]/g, '=')
	.replace(/%2[Bb]/g, '+')
	.replace(/%24/g, '$');

const empty = () => ({});

const manifest = {
	assets: [{"file":"images/apple-touch-icon.png","size":783,"type":"image/png"},{"file":"images/clients/cause.jpg","size":544026,"type":"image/jpeg"},{"file":"images/clients/edition.png","size":208242,"type":"image/png"},{"file":"images/clients/frisco.jpg","size":413010,"type":"image/jpeg"},{"file":"images/clients/hydra.png","size":85844,"type":"image/png"},{"file":"images/clients/justice.jpg","size":291577,"type":"image/jpeg"},{"file":"images/clients/malt.jpg","size":472771,"type":"image/jpeg"},{"file":"images/clients/urban.png","size":138045,"type":"image/png"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.07.24 PM.jpeg","size":64104,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.10.49 PM.jpeg","size":60827,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.26.33 PM.jpeg","size":26118,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.27.33 PM.jpeg","size":1858805,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.28.08 PM.jpeg","size":28347,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.29.59 PM.jpeg","size":95864,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.31.16 PM.jpeg","size":21823,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.33.25 PM.jpeg","size":92826,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.34.05 PM.jpeg","size":36407,"type":"image/jpeg"},{"file":"images/clients/WhatsApp Image 2024-11-30 at 3.36.17 PM.jpeg","size":377614,"type":"image/jpeg"},{"file":"images/cloudcannon-logo-blue.svg","size":5056,"type":"image/svg+xml"},{"file":"images/favicon.png","size":480,"type":"image/png"},{"file":"images/file.png","size":448865,"type":"image/png"},{"file":"images/logo.svg","size":1688,"type":"image/svg+xml"},{"file":"images/pattern.png","size":33702,"type":"image/png"},{"file":"images/pixel.jpeg","size":56474,"type":"image/jpeg"},{"file":"images/screenshot-buttons.svg","size":194,"type":"image/svg+xml"},{"file":"images/svelte-horizontal.png","size":43636,"type":"image/png"},{"file":"images/touch-icon.png","size":813,"type":"image/png"}],
	layout: "src/routes/__layout.svelte",
	error: "src/routes/__error.svelte",
	routes: [
		{
						type: 'endpoint',
						pattern: /^\/index\.json$/,
						params: empty,
						load: () => import("..\\..\\src\\routes\\index.json.js")
					},
		{
						type: 'page',
						pattern: /^\/$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/portfolio\.json$/,
						params: empty,
						load: () => import("..\\..\\src\\routes\\portfolio.json.js")
					},
		{
						type: 'endpoint',
						pattern: /^\/sitemap\.xml$/,
						params: empty,
						load: () => import("..\\..\\src\\routes\\sitemap.xml.js")
					},
		{
						type: 'endpoint',
						pattern: /^\/about\.json$/,
						params: empty,
						load: () => import("..\\..\\src\\routes\\about.json.js")
					},
		{
						type: 'endpoint',
						pattern: /^\/blog\.json$/,
						params: empty,
						load: () => import("..\\..\\src\\routes\\blog.json.js")
					},
		{
						type: 'page',
						pattern: /^\/portfolio\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/portfolio.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/feed\.xml$/,
						params: empty,
						load: () => import("..\\..\\src\\routes\\feed.xml.js")
					},
		{
						type: 'endpoint',
						pattern: /^\/clients\/([^/]+?)\.json$/,
						params: (m) => ({ client: d(m[1])}),
						load: () => import("..\\..\\src\\routes\\clients\\[client].json.js")
					},
		{
						type: 'page',
						pattern: /^\/clients\/([^/]+?)\/?$/,
						params: (m) => ({ client: d(m[1])}),
						a: ["src/routes/__layout.svelte", "src/routes/clients/[client].svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/contact\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/contact.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/about\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/blog\/([^/]+?)\.json$/,
						params: (m) => ({ slug: d(m[1])}),
						load: () => import("..\\..\\src\\routes\\blog\\[slug].json.js")
					},
		{
						type: 'page',
						pattern: /^\/blog\/([^/]+?)\/?$/,
						params: (m) => ({ slug: d(m[1])}),
						a: ["src/routes/__layout.svelte", "src/routes/blog/[slug].svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/blog\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/blog.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'endpoint',
						pattern: /^\/([^/]+?)\.json$/,
						params: (m) => ({ slug: d(m[1])}),
						load: () => import("..\\..\\src\\routes\\[slug].json.js")
					},
		{
						type: 'page',
						pattern: /^\/([^/]+?)\/?$/,
						params: (m) => ({ slug: d(m[1])}),
						a: ["src/routes/__layout.svelte", "src/routes/[slug].svelte"],
						b: ["src/routes/__error.svelte"]
					}
	]
};

// this looks redundant, but the indirection allows us to access
// named imports without triggering Rollup's missing import detection
const get_hooks = hooks => ({
	getSession: hooks.getSession || (() => ({})),
	handle: hooks.handle || (({ request, resolve }) => resolve(request)),
	handleError: hooks.handleError || (({ error }) => console.error(error.stack)),
	externalFetch: hooks.externalFetch || fetch
});

const module_lookup = {
	"src/routes/__layout.svelte": () => import("..\\..\\src\\routes\\__layout.svelte"),"src/routes/__error.svelte": () => import("..\\..\\src\\routes\\__error.svelte"),"src/routes/index.svelte": () => import("..\\..\\src\\routes\\index.svelte"),"src/routes/portfolio.svelte": () => import("..\\..\\src\\routes\\portfolio.svelte"),"src/routes/clients/[client].svelte": () => import("..\\..\\src\\routes\\clients\\[client].svelte"),"src/routes/contact.svelte": () => import("..\\..\\src\\routes\\contact.svelte"),"src/routes/about.svelte": () => import("..\\..\\src\\routes\\about.svelte"),"src/routes/blog/[slug].svelte": () => import("..\\..\\src\\routes\\blog\\[slug].svelte"),"src/routes/blog.svelte": () => import("..\\..\\src\\routes\\blog.svelte"),"src/routes/[slug].svelte": () => import("..\\..\\src\\routes\\[slug].svelte")
};

const metadata_lookup = {"src/routes/__layout.svelte":{"entry":"pages/__layout.svelte-dbe354d1.js","css":["assets/pages/__layout.svelte-79261281.css"],"js":["pages/__layout.svelte-dbe354d1.js","chunks/vendor-fb0024c4.js","chunks/company-409b835e.js"],"styles":[]},"src/routes/__error.svelte":{"entry":"pages/__error.svelte-54eb0c24.js","css":[],"js":["pages/__error.svelte-54eb0c24.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js"],"styles":[]},"src/routes/index.svelte":{"entry":"pages/index.svelte-8bbf87b8.js","css":[],"js":["pages/index.svelte-8bbf87b8.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js"],"styles":[]},"src/routes/portfolio.svelte":{"entry":"pages/portfolio.svelte-fd8e0ffe.js","css":["assets/pages/portfolio.svelte-12dab425.css"],"js":["pages/portfolio.svelte-fd8e0ffe.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js"],"styles":[]},"src/routes/clients/[client].svelte":{"entry":"pages/clients/[client].svelte-e8c59337.js","css":[],"js":["pages/clients/[client].svelte-e8c59337.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js"],"styles":[]},"src/routes/contact.svelte":{"entry":"pages/contact.svelte-89c4f5b1.js","css":["assets/pages/contact.svelte-f1169e8a.css"],"js":["pages/contact.svelte-89c4f5b1.js","chunks/preload-helper-ec9aa979.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js"],"styles":[]},"src/routes/about.svelte":{"entry":"pages/about.svelte-5d0dcb6d.js","css":["assets/pages/about.svelte-0e25a92e.css"],"js":["pages/about.svelte-5d0dcb6d.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js","chunks/AuthorCard-512807b8.js"],"styles":[]},"src/routes/blog/[slug].svelte":{"entry":"pages/blog/[slug].svelte-4d9b5257.js","css":[],"js":["pages/blog/[slug].svelte-4d9b5257.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js","chunks/AuthorCard-512807b8.js","chunks/PostSummary-81fef710.js"],"styles":[]},"src/routes/blog.svelte":{"entry":"pages/blog.svelte-57829c84.js","css":[],"js":["pages/blog.svelte-57829c84.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js","chunks/PostSummary-81fef710.js"],"styles":[]},"src/routes/[slug].svelte":{"entry":"pages/[slug].svelte-45d86a19.js","css":[],"js":["pages/[slug].svelte-45d86a19.js","chunks/vendor-fb0024c4.js","chunks/Page-43ba8f74.js","chunks/company-409b835e.js"],"styles":[]}};

async function load_component(file) {
	const { entry, css, js, styles } = metadata_lookup[file];
	return {
		module: await module_lookup[file](),
		entry: assets + "/_app/" + entry,
		css: css.map(dep => assets + "/_app/" + dep),
		js: js.map(dep => assets + "/_app/" + dep),
		styles
	};
}

export function render(request, {
	prerender
} = {}) {
	const host = request.headers["host"];
	return respond({ ...request, host }, options, { prerender });
}