<script>
	import SvelteSeo from "svelte-seo";
	import companyData from "@content/data/company.json";
	import siteData from "@content/data/site.json";
	import seoData from "@content/data/seo.json";
	import { page } from "$app/stores";
	import GoogleAnalytics from "$lib/components/GoogleAnalytics.svelte";
	import { onMount } from "svelte";

	export let withContactButton = false;
	export let pageDetails = {};

	$: heading = pageDetails.heading || pageDetails.title;
	$: browserTitle = pageDetails.title ? `${pageDetails.title}  ${seoData.site_title}` : seoData.site_title;
	$: description = pageDetails.description || seoData.description;
	$: canonical = `${siteData.url}/${$page.path}`.replace(/\/+/g, "/");

	const images = seoData.images.map((image) => ({
		url: image.image,
		width: image.height,
		height: image.width,
		alt: image.description,
	}));

	let canvas;
	let ctx;
	let animationId;
	const polygons = [];
	let mouseX = 0;
	let mouseY = 0;

	class Polygon {
		constructor() {
			this.x = Math.random() * window.innerWidth;
			this.y = Math.random() * 300;
			this.z = Math.random() * 200 - 100;
			this.size = Math.random() * 50 + 20;
			this.speedX = (Math.random() - 0.5) * 2;
			this.speedY = (Math.random() - 0.5) * 2;
			this.speedZ = (Math.random() - 0.5) * 2;
			this.rotation = Math.random() * Math.PI * 2;
			this.rotationSpeed = (Math.random() - 0.5) * 0.02;
			this.opacity = Math.random() * 0.7 + 0.3;
			this.color = Math.random() > 0.5 ? "#f6bb55" : "#FFFFFF"; // Blue or white
		}

		update() {
			this.x += this.speedX;
			this.y += this.speedY;
			this.z += this.speedZ;
			this.rotation += this.rotationSpeed;

			// Reset position if out of bounds
			if (this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > 300) {
				this.x = Math.random() * window.innerWidth;
				this.y = Math.random() * 300;
				this.z = Math.random() * 200 - 100;
			}
		}

		draw(ctx) {
			const scale = 1 + this.z / 200;

			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.scale(scale, scale);
			ctx.rotate(this.rotation);

			// Draw triangle
			ctx.beginPath();
			ctx.moveTo(0, -this.size / 2);
			ctx.lineTo(this.size / 2, this.size / 2);
			ctx.lineTo(-this.size / 2, this.size / 2);
			ctx.closePath();

			ctx.fillStyle = `${this.color}${Math.floor(this.opacity * 255)
				.toString(16)
				.padStart(2, "0")}`;
			ctx.fill();

			ctx.restore();
		}
	}

	onMount(() => {
		canvas = document.getElementById("polygonCanvas");
		ctx = canvas.getContext("2d");

		canvas.width = window.innerWidth;
		canvas.height = 300;

		// Create polygons
		for (let i = 0; i < 15; i++) {
			polygons.push(new Polygon());
		}

		function animate() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Sort polygons by depth
			polygons.sort((a, b) => b.z - a.z);

			polygons.forEach((polygon) => {
				polygon.update();
				polygon.draw(ctx);
			});
			animationId = requestAnimationFrame(animate);
		}

		animate();

		window.addEventListener("resize", () => {
			canvas.width = window.innerWidth;
		});

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<SvelteSeo
	title={heading}
	{canonical}
	{description}
	openGraph={{
		site_name: seoData.site_name,
		url: siteData.url,
		title: heading,
		description: description,
		images: images,
	}}
/>

<GoogleAnalytics />

<svelte:head>
	<title>{browserTitle}</title>
	<link rel="alternate" type="application/rss+xml" title={companyData.company_name} href="/feed.xml" />
	<link rel="sitemap" type="application/xml" title="{companyData.company_name} - Sitemap" href="/sitemap.xml" />
</svelte:head>

<section class="hero diagonal">
	<div class="container" style="position: relative;">
		<canvas id="polygonCanvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;"></canvas>
		<div style="position: relative; z-index: 1;">
			<slot name="heading">
				<h2>{heading}</h2>
			</slot>

			{#if pageDetails.subtitle}
				<p class="subtext">{pageDetails.subtitle}</p>
			{/if}
			{#if pageDetails.subtext_html}
				<p class="subtext">{@html pageDetails.subtext_html}</p>
			{/if}
			{#if withContactButton}
				<p><a class="button alt" href={`${siteData.baseurl}/contact`}>Contact Us</a></p>
			{/if}
		</div>
	</div>
</section>

<slot></slot>
