export type SearchKind = 'tracks' | 'artists';

export function slugify(input: string): string {
  let slug = '';
  let separatorPending = false;

  for (const character of input) {
    if (character === "'" || character === '\u2019') {
      continue;
    }

    if (/[a-z0-9]/i.test(character)) {
      if (separatorPending && slug.length > 0) {
        slug += '-';
      }
      slug += character.toLowerCase();
      separatorPending = false;
    } else {
      separatorPending = true;
    }
  }

  return slug;
}

export function alternateSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => (word === 'on' ? 'in' : word === 'in' ? 'on' : word))
    .join('-');
}

export function searchUrl(term: string, kind: SearchKind): string {
  const trimmed = term.trim();
  const params = new URLSearchParams({ type: kind });

  if (trimmed) {
    params.set('q', trimmed);
  }

  return `/search?${params.toString()}`;
}

export function songUrl(name: string): string {
  return `/song/${encodeURIComponent(name)}`;
}
