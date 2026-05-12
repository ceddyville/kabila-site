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
  classification?: string;
  children?: LanguageFamily[] | null;
  languages?: { id: number; name: string }[] | null;
}

export interface LanguageSummary {
  id: number;
  name: string;
  endonym?: string;
  iso_639_code?: string;
}

export interface Language extends LanguageSummary {
  family_name?: string;
  family_chain?: string[];
  dialects?: string[];
  writing_systems?: string[];
  approx_speakers?: number;
  countries?: { id: number; name: string }[];
  notes?: string;
  pronunciation?: string;
  guthrie_code?: string;
  glottolog_code?: string;
  native_region?: string;
  tone_system?: string;
  word_order?: string;
  phonology_notes?: string;
  grammar_notes?: string;
  sample_phrases?: { english: string; local: string }[];
  related_languages?: string[];
  demonyms?: {
    person?: string;
    people?: string;
    language?: string;
    country?: string;
  };
}

export interface EthnicGroupSummary {
  id: number;
  name: string;
  endonym?: string;
  identification_prefix?: string;
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
  sub_group_label?: string;
}

export interface ClanSummary {
  id: number;
  name: string;
  endonym?: string;
  ethnic_group_name?: string;
}

export interface Clan extends ClanSummary {
  plural_endonym?: string;
  female_endonym?: string;
  alternate_names?: string[];
  ethnic_group?: EthnicGroupSummary;
  sub_group?: { id: number; name: string; endonym?: string; ethnic_group_name?: string; ethnic_group_id?: number };
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

export interface SubGroup extends SubGroupSummary {
  plural_endonym?: string;
  homeland?: string;
  alternate_names?: string[];
  ethnic_group?: EthnicGroupSummary;
  parent_id?: number;
  group_type?: string;
  group_type_display?: string;
  language?: { id: number; name: string };
  lineage_system?: string;
  lineage_system_display?: string;
  description?: string;
  origin_story?: string;
  population_estimate?: number;
  sources?: (string | Record<string, unknown>)[];
  is_verified?: boolean;
  clan_count?: number;
  child_count?: number;
}

export interface TraditionalAuthority {
  id: number;
  name: string;
  alternate_names?: string[];
  governance_type?: string;
  governance_type_display?: string;
  est_founding_year?: number;
  est_end_year?: number;
  territory_countries?: { id: number; name: string }[];
  ethnic_groups?: EthnicGroupSummary[];
  ruling_dynasty?: string;
  capital?: string;
  current_leader?: string;
  current_leader_title?: string;
  is_ceremonial?: boolean;
  description?: string;
  languages?: { id: number; name: string }[];
  sources?: (string | Record<string, unknown>)[];
  is_verified?: boolean;
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
