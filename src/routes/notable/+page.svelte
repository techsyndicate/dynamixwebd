<script>
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let response = $state({});
	let images = $state([]);

	onMount(async () => {
		const encyclopediaCookie = document.cookie
			.split('; ')
			.find((row) => row.startsWith('encyclopedia='));

		const topicCookie = document.cookie.split('; ').find((row) => row.startsWith('topic='));

		if (!encyclopediaCookie || !topicCookie) return;

		try {
			const encyclopediaData = JSON.parse(
				decodeURIComponent(encyclopediaCookie.split('=').slice(1).join('='))
			);

			response = encyclopediaData.response ?? {};

			const topic = decodeURIComponent(topicCookie.split('=').slice(1).join('=')).trim();

			if (!topic) return;

			const query = `${topic} advancements`;

			console.log('Openverse query:', query);

			const params = new URLSearchParams({
				q: query,
				page_size: '10',
				_page: Date.now().toString()
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
			console.error('Failed to load encyclopedia/images:', error);
			images = [];
		}
	});

	let links = $derived(
		response['Family Tree'] && response['Family Tree'].length > 0
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
			<h1 class="mb-8 text-center text-[2.5rem] font-bold text-white drop-shadow-md">
				Notable Achievements
			</h1>

			{#if response['Notable Achievements']}
				<section
					class="w-full rounded-xl border border-white/30 bg-white/85 p-6 text-left shadow-lg backdrop-blur-md"
				>
					{#if Array.isArray(response['Notable Achievements'])}
						<ul class="list-disc space-y-2 pl-5 leading-relaxed">
							{#each response['Notable Achievements'] as achievement}
								<li>{achievement}</li>
							{/each}
						</ul>
					{:else if typeof response['Notable Achievements'] === 'object' && response['Notable Achievements'] !== null}
						<div class="space-y-4">
							{#each Object.entries(response['Notable Achievements']) as [category, content]}
								<div>
									<h2 class="mb-1 font-semibold underline">{category}</h2>

									{#if Array.isArray(content)}
										<ul class="list-disc space-y-1 pl-5">
											{#each content as item}
												<li>{item}</li>
											{/each}
										</ul>
									{:else}
										<p class="leading-relaxed">{content}</p>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="leading-relaxed">
							{response['Notable Achievements']}
						</p>
					{/if}
				</section>
			{:else}
				<section
					class="w-full rounded-xl border border-white/30 bg-white/85 p-6 text-center shadow-lg backdrop-blur-md"
				>
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
