type BusinessProfileWithDomain = {
  domain?: unknown;
};

function normalizeHost(host: string): string | null {
  const trimmed = host.trim().toLowerCase();
  if (!trimmed) return null;

  const withoutScheme = trimmed.replace(/^https?:\/\//, "");
  const hostname = withoutScheme.split("/")[0]?.split(":")[0]?.trim();
  if (!hostname) return null;

  return hostname.replace(/^www\./, "");
}

function hostFromUrl(value: string): string | null {
  try {
    return normalizeHost(new URL(value).host);
  } catch {
    return normalizeHost(value);
  }
}

export function resolveBusinessProfileByDomain<T extends BusinessProfileWithDomain>(
  profiles: T[],
  headers: Headers,
  extraCandidates: string[] = []
): T | null {
  if (!profiles.length) return null;
  if (profiles.length === 1) return profiles[0];

  const candidateSet = new Set<string>();
  const addCandidate = (value: string | null) => {
    if (!value) return;
    const normalized = hostFromUrl(value);
    if (normalized) candidateSet.add(normalized);
  };

  addCandidate(headers.get("x-tenant-domain"));
  addCandidate(headers.get("x-forwarded-host"));
  addCandidate(headers.get("host"));
  addCandidate(headers.get("origin"));
  addCandidate(headers.get("referer"));
  for (const candidate of extraCandidates) addCandidate(candidate);

  if (!candidateSet.size) return profiles[0];

  const byDomain = new Map<string, T>();
  for (const profile of profiles) {
    const profileDomain = typeof profile.domain === "string" ? hostFromUrl(profile.domain) : null;
    if (profileDomain) byDomain.set(profileDomain, profile);
  }

  for (const candidate of candidateSet) {
    const direct = byDomain.get(candidate);
    if (direct) return direct;

    for (const [domain, profile] of byDomain) {
      if (candidate.endsWith(`.${domain}`) || domain.endsWith(`.${candidate}`)) {
        return profile;
      }
    }
  }

  return profiles[0];
}
