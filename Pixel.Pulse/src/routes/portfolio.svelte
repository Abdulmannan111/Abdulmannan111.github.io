<script context="module">
	export async function load({ fetch }) {
		const res = await fetch("portfolio.json");

		if (res.ok) {
			return {
				props: res.json(),
			};
		}
	}
</script>

<script>
	import { onDestroy, onMount } from "svelte";
	import { onCloudCannonChanges, stopCloudCannonChanges } from "@cloudcannon/svelte-connector";
	import Page from "$lib/components/Page.svelte";
	import siteData from "@content/data/site.json";
	import { fly, fade } from "svelte/transition";

	export let pageDetails, clients;

	onMount(async () => {
		onCloudCannonChanges((newProps) => (pageDetails = newProps));
	});

	onDestroy(async () => {
		stopCloudCannonChanges();
	});
</script>

<Page {pageDetails}>
	<section class="diagonal patterned">
		<div class="container">
			<p class="editor-link">
				<a href="cloudcannon:collections/content/clients/" class="btn">
					<strong>&#9998;</strong> Manage Clients
				</a>
			</p>
			<ul class="image-grid">
				{#each clients as client, index (index)}
					<li in:fly={{ x: index % 2 === 0 ? 100 : -100, duration: 500 }} style="animation-delay: {index * 200}ms;">
						<div class="details" in:fade={{ duration: 300 }}>
							<div class="name">{client.name}</div>
						</div>

						<div class="image-container">
							<img src={client.image_path} alt={client.name} />
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</section>
</Page>

<style>
	.diagonal.patterned {
		padding: 20px;
		background: #f9f9f9;
	}
	.container {
		max-width: 1200px;
		margin: 0 auto;
	}
	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 20px;
		list-style: none;
		padding: 0;
	}
	.image-grid li {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.3s,
			box-shadow 0.3s;
		transform: scale(1);
		position: relative;
		opacity: 0; /* Start hidden */
		animation: fadeIn 0.5s ease-in-out forwards;
	}
	.image-grid li img {
		width: 100%;
		height: auto;
		object-fit: cover;
		transition: transform 0.3s ease-in-out;
	}
	.image-grid li:hover {
		transform: scale(1.05);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
	}
	.image-container {
		overflow: hidden;
		position: relative;
	}
	.image-container img {
		transition: transform 0.5s ease-in-out;
	}
	.image-container:hover img {
		transform: scale(1.2) rotate(2deg);
	}
	.details {
		padding: 10px;
		text-align: center;
		position: relative;
		background-color: #fff;
		z-index: 2;
	}
	.name {
		font-weight: bold;
		font-size: 1.2rem;
	}
	.position {
		color: #666;
		font-size: 1rem;
		margin-top: 5px;
	}
	/* Animation */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	p.editor-link {
		text-align: "center";
	}
</style>
