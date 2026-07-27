/**
 * Pulls a person's own public GitHub profile so they don't have to retype what is
 * already published. This only ever runs on a username the person typed about
 * themselves, and the result is shown back as editable suggestions rather than
 * written straight to their profile — nothing lands on a profile unreviewed.
 */

export type GithubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
};

export type GithubProfile = {
  username: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  websiteUrl: string | null;
  xUrl: string | null;
  followers: number;
  publicRepos: number;
  topRepos: GithubRepo[];
  languages: string[];
};

function normalizeUrl(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function fetchGithubProfile(rawUsername: string): Promise<GithubProfile | null> {
  // Accept a bare handle or a pasted profile URL.
  const username = rawUsername
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/+$/, "")
    .replace(/^@/, "");

  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) return null;

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "batch-startup-school",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers,
    next: { revalidate: 3600 },
  });
  if (!userRes.ok) return null;
  const user = await userRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`,
    { headers, next: { revalidate: 3600 } }
  );
  const repos: unknown[] = reposRes.ok ? await reposRes.json() : [];

  const owned = (repos as Record<string, unknown>[]).filter((r) => !r.fork);

  const topRepos: GithubRepo[] = owned
    .slice()
    .sort((a, b) => Number(b.stargazers_count ?? 0) - Number(a.stargazers_count ?? 0))
    .slice(0, 6)
    .map((r) => ({
      name: String(r.name),
      description: (r.description as string) ?? null,
      language: (r.language as string) ?? null,
      stars: Number(r.stargazers_count ?? 0),
      url: String(r.html_url),
    }));

  const languageCounts = new Map<string, number>();
  for (const repo of owned) {
    const lang = repo.language as string | null;
    if (lang) languageCounts.set(lang, (languageCounts.get(lang) ?? 0) + 1);
  }
  const languages = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang]) => lang);

  return {
    username: String(user.login),
    name: user.name ?? null,
    bio: user.bio ?? null,
    company: user.company ?? null,
    location: user.location ?? null,
    websiteUrl: normalizeUrl(user.blog),
    xUrl: user.twitter_username ? `https://x.com/${user.twitter_username}` : null,
    followers: Number(user.followers ?? 0),
    publicRepos: Number(user.public_repos ?? 0),
    topRepos,
    languages,
  };
}
