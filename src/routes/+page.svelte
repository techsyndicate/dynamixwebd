<script>
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	let inputValue = $state('');
	let response = $state({});
	let images = $state([]);
	let clicked = $state(false);
	let loading = $state(false);
	let error = $state('');
	let sidebarOpen = $state(true);

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

	async function logout() {
		await signOut(auth);
		goto('/');
	}

	async function submit() {
		clicked = true;
		loading = true;
		response = {};
		images = [];
		error = '';

		try {
			const res = await fetch('/api/gemini', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: inputValue
				})
			});

			const text = await res.text();

			if (!res.ok) {
				throw new Error(text);
			}

			response = JSON.parse(text);

			if (response.images) {
				const imageResults = await Promise.all(
					response.images.map(async (query) => {
						const res = await fetch('/api/images', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({ query })
						});

						return await res.json();
					})
				);

				images = imageResults.flat();
			}

			const Data = {
				response,
				images
			};

			localStorage.setItem('encyclopedia', JSON.stringify(Data));

			// Get the actual topic from the user's question

			const topic = inputValue
				.replace(/^What is\s+/i, '')
				.replace(/\?$/, '')
				.trim();

			let category = '';

			for (const [categoryName, categoryTopics] of Object.entries(topics)) {
				if (categoryTopics.includes(topic)) {
					category = categoryName.toLowerCase();
					break;
				}
			}

			const topicWithCategory = category ? `${topic} ${category}` : topic;

			document.cookie =
				`topic=${encodeURIComponent(topicWithCategory)}; ` + `path=/; max-age=86400`;

			console.log('TOPIC:', topic);
			console.log('CATEGORY:', category);
			console.log('TOPIC WITH CATEGORY:', topicWithCategory);
			console.log('ENCYCLOPEDIA RESPONSE:', response);
			console.log('SOCIETY:', response['Society at the time']);
		} catch (err) {
			error = 'Something went wrong.';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	const topics = {
		Religion: [
			'Christianity',
			'Islam',
			'Hinduism',
			'Buddhism',
			'Judaism',
			'Sikhism',
			'Taoism',
			'Shinto'
		],

		Mythology: [
			'Dragon',
			'Phoenix',
			'Minotaur',
			'Pegasus',
			'Kraken',
			'Griffin',
			'Cerberus',
			'Sphinx'
		],

		Culture: [
			'Japanese Culture',
			'Greek Culture',
			'Egyptian Culture',
			'Nordic Culture',
			'Celtic Culture',
			'Mayan Culture',
			'Roman Culture',
			'Persian Culture'
		]
	};
</script>

<div
	class="relative flex h-screen w-full overflow-hidden bg-cover bg-center font-sans text-black"
	style="background-image: url('/bg.png');"
>
	<div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

	<div
		class={`relative z-10 shrink-0 overflow-hidden border-r border-white/20 bg-white/40 shadow-lg backdrop-blur-md transition-all duration-300 ${
			sidebarOpen ? 'w-[220px]' : 'w-0'
		}`}
	>
		<Sidebar
			currentPath={page.url.pathname}
			subtitle="Search the knowledge base"
			title="Encyclopedia"
			{links}
		/>
	</div>

	<main class="relative z-10 flex-1 overflow-y-auto">
		<div class="box-border flex min-h-full w-full flex-col items-center">
			<div class="w-full max-w-[900px] px-5 py-10">
				<header class="mb-8 text-center">
					{#if !clicked}
						<h1 class="m-0 mb-2 text-[2.5rem] leading-tight font-bold text-white drop-shadow-md">
							Encyclopedia
						</h1>
					{:else}
						<h1 class="m-0 mb-2 text-[2.5rem] leading-tight font-bold text-white drop-shadow-md">
							Encyclopedia - {inputValue}
						</h1>
					{/if}

					<p class="m-0 text-base text-zinc-200 drop-shadow">Search the knowledge base</p>
				</header>

				<div class="mx-auto flex w-full max-w-[600px] flex-col items-center">
					<input
						bind:value={inputValue}
						placeholder="Ask about anything..."
						onkeydown={(e) => e.key === 'Enter' && submit()}
						class="box-border w-full rounded-xl border border-white/40 bg-white/80 px-[18px] py-[14px] text-base text-black shadow-lg backdrop-blur-md outline-none focus:ring-2 focus:ring-white"
					/>

					<button
						onclick={submit}
						disabled={loading}
						class="mt-4 cursor-pointer rounded-lg border border-black bg-black px-[28px] py-[11px] text-[15px] text-white shadow-md transition-colors duration-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? 'Thinking...' : 'Submit'}
					</button>
				</div>

				{#if error}
					<p class="mt-4 text-center font-semibold text-red-200 underline">
						{error}
					</p>
				{/if}

				{#if Object.keys(response).length > 0}
					<div class="w-full">
						{#each Object.entries(response) as [category, content]}
							{#if ['General Overview'].includes(category)}
								<section
									class="my-[20px] box-border w-full rounded-xl border border-white/30 bg-white/85 p-[20px] text-left shadow-lg backdrop-blur-md"
								>
									<h2 class="mt-0 mb-3 text-xl font-bold text-black">
										{category}
									</h2>

									{#if Array.isArray(content)}
										<ul class="list-disc space-y-1 pl-5 leading-relaxed">
											{#each content as item}
												<li class="leading-relaxed">
													{item}
												</li>
											{/each}
										</ul>
									{:else if typeof content === 'object' && content !== null}
										<div class="space-y-3">
											{#each Object.entries(content) as [subCategory, items]}
												<h3 class="mt-2 mb-1 font-semibold text-black underline">
													{subCategory}
												</h3>

												{#if Array.isArray(items)}
													<ul class="list-disc space-y-1 pl-5 leading-relaxed">
														{#each items as item}
															<li class="leading-relaxed">
																{item}
															</li>
														{/each}
													</ul>
												{:else}
													<p class="leading-relaxed">
														{items}
													</p>
												{/if}
											{/each}
										</div>
									{:else}
										<p class="leading-relaxed">
											{content}
										</p>
									{/if}
								</section>
							{/if}
						{/each}
					</div>
				{/if}

				<div class="mt-16 w-full border-t border-white/20 pt-10">
					<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div>
							<h3 class="mb-4 text-lg font-bold text-white drop-shadow">Religion</h3>

							<div class="flex flex-col gap-2">
								{#each topics.Religion as item}
									<button
										onclick={() => {
											inputValue = `What is ${item}?`;
											submit();
										}}
										class="w-full rounded-lg border border-white/30 bg-white/80 px-4 py-3 text-left text-sm font-medium text-black shadow-md backdrop-blur-md transition-all duration-200 hover:border-black hover:bg-black hover:text-white"
									>
										{item}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<h3 class="mb-4 text-lg font-bold text-white drop-shadow">Mythology</h3>

							<div class="flex flex-col gap-2">
								{#each topics.Mythology as item}
									<button
										onclick={() => {
											inputValue = `What is ${item}?`;
											submit();
										}}
										class="w-full rounded-lg border border-white/30 bg-white/80 px-4 py-3 text-left text-sm font-medium text-black shadow-md backdrop-blur-md transition-all duration-200 hover:border-black hover:bg-black hover:text-white"
									>
										{item}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<h3 class="mb-4 text-lg font-bold text-white drop-shadow">Culture</h3>

							<div class="flex flex-col gap-2">
								{#each topics.Culture as item}
									<button
										onclick={() => {
											inputValue = `What is ${item}?`;
											submit();
										}}
										class="w-full rounded-lg border border-white/30 bg-white/80 px-4 py-3 text-left text-sm font-medium text-black shadow-md backdrop-blur-md transition-all duration-200 hover:border-black hover:bg-black hover:text-white"
									>
										{item}
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>
