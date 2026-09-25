<script>
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let response = $state({});
	let images = $state([]);

	onMount(async () => {
		const encyclopedia = localStorage.getItem('encyclopedia');

		const topicCookie = document.cookie.split('; ').find((row) => row.startsWith('topic='));

		if (!encyclopedia || !topicCookie) return;

		try {
			const data = JSON.parse(encyclopedia);

			response = data.response ?? data;

			const topic = decodeURIComponent(topicCookie.split('=').slice(1).join('=')).trim();

			if (!topic) return;

			const query = `${topic} old`;

			console.log('Openverse query:', query);

			const params = new URLSearchParams({
				q: query,
				page_size: '10'
			});

			const res = await fetch(`https://api.openverse.org/v1/images/?${params.toString()}`, {
				cache: 'no-store'
			});

			if (!res.ok) {
				throw new Error(`Openverse returned ${res.status}`);
			}

			const openverseData = await res.json();

			const results = (openverseData.results ?? []).filter((image) => image.thumbnail || image.url);

			for (let i = results.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[results[i], results[j]] = [results[j], results[i]];
			}

			images = results.slice(0, 2);

			console.log('Openverse images:', images);
		} catch (error) {
			console.error('Failed to load Openverse images:', error);
			images = [];
		}
	});

	let links = $derived(
		response['Family Tree']?.length
			? [
					{ label: 'Home', href: '/' },
					{ label: 'History', href: '/history' },
					{ label: 'Notable Achievements', href: '/notable' },
					{ label: 'Family Tree', href: '/family' },
					{ label: 'Location / Geography', href: '/location' },
					{ label: 'Society at the time', href: '/society' }
				]
			: [
					{ label: 'Home', href: '/' },
					{ label: 'History', href: '/history' },
					{ label: 'Notable Achievements', href: '/notable' },
					{ label: 'Location / Geography', href: '/location' },
					{ label: 'Society at the time', href: '/society' }
				]
	);
</script>

<div
	class="relative flex h-screen w-full overflow-hidden bg-cover bg-center font-sans text-black"
	style="background-image: url('/bg.png');"
>
	<div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

	<div
		class="relative z-10 w-[220px] shrink-0 overflow-hidden border-r border-white/20 bg-white/40 shadow-lg backdrop-blur-md"
	>
		<Sidebar
			currentPath={page.url.pathname}
			subtitle="Search the knowledge base"
			title="Encyclopedia"
			{links}
		/>
	</div>

	<main class="relative z-10 flex-1 overflow-y-auto">
		<div class="mx-auto w-full max-w-[900px] px-5 py-10">
			<h1 class="mb-8 text-center text-[2.5rem] font-bold text-white drop-shadow-md">History</h1>

			{#if response.History}
				<section class="w-full rounded-xl border border-white/30 bg-white/85 p-6 shadow-lg">
					{#if Array.isArray(response.History)}
						<ul class="list-disc space-y-2 pl-5">
							{#each response.History as item}
								<li>{item}</li>
							{/each}
						</ul>
					{:else}
						<p>{response.History}</p>
					{/if}
				</section>
			{:else}
				<section class="rounded-xl bg-white/85 p-6 text-center shadow-lg">
					<p>No encyclopedia data found.</p>
				</section>
			{/if}

			{#if images.length}
				<section class="mt-8">
					<h2 class="mb-4 text-xl font-bold text-white drop-shadow-md">Images</h2>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each images as image}
							<div class="overflow-hidden rounded-xl bg-white/85 shadow-lg">
								<img src={image.thumbnail || image.url} alt={image.title} class="w-full" />

								<p class="p-3 font-medium">
									{image.title}
								</p>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	</main>
</div>
