<script>
	import "$lib/styles/main.scss";
	import { page } from "$app/stores";
	import { links } from "@content/data/navigation.json";
	import footerData from "@content/data/footer.json";
	import companyData from "@content/data/company.json";
	import siteData from "@content/data/site.json";
	import Icon from "$lib/components/Icon.svelte";

	let navLinks = links;
	$: active_tab = `${$page.path}/`;

	const toggleNav = function () {
		document.body.classList.toggle("nav-open");
		return false;
	};
</script>

<header>
	<div class="container">
		<h1 class="company-name">
			<a href="/">
				<img src="/images/file.png" alt="Pixel Pulse" width="150" />
			</a>
		</h1>
		<nav>
			<a class="nav-toggle" id="open-nav" on:click={toggleNav}>&#9776;</a>
			<ul>
				{#each navLinks as navLink}
					<li><a class={active_tab === navLink.link ? "active" : ""} href={navLink.link}>{navLink.name}</a></li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<slot></slot>

<footer class="diagonal">
	<div class="container">
		<p class="editor-link"><a href="cloudcannon:data/data/footer.json" class="btn"><strong>&#9998;</strong> Edit Footer</a></p>
		<div class="footer-columns">
			{#each footerData as column, index (index)}
				<ul class="footer-links">
					<li>
						<h2>{column.title}</h2>
					</li>

					{#each column.links as link, index (index)}
						<li>
							<a href={link.link} target={link.new_window ? "_blank" : "_self"}>
								{#if link.social_icon}
									<Icon icon={link.social_icon} />{/if}{link.name}
							</a>
						</li>
					{/each}
				</ul>
			{/each}

			<ul class="footer-links">
				<li>
					<h2>{companyData.site_title}</h2>
				</li>
				<li>{companyData.description}</li>
			</ul>
		</div>
	</div>

	<div class="legal-line">
		<p class="container">
			&copy; {new Date().getFullYear()}
			{companyData.site_title}
		</p>
	</div>
</footer>
