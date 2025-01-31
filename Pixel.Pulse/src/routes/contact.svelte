<script context="module">
	export async function load({ fetch }) {
		const res = await fetch("contact.json");

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
	import { fade, fly } from "svelte/transition";
	import Page from "$lib/components/Page.svelte";
	import company from "@content/data/company.json";
	import siteData from "@content/data/site.json";
	import { browser } from "$app/env";

	export let pageDetails;

	let mapEl;
	let map;

	onMount(async () => {
		onCloudCannonChanges((newProps) => (pageDetails = newProps));

		if (browser) {
			// Dynamically import Leaflet only on client-side
			const L = await import("leaflet");
			await import("leaflet/dist/leaflet.css");

			map = L.default.map(mapEl).setView([31.5204, 74.3587], 12);

			L.default
				.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
					attribution: "© OpenStreetMap contributors",
				})
				.addTo(map);
			const customIcon = L.default.icon({
				iconUrl: "/images/file.png",
				iconSize: [64, 64], // Doubled the size
				iconAnchor: [32, 64], // Adjusted anchor point for larger icon
				popupAnchor: [0, -64], // Added popup anchor
			});

			const marker = L.default
				.marker([31.5204, 74.3587], {
					icon: customIcon,
				})
				.addTo(map);
		}
	});

	onDestroy(async () => {
		stopCloudCannonChanges();
		if (browser && map) {
			map.remove();
		}
	});
</script>

<Page {pageDetails}>
	<section class="diagonal" in:fly={{ y: 50, duration: 500 }} out:fade>
		<div class="container">
			<form action="https://getform.io/f/bwnnkxna" method="POST" class="contact-form" in:fly={{ y: 50, duration: 700, delay: 200 }}>
				<input type="text" name="_gotcha" style="display:none" />

				<div class="halves">
					<div>
						<label for="first-name">First Name</label>
						<input type="text" name="first-name" id="first-name" />
					</div>

					<div>
						<label for="last-name">Last Name</label>
						<input type="text" name="last-name" id="last-name" />
					</div>
				</div>

				<label for="email">Email Address</label>
				<input type="email" name="email" id="email" required />

				<label for="message">Message</label>
				<textarea name="message" id="message"></textarea>

				<input type="submit" value="Send Message" />
			</form>
		</div>
	</section>
	<section class="diagonal map" in:fly={{ y: 50, duration: 700, delay: 400 }}>
		<div id="map" bind:this={mapEl}></div>
	</section>

	<section class="diagonal" in:fly={{ y: 50, duration: 700, delay: 600 }}>
		<div class="container halves aligned-top">
			<div>
				<h3>Address</h3>
				<address>
					<a target="_blank" href={"https://www.google.com/maps/place/" + encodeURIComponent("Lahore, Pakistan")} rel="noreferrer">
						{@html "Lahore,</br>Pakistan"}
					</a>
				</address>
			</div>
			<div>
				<h3>Email</h3>
				<p><a href={"mailto:" + company.contact_email_address}>{company.contact_email_address}</a></p>
			</div>
		</div>
	</section>
</Page>

<style>
	input[name="_gotcha"] {
		display: none;
	}
</style>
