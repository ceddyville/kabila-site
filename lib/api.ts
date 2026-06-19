import type {
  PaginatedResponse,
  EthnicGroup,
  EthnicGroupSummary,
  Clan,
  Language,
  LanguageFamily,
  ClanSummary,
  SubGroupSummary,
  SubGroup,
  Country,
  Contribution,
  TraditionalAuthority,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_BASE || "https://api.kabila.dev/api/v1";

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = Object.entries(errBody)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("; ");
    } catch { /* ignore parse errors */ }
    throw new Error(detail || `API ${res.status}: ${path}`);
  }
  return res.json();
}

export function fetchCountries() {
  return get<PaginatedResponse<Country>>("/countries/");
}

export function fetchLanguageFamilies() {
  return get<PaginatedResponse<LanguageFamily>>("/language-families/");
}

export function fetchLanguageFamily(id: number) {
  return get<LanguageFamily>(`/language-families/${id}/`);
}

export function fetchLanguages(params?: Record<string, string>) {
  return get<PaginatedResponse<Language>>("/languages/", params);
}

export function fetchLanguage(id: number) {
  return get<Language>(`/languages/${id}/`);
}

export function fetchLanguageEthnicGroups(id: number) {
  return get<EthnicGroupSummary[]>(`/languages/${id}/ethnic-groups/`);
}

export function fetchEthnicGroups(params?: Record<string, string>) {
  return get<PaginatedResponse<EthnicGroup>>("/ethnic-groups/", params);
}

export function fetchEthnicGroup(id: number) {
  return get<EthnicGroup>(`/ethnic-groups/${id}/`);
}

export function fetchEthnicGroupClans(id: number) {
  return get<ClanSummary[]>(`/ethnic-groups/${id}/clans/`);
}

export function fetchEthnicGroupSubGroups(id: number) {
  return get<SubGroupSummary[]>(`/ethnic-groups/${id}/sub-groups/`);
}

export function fetchClans(params?: Record<string, string>) {
  return get<PaginatedResponse<Clan>>("/clans/", params);
}

export function fetchClan(id: number) {
  return get<Clan>(`/clans/${id}/`);
}

export function fetchSubGroups(params?: Record<string, string>) {
  return get<PaginatedResponse<SubGroup>>("/sub-groups/", params);
}

export function fetchSubGroup(id: number) {
  return get<SubGroup>(`/sub-groups/${id}/`);
}

export function fetchSubGroupClans(id: number) {
  return get<ClanSummary[]>(`/sub-groups/${id}/clans/`);
}

export function fetchSubGroupChildren(id: number) {
  return get<SubGroupSummary[]>(`/sub-groups/${id}/sub-groups/`);
}

export function fetchTraditionalAuthorities(params?: Record<string, string>) {
  return get<PaginatedResponse<TraditionalAuthority>>("/traditional-authorities/", params);
}

export function fetchTraditionalAuthority(id: number) {
  return get<TraditionalAuthority>(`/traditional-authorities/${id}/`);
}

export function fetchCountry(id: number) {
  return get<Country>(`/countries/${id}/`);
}

export function submitContribution(data: Omit<Contribution, "id" | "status" | "created_at" | "reviewed_at" | "reviewer_notes">) {
  return post<Contribution>("/contributions/", data);
}
