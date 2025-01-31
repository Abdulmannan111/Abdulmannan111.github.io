<script context="module">
	export async function load({ fetch }) {
		const res = await fetch("index.json");

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
	export let pageDetails;
	export let clients;

	function animateValue(id, start, end, duration) {
		let startTimestamp = null;
		const element = document.getElementById(id);

		function step(timestamp) {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			element.innerHTML = Math.floor(progress * (end - start) + start) + "+";
			if (progress < 1) {
				window.requestAnimationFrame(step);
			}
		}

		window.requestAnimationFrame(step);
	}

	onMount(async () => {
		onCloudCannonChanges((newProps) => (pageDetails = newProps));

		// Start animations immediately on mount
		animateValue("yearsCount", 0, 10, 2000);
		animateValue("clientsCount", 0, 200, 2000);
		animateValue("websitesCount", 0, 300, 2000);
	});

	onDestroy(async () => {
		stopCloudCannonChanges();
	});

	let clientsPreview = clients.slice(0, 4);
</script>

<Page {pageDetails} withContactButton="true">
	<section class="diagonal patterned">
		<div class="container">
			<div class="stats">
				<div class="stat">
					<div class="number" id="yearsCount">0</div>
					<div class="label">Years Of Experience</div>
				</div>
				<div class="stat">
					<div class="number" id="clientsCount">0</div>
					<div class="label">Satisfied Clients</div>
				</div>
				<div class="stat">
					<div class="number" id="websitesCount">0</div>
					<div class="label">Websites Developed</div>
				</div>
			</div>

			<div class="halves">
				<div>
					<h3>{pageDetails.portfolio_heading}</h3>
					<p>{@html pageDetails.portfolio_description_html}</p>

					<p><a href={`${siteData.baseurl}/portfolio`}>{pageDetails.portfolio_call_to_action} &rarr;</a></p>
				</div>
				<div>
					<ul class="image-grid">
						{#each clientsPreview as client, index (index)}
							<li>
								<img src={client.image_path} alt={client.name} />
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>

		<style>
			.stats {
				display: flex;
				justify-content: space-around;
				margin: 2em 0;
				text-align: center;
			}

			.stat {
				padding: 1em;
			}

			.number {
				font-size: 3em;
				font-weight: bold;
				margin-bottom: 0.2em;
			}

			.label {
				font-size: 1.2em;
			}
		</style>
	</section>
</Page>

<style>
</style>
