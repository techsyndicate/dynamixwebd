<script>
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let response = $state({});
	let images = $state([]);

	onMount(() => {
		const encyclopedia = localStorage.getItem('encyclopedia');

		if (encyclopedia) {
			try {
				const data = JSON.parse(encyclopedia);

				response = data.response ?? data;
				images = data.images ?? [];
			} catch (err) {
				console.error('Could not load encyclopedia from localStorage:', err);
			}
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
				Family Tree
			</h1>

			{#if response['Family Tree']}
				<div class="space-y-4">
					{#each response['Family Tree'] as person}
						{#if typeof person === 'object' && person !== null}
							<section
								class="w-full rounded-xl border border-white/30 bg-white/85 p-6 text-left shadow-lg backdrop-blur-md"
							>
								{#each Object.entries(person) as [key, value]}
									<p class="mb-2 leading-relaxed last:mb-0">
										<strong>{key}:</strong>

										{#if Array.isArray(value)}
											{value.join(', ')}
										{:else}
											{value}
										{/if}
									</p>
								{/each}
							</section>
						{:else}
							<section
								class="w-full rounded-xl border border-white/30 bg-white/85 p-6 text-left shadow-lg backdrop-blur-md"
							>
								<p class="leading-relaxed">{person}</p>
							</section>
						{/if}
					{/each}
				</div>
			{:else}
				<section
					class="w-full rounded-xl border border-white/30 bg-white/85 p-6 text-center shadow-lg backdrop-blur-md"
				>
					<p>No family tree data found.</p>
				</section>
			{/if}

			{#if images.length > 0}
				<section class="mt-8">
					<h2 class="mb-4 text-xl font-bold text-white drop-shadow-md">Images</h2>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each images as image}
							<div
								class="overflow-hidden rounded-xl border border-white/30 bg-white/85 shadow-lg backdrop-blur-md"
							>
								<img src={image.url} alt={image.title} class="h-auto w-full object-cover" />

								<p class="p-3 font-medium">{image.title}</p>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	</main>
</div>
