import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	const { query } = await request.json();

	if (!query) {
		return json({ error: 'Missing query' }, { status: 400 });
	}

	const params = new URLSearchParams({
		action: 'query',
		generator: 'search',
		gsrsearch: query,
		gsrnamespace: '6',
		gsrlimit: '2',
		prop: 'imageinfo',
		iiprop: 'url|mime',
		iiurlwidth: '800',
		format: 'json',
		origin: '*'
	});

	try {
		const res = await fetch(
			`https://commons.wikimedia.org/w/api.php?${params.toString()}`
		);

		if (!res.ok) {
			throw new Error(`Wikimedia returned ${res.status}`);
		}

		const data = await res.json();

		const image = Object.values(data.query?.pages ?? {})
			.map((page) => {
				const info = page.imageinfo?.[0];

				return {
					title: page.title,
					url: info?.thumburl ?? info?.url,
					original: info?.url,
					mime: info?.mime
				};
			})
			

		if (!image) {
			return json({ error: 'No image found' }, { status: 404 });
		}

		cookies.set('wikimedia-image', image.original, {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60 * 24 * 7
		});

		return json({
			original: image.original
		});
	} catch (error) {
		console.error('Wikimedia error:', error);

		return json(
			{
				error: 'Could not reach Wikimedia Commons'
			},
			{ status: 502 }
		);
	}
}