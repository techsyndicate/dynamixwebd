<script>
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let response = $state({});
	let images = $state([]);

	onMount(async () => {
		const encyclopedia = localStorage.getItem('encyclopedia');

		const topicCookie = document.cookie.split('; ').find((row) => row.startsWith('topic='));

		if (!encyclopedia || !topicCookie) return;

		try {
			let encyclopediaData = JSON.parse(encyclopedia);

			response = encyclopediaData.response ?? encyclopediaData;

			const topic = decodeURIComponent(topicCookie.split('=').slice(1).join('='));

			const res = await fetch(
				`https://api.openverse.org/v1/images/?q=${encodeURIComponent(topic + ' historical painting')}&page_size=2`
			);

			if (!res.ok) {
				throw new Error(`Openverse returned ${res.status}`);
			}

			const data = await res.json();

			images = data.results ?? [];

			console.log('Openverse images:', images);
		} catch (error) {
			console.error('Failed to load encyclopedia/images:', error);
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
				Society at the Time
			</h1>

			{#if response['Society at the time']}
				<section
					class="w-full rounded-xl border border-white/30 bg-white/85 p-6 text-left shadow-lg backdrop-blur-md"
				>
					{#if Array.isArray(response['Society at the time'])}
						<ul class="list-disc space-y-2 pl-5 leading-relaxed">
							{#each response['Society at the time'] as item}
								<li>{item}</li>
							{/each}
						</ul>
					{:else if typeof response['Society at the time'] === 'object'}
						<div class="space-y-4">
							{#each Object.entries(response['Society at the time']) as [category, content]}
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
							{response['Society at the time']}
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
