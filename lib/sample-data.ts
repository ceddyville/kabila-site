export const LANDING_STATS = [
  { num: "42+", label: "Ethnic Groups" },
  { num: "200+", label: "Clans" },
  { num: "18", label: "Language Families" },
  { num: "100%", label: "Open Data" },
];

export const FEATURES = [
  {
    title: "Ethnic Groups & Clans",
    desc: "Structured data on lineage systems, totems, origin stories, and clan hierarchies. From the 9 daughters of Moombi to the 71 Sabaot clans.",
    iconBg: "var(--glow-earth)",
  },
  {
    title: "Language Families",
    desc: "Track Niger-Congo, Nilo-Saharan, Afroasiatic, and beyond — with endonyms, dialects, and speaker counts linked to ethnic groups.",
    iconBg: "rgba(196,114,14,.08)",
  },
  {
    title: "Mipaka Integration",
    desc: "Every group and clan is linked to administrative boundaries via the Mipaka API — see both colonial-era and modern territory names.",
    iconBg: "var(--glow-ocean)",
  },
  {
    title: "Community Contributions",
    desc: "Anyone can propose corrections or additions. Source-verified, reviewed, and transparent — because this data belongs to everyone.",
    iconBg: "var(--glow-ocean)",
  },
];

export const SAMPLE_ETHNIC_GROUPS = [
  {
    id: 1,
    name: "Kikuyu",
    endonym: "Agĩkũyũ",
    clan_count: 9,
    lineage_system_display: "Patrilineal",
    countries: [{ id: 1, name: "Kenya" }],
  },
  {
    id: 2,
    name: "Luo",
    endonym: "Joluo",
    clan_count: 6,
    lineage_system_display: "Patrilineal",
    countries: [{ id: 1, name: "Kenya" }],
  },
  {
    id: 3,
    name: "Maasai",
    endonym: "Ilmaasai",
    clan_count: 5,
    lineage_system_display: "Patrilineal",
    countries: [{ id: 1, name: "Kenya" }, { id: 2, name: "Tanzania" }],
  },
];

export const SAMPLE_CLANS = [
  { id: 1, name: "Anjirû", endonym: "Anjirû", ethnic_group_name: "Kikuyu", totem: "Elephant" },
  { id: 2, name: "Acheera", endonym: "Acheera", ethnic_group_name: "Kikuyu", totem: "Colobus monkey" },
  { id: 3, name: "Ambui", endonym: "Ambui", ethnic_group_name: "Kikuyu", totem: "Dove" },
  { id: 4, name: "Joka-Jok", ethnic_group_name: "Luo" },
  { id: 5, name: "Joka-Owiny", ethnic_group_name: "Luo" },
  { id: 6, name: "Ilkisonko", ethnic_group_name: "Maasai" },
];
