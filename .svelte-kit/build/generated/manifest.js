const c = [
	() => import("..\\..\\..\\src\\routes\\__layout.svelte"),
	() => import("..\\..\\..\\src\\routes\\__error.svelte"),
	() => import("..\\..\\..\\src\\routes\\index.svelte"),
	() => import("..\\..\\..\\src\\routes\\portfolio.svelte"),
	() => import("..\\..\\..\\src\\routes\\clients\\[client].svelte"),
	() => import("..\\..\\..\\src\\routes\\contact.svelte"),
	() => import("..\\..\\..\\src\\routes\\about.svelte"),
	() => import("..\\..\\..\\src\\routes\\blog\\[slug].svelte"),
	() => import("..\\..\\..\\src\\routes\\blog.svelte"),
	() => import("..\\..\\..\\src\\routes\\[slug].svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.json.js
	[/^\/index\.json$/],

	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	// src/routes/portfolio.json.js
	[/^\/portfolio\.json$/],

	// src/routes/sitemap.xml.js
	[/^\/sitemap\.xml$/],

	// src/routes/about.json.js
	[/^\/about\.json$/],

	// src/routes/blog.json.js
	[/^\/blog\.json$/],

	// src/routes/portfolio.svelte
	[/^\/portfolio\/?$/, [c[0], c[3]], [c[1]]],

	// src/routes/feed.xml.js
	[/^\/feed\.xml$/],

	// src/routes/clients/[client].json.js
	[/^\/clients\/([^/]+?)\.json$/],

	// src/routes/clients/[client].svelte
	[/^\/clients\/([^/]+?)\/?$/, [c[0], c[4]], [c[1]], (m) => ({ client: d(m[1])})],

	// src/routes/contact.svelte
	[/^\/contact\/?$/, [c[0], c[5]], [c[1]]],

	// src/routes/about.svelte
	[/^\/about\/?$/, [c[0], c[6]], [c[1]]],

	// src/routes/blog/[slug].json.js
	[/^\/blog\/([^/]+?)\.json$/],

	// src/routes/blog/[slug].svelte
	[/^\/blog\/([^/]+?)\/?$/, [c[0], c[7]], [c[1]], (m) => ({ slug: d(m[1])})],

	// src/routes/blog.svelte
	[/^\/blog\/?$/, [c[0], c[8]], [c[1]]],

	// src/routes/[slug].json.js
	[/^\/([^/]+?)\.json$/],

	// src/routes/[slug].svelte
	[/^\/([^/]+?)\/?$/, [c[0], c[9]], [c[1]], (m) => ({ slug: d(m[1])})]
];

// we import the root layout/error components eagerly, so that
// connectivity errors after initialisation don't nuke the app
export const fallback = [c[0](), c[1]()];