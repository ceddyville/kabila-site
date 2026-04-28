export interface Country {
  id: number;
  name: string;
  iso_code: string;
  capital?: string;
  region?: string;
  region_display?: string;
}

export interface LanguageFamily {
  id: number;
  name: string;
  description?: string;
  parent_name?: string;
}

export interface LanguageSummary {
  id: number;
  name: string;
  endonym?: string;
  iso_639_code?: string;
}

export interface Language extends LanguageSummary {
  family_name?: string;
  dialects?: string[];
  writing_systems?: string[];
  approx_speakers?: number;
  countries?: { id: number; name: string }[];
  notes?: string;
}

export interface EthnicGroupSummary {
  id: number;
  name: string;
  endonym?: string;
}

export interface EthnicGroup extends EthnicGroupSummary {
  alternate_names?: string[];
  community_type?: string;
  community_type_display?: string;
  countries?: { id: number; name: string }[];
  languages?: {
    primary?: { id: number; name: string };
    secondary?: { id: number; name: string }[];
  };
  population_estimate?: number;
  lineage_system?: string;
  lineage_system_display?: string;
  description?: string;
  origin_story?: string;
  cultural_notes?: Record<string, unknown>;
  sources?: (string | Record<string, unknown>)[];
  is_verified?: boolean;
  clan_count?: number;
  sub_group_count?: number;
}

export interface ClanSummary {
  id: number;
  name: string;
  endonym?: string;
  ethnic_group_name?: string;
}

export interface Clan extends ClanSummary {
  alternate_names?: string[];
  ethnic_group?: EthnicGroupSummary;
  sub_group?: { id: number; name: string; endonym?: string; ethnic_group_name?: string };
  parent_clan_name?: string;
  lineage_type?: string;
  lineage_type_display?: string;
  totem?: string;
  taboos?: string[];
  naming_conventions?: string;
  origin_story?: string;
  geographic_area?: string;
  notable_figures?: unknown[];
  related_clans?: number[];
  sources?: (string | Record<string, unknown>)[];
  is_verified?: boolean;
  sub_clans?: ClanSummary[];
}

export interface SubGroupSummary {
  id: number;
  name: string;
  endonym?: string;
  ethnic_group_name?: string;
  parent_name?: string;
}

export interface Contribution {
  id?: number;
  contributor_name: string;
  contributor_email: string;
  target_model: string;
  target_id: number;
  proposed_changes: Record<string, unknown>;
  justification?: string;
  sources?: string[];
  status?: string;
  reviewer_notes?: string;
  created_at?: string;
  reviewed_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
