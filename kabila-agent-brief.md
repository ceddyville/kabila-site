# Kabila — Agent Implementation Brief
# Paste this entire file as a prompt to your VS Code Copilot agent.
# The agent should read it fully before touching any file.

---

## CONTEXT

You are working inside the `kabila-api` repository. At this point the repo contains
**only a README.md** — no Django project has been initialised yet. You are building
everything from scratch.

A separate `kabila-site` Next.js frontend repo will be created separately — it does not exist yet. Do not create it.
**Do not touch the `kabila-site` repo unless explicitly told to below.**

This brief covers everything needed to get `kabila-api` fully scaffolded and integrated with
two sibling APIs: **Ulimi** (Trans-African Dictionary) and **Mipaka** (East African administrative boundaries).

Read every section before writing any code. Do not proceed section by section in isolation —
understand the full picture first, then implement in the order given.

### First action

Before writing any code, run these two commands from the repo root to initialise the project:

```bash
pip install -r requirements.txt
django-admin startproject config .
python manage.py startapp kabila
```

This creates `config/` as the settings module and `kabila/` as the main app — matching
the structure in Section 1.1 exactly. Do not use a nested project structure.
After running these, overwrite `config/settings.py` and `config/urls.py` with the versions
described in Sections 1.3 and 1.4 — the generated defaults will not be sufficient.

---

## SECTION 1 — Django Project Scaffold

### 1.1 Project structure to create

```
kabila-api/
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── kabila/                        ← main Django app
│   ├── __init__.py
│   ├── admin.py
│   ├── migrations/
│   │   └── __init__.py
│   ├── management/
│   │   ├── __init__.py
│   │   └── commands/
│   │       ├── __init__.py
│   │       └── sync_mipaka_labels.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   └── mipaka.py                  ← Mipaka integration layer
├── scripts/
│   └── seed_kenya.py
├── manage.py
├── requirements.txt
└── .env.example
```

### 1.2 requirements.txt

```
Django>=4.2,<5.0
djangorestframework>=3.15
django-filter>=23.0
django-cors-headers>=4.3
psycopg2-binary>=2.9
python-dotenv>=1.0
httpx>=0.27
```

### 1.3 config/settings.py

Standard Django settings. Key requirements:
- Read all secrets from environment variables using `os.environ.get()`
- `INSTALLED_APPS` must include `rest_framework`, `django_filters`, `corsheaders`, `kabila`
- Database: PostgreSQL, credentials from env vars `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `REST_FRAMEWORK` config: `DjangoFilterBackend` as default filter, `PageNumberPagination` with `PAGE_SIZE = 50`
- `CORS_ALLOW_ALL_ORIGINS = DEBUG` (restrict in production)
- Add a `MIPAKA_BASE` setting: `os.environ.get("MIPAKA_BASE", "https://mipaka-api.up.railway.app/api/v1")`

### 1.4 config/urls.py

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("kabila.urls")),
    path("api-auth/", include("rest_framework.urls")),
]
```

---

## SECTION 2 — Data Models (kabila/models.py)

Create all models in a single `models.py`. Import order and structure matters — define
choices classes first, then geography, then the main entities.

### 2.1 Choices

```python
class LineageType(models.TextChoices):
    PATRILINEAL = "patrilineal", "Patrilineal"
    MATRILINEAL = "matrilineal", "Matrilineal"
    BILATERAL   = "bilateral",   "Bilateral"
    DOUBLE      = "double",      "Double Descent"
    AMBILINEAL  = "ambilineal",  "Ambilineal"
    UNKNOWN     = "unknown",     "Unknown"

class Region(models.TextChoices):
    EAST_AFRICA    = "east_africa",    "East Africa"
    WEST_AFRICA    = "west_africa",    "West Africa"
    CENTRAL_AFRICA = "central_africa", "Central Africa"
    SOUTHERN       = "southern",       "Southern Africa"
    NORTH_AFRICA   = "north_africa",   "North Africa"

class KingdomEra(models.TextChoices):
    ANCIENT   = "ancient",   "Ancient (pre-1000 CE)"
    MEDIEVAL  = "medieval",  "Medieval (1000–1500 CE)"
    EARLY_MOD = "early_mod", "Early Modern (1500–1800 CE)"
    COLONIAL  = "colonial",  "Colonial Era (1800–1963)"
    MODERN    = "modern",    "Modern (post-independence)"
```

### 2.2 MipakaLocationMixin (abstract)

Every geographic model inherits this. Fields:

| Field | Type | Notes |
|---|---|---|
| `mipaka_division_ids` | `ArrayField(IntegerField)` | Mipaka division IDs |
| `mipaka_location_label` | `CharField(400)` | Cached: "Siaya County, Kenya" |
| `mipaka_historical_name` | `CharField(400)` | Cached: "Nam Lolwe (Dholuo, pre-colonial)" |
| `mipaka_synced_at` | `DateTimeField` | Last sync timestamp |

### 2.3 Country

Fields: `name`, `iso_code` (unique, max 3), `region`, `capital`, `created_at`, `updated_at`

### 2.4 LanguageFamily

Fields: `name` (unique), `description`, `parent` (self FK, null/blank)

### 2.5 Language

Fields: `name`, `endonym`, `iso_639_code` (unique, null), `family` (FK LanguageFamily),
`dialects` (ArrayField), `writing_systems` (ArrayField), `approx_speakers`,
`countries` (M2M Country), `notes`, `created_at`, `updated_at`

### 2.6 EthnicGroup (inherits MipakaLocationMixin)

Fields: `name`, `endonym`, `alternate_names` (ArrayField), `region`, `countries` (M2M),
`primary_language` (FK Language), `secondary_languages` (M2M Language),
`population_estimate`, `lineage_system` (LineageType), `related_groups` (M2M self, symmetrical),
`description`, `origin_story` (TextField), `cultural_notes` (JSONField),
`ulimi_language_codes` (ArrayField — ISO codes advertised to Ulimi),
`sources` (ArrayField URLField), `is_verified` (bool), `created_at`, `updated_at`

### 2.7 SubGroup (inherits MipakaLocationMixin)

A subtribe, section, or sub-division within an ethnic group. Not every ethnic group
has sub-groups — only add this layer where it exists culturally.

**Examples:**
- Luhya → Bukusu, Maragoli, Wanga, Tachoni, Samia, Idakho, Isukha, Tiriki, Kabras…
- Kalenjin → Nandi, Tugen, Kipsigis, Marakwet, Pokot, Sabaot…
- Maasai → Ilkisonko, Ilpurko, Ilmatapato, Ilwuasinkishu, Ildamat (territorial sections)

Fields: `name`, `endonym`, `alternate_names` (ArrayField),
`ethnic_group` (FK EthnicGroup, CASCADE, related_name=`sub_groups`),
`language` (FK Language, null/blank — subtribes often have distinct dialects),
`lineage_system` (LineageType), `description` (TextField), `origin_story` (TextField),
`population_estimate` (null), `sources` (ArrayField URLField),
`is_verified` (bool), `created_at`, `updated_at`

### 2.8 Clan (inherits MipakaLocationMixin)

Clans connect to **either** an `EthnicGroup` or a `SubGroup` — whichever is the
culturally accurate parent — but never both simultaneously.

**Rule:**
- Clan has direct parent ethnic group (no subtribe layer) → set `ethnic_group`, leave `sub_group` null
  *e.g. Kikuyu Anjirû clan, Luo Joka-Jok clan*
- Clan belongs to a subtribe → set `sub_group`, leave `ethnic_group` null
  *e.g. Bukusu clan within Luhya*
- SubGroup exists but has no documented clans → SubGroup stands alone, no Clan required
  *e.g. Maasai iloshon sections*

Add a `clean()` validation: raise `ValidationError` if both `ethnic_group` and `sub_group`
are set, or if neither is set.

Fields: `name`, `endonym`, `alternate_names` (ArrayField),
`ethnic_group` (FK EthnicGroup, null/blank, CASCADE, related_name=`clans`),
`sub_group` (FK SubGroup, null/blank, CASCADE, related_name=`clans`),
`parent_clan` (self FK, null/blank → `sub_clans` related_name),
`lineage_type` (LineageType), `totem`, `taboos` (ArrayField), `naming_conventions` (TextField),
`origin_story` (TextField), `geographic_area`, `notable_figures` (JSONField),
`related_clans` (M2M self, symmetrical), `sources` (ArrayField URLField),
`is_verified` (bool), `created_at`, `updated_at`

### 2.9 Kingdom (inherits MipakaLocationMixin)

Fields: `name`, `alternate_names` (ArrayField), `era` (KingdomEra),
`est_founding_year` (IntegerField, null — negative = BCE), `est_end_year` (IntegerField, null),
`territory_countries` (M2M Country), `ethnic_groups` (M2M EthnicGroup),
`ruling_dynasty`, `capital`, `successor_states` (M2M self, asymmetrical),
`description` (TextField), `languages` (M2M Language),
`sources` (ArrayField URLField), `is_verified` (bool), `created_at`, `updated_at`

### 2.10 Contribution

```python
class Status(TextChoices):
    PENDING  = "pending",  "Pending Review"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"

class TargetModel(TextChoices):
    ETHNIC_GROUP = "ethnic_group", "Ethnic Group"
    SUB_GROUP    = "sub_group",    "Sub Group"
    CLAN         = "clan",         "Clan"
    LANGUAGE     = "language",     "Language"
    KINGDOM      = "kingdom",      "Kingdom"
```

Fields: `contributor_name`, `contributor_email`, `target_model`, `target_id`,
`proposed_changes` (JSONField), `justification` (TextField), `sources` (ArrayField URLField),
`status`, `reviewer_notes` (TextField), `created_at`, `reviewed_at` (null)

---

## SECTION 3 — Serializers (kabila/serializers.py)

Create summary (compact) and full serializers for each model.

### 3.1 Patterns to follow

- Summary serializers: used when nested inside other serializers. Include `id`, `name`, `endonym` (where applicable), and one or two key fields.
- Full serializers: include all fields. Use `read_only=True` for nested objects, `write_only=True` for `_id` / `_ids` fields used in POST/PUT.
- Mipaka fields (`mipaka_location_label`, `mipaka_historical_name`) are **read-only** in all serializers — they are populated by the sync command, not by API clients.

### 3.2 Serializers to create

- `CountrySerializer`
- `LanguageFamilySerializer` (include `parent_name` via `source="parent.name"`)
- `LanguageSummarySerializer` (compact — used inside EthnicGroup)
- `LanguageSerializer` (full)
- `EthnicGroupSummarySerializer` (compact — used inside SubGroup, Clan, Kingdom)
- `EthnicGroupSerializer` (full — include `clan_count = serializers.IntegerField(source="clans.count", read_only=True)`, `sub_group_count = serializers.IntegerField(source="sub_groups.count", read_only=True)`)
- `SubGroupSummarySerializer` (compact — used inside Clan)
- `SubGroupSerializer` (full — include `clan_count = serializers.IntegerField(source="clans.count", read_only=True)`)
- `ClanSummarySerializer` (compact — include `ethnic_group` or `sub_group` whichever is set)
- `ClanSerializer` (full — include nested `sub_clans` using ClanSummarySerializer; `ethnic_group` and `sub_group` are both read-only nested; use write-only `ethnic_group_id` and `sub_group_id`)
- `KingdomSerializer` (full)
- `ContributionSerializer` (`status`, `reviewer_notes`, `reviewed_at` are read-only)

---

## SECTION 4 — Views (kabila/views.py)

Use `ModelViewSet` for all resources. Add custom `@action` endpoints where noted.

### 4.1 ViewSets

| ViewSet | Base | Extra actions |
|---|---|---|
| `CountryViewSet` | `ReadOnlyModelViewSet` | — |
| `LanguageFamilyViewSet` | `ReadOnlyModelViewSet` | `GET {id}/languages/` |
| `LanguageViewSet` | `ModelViewSet` | `GET {id}/ethnic-groups/` |
| `EthnicGroupViewSet` | `ModelViewSet` | `GET {id}/sub-groups/`, `GET {id}/clans/`, `GET {id}/kingdoms/` |
| `SubGroupViewSet` | `ModelViewSet` | `GET {id}/clans/` |
| `ClanViewSet` | `ModelViewSet` | `GET {id}/sub-clans/` |
| `KingdomViewSet` | `ModelViewSet` | — |
| `ContributionViewSet` | `ModelViewSet` | — |

### 4.2 Filter fields

- `EthnicGroup`: `region`, `lineage_system`, `countries`, `is_verified`
- `SubGroup`: `ethnic_group`, `lineage_system`, `is_verified`
- `Clan`: `ethnic_group`, `sub_group`, `lineage_type`, `is_verified`
- `Kingdom`: `era`, `territory_countries`, `is_verified`
- `Contribution`: `status`, `target_model`

### 4.3 Search fields

- `EthnicGroup`: `name`, `endonym`, `alternate_names`
- `SubGroup`: `name`, `endonym`, `alternate_names`
- `Clan`: `name`, `endonym`, `totem`, `alternate_names`
- `Kingdom`: `name`, `alternate_names`, `ruling_dynasty`, `capital`
- `Language`: `name`, `endonym`, `iso_639_code`

---

## SECTION 5 — Mipaka Integration (kabila/mipaka.py)

Create a standalone `mipaka.py` module. Do NOT put this in `views.py`.

### 5.1 MipakaService class

A class with only `@staticmethod` and `@classmethod` methods. Uses `httpx` (sync).
Set `MIPAKA_TIMEOUT = 6`. Read `MIPAKA_BASE` from Django settings.

Methods to implement:

```python
MipakaService.search_divisions(q, country=None) -> list
# GET /api/v1/divisions/?q={q}&country={country}

MipakaService.get_division(division_id) -> dict | None
# GET /api/v1/divisions/{id}/

MipakaService.get_historical_names(division_id) -> list
# GET /api/v1/divisions/{id}/names/

MipakaService.get_indigenous_names(division_id) -> list
# GET /api/v1/names/?name_type=indigenous&division={id}

MipakaService.get_division_at_year(division_id, year) -> dict | None
# GET /api/v1/divisions/?year={year}&id={division_id}

MipakaService.build_location_label(division_ids) -> str
# Resolves up to 3 IDs → "Siaya County · Homabay County, Kenya"

MipakaService.build_historical_label(division_ids) -> str
# Resolves indigenous names → "Nam Lolwe (Dholuo, pre-colonial)"
```

All methods must catch ALL exceptions and return `[]`, `None`, or `""` — never raise.
Mipaka being unreachable must never cause a Kabila API error.

### 5.2 mipaka_resolve view

A single `@api_view(["GET"])` function at `/api/v1/mipaka/resolve/`.

Supported query params:

| Param | Behaviour |
|---|---|
| `?q=Siaya&country=KE` | Search divisions, return list of matches |
| `?division_id=42` | Full detail + historical names for one division |
| `?division_id=42&year=1650` | As above + era-specific name |
| `?division_ids=42,43` | Batch — build combined current + historical labels |

Response shape for all calls:
```json
{
  "current_label":    "Siaya County, Kenya",
  "historical_label": "Nam Lolwe (Dholuo, pre-colonial)",
  "divisions":        [...],
  "historical_names": [...],
  "indigenous_names": [...]
}
```

### 5.3 sync_mipaka_labels management command

Create `kabila/management/commands/sync_mipaka_labels.py`.

The command iterates `EthnicGroup`, `Clan`, and `Kingdom` objects where
`mipaka_division_ids` is not empty, calls `MipakaService.build_location_label()`
and `MipakaService.build_historical_label()`, saves the results back to the record,
and sets `mipaka_synced_at = timezone.now()`. Use `update_fields` to avoid
overwriting unrelated fields. Print progress per record. Handle errors per-record
without aborting the whole run.

---

## SECTION 6 — URLs (kabila/urls.py)

```python
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CountryViewSet, LanguageFamilyViewSet, LanguageViewSet,
    EthnicGroupViewSet, ClanViewSet, KingdomViewSet, ContributionViewSet,
)
from .mipaka import mipaka_resolve

router = DefaultRouter()
router.register(r"countries",         CountryViewSet,        basename="country")
router.register(r"language-families", LanguageFamilyViewSet, basename="language-family")
router.register(r"languages",         LanguageViewSet,       basename="language")
router.register(r"ethnic-groups",     EthnicGroupViewSet,    basename="ethnic-group")
router.register(r"sub-groups",        SubGroupViewSet,       basename="sub-group")
router.register(r"clans",             ClanViewSet,           basename="clan")
router.register(r"kingdoms",          KingdomViewSet,        basename="kingdom")
router.register(r"contributions",     ContributionViewSet,   basename="contribution")

urlpatterns = router.urls + [
    path("mipaka/resolve/", mipaka_resolve, name="mipaka-resolve"),
    path("ulimi/languages/", ulimi_language_lookup, name="ulimi-language-lookup"),
]
```

---

## SECTION 7 — Ulimi Integration (also in kabila/views.py)

Add a standalone `@api_view(["GET"])` function called `ulimi_language_lookup`.

**Purpose:** When a contributor in Ulimi selects their ethnic group or clan,
Ulimi calls this endpoint to get the relevant language options for the dropdown.

**Supported params:**

| Param | Behaviour |
|---|---|
| `?ethnic_group={id}` | Return all languages for this group (primary + secondary) |
| `?sub_group={id}` | Inherit parent ethnic group's languages via sub-group |
| `?clan={id}` | Inherit languages from parent sub-group or ethnic group |
| `?search=kikuyu` | Fuzzy match on group or sub-group name, return languages |

**Response shape (matches Ulimi's language selector contract):**

```json
[
  {
    "iso_code": "ki",
    "name": "Gĩkũyũ",
    "endonym": "Gĩkũyũ",
    "ethnic_group": "Kikuyu",
    "clan": "Anjirû",
    "kabila_ethnic_group_id": 1,
    "kabila_clan_id": 7
  }
]
```

Use a private helper `_collect_languages(group)` that returns primary + secondary
languages deduped by PK.

---

## SECTION 8 — Admin (kabila/admin.py)

Register all models. For each:
- `list_display`: name, key identifying fields, `is_verified`
- `search_fields`: name, endonym
- `list_filter`: region/lineage/status as appropriate
- `filter_horizontal`: for all M2M fields
- For models with Mipaka fields, add `mipaka_division_ids`, `mipaka_location_label`,
  `mipaka_historical_name` to a `fieldsets` section called "Mipaka Location"
  with `classes: ("collapse",)` so it's hidden by default but accessible

---

## SECTION 9 — Kenya Seed Data (scripts/seed_kenya.py)

Create a seed script runnable via `python manage.py shell < scripts/seed_kenya.py`.

Seed the following — use `get_or_create` throughout so it's safe to re-run:

**Language families:** Niger-Congo → Bantu, Nilo-Saharan → Nilotic, Afroasiatic → Cushitic

**Languages:**
- Gĩkũyũ (iso: ki, family: Bantu, ~8.1M speakers)
- Dholuo (iso: luo, family: Nilotic, ~4.2M speakers, dialects: Alego, Asembo, Karachuonyo)
- Maa (iso: mas, family: Nilotic, ~1.5M speakers)
- Kiswahili (iso: sw, family: Bantu, ~200M speakers)

**Ethnic groups (with Mipaka cached labels):**

| Group | mipaka_location_label | mipaka_historical_name |
|---|---|---|
| Kikuyu | Murang'a · Kiambu · Nyeri · Kirinyaga, Kenya | Gĩkũyũland (Gĩkũyũ, pre-colonial) |
| Luo | Siaya · Kisumu · Homabay · Migori, Kenya | Nam Lolwe (Dholuo, pre-colonial) |
| Maasai | Narok · Kajiado, Kenya; Arusha · Manyara, Tanzania | Keekonyokie (Maa, pre-colonial) |

**Kikuyu clans (all 9 — the daughters of Moombi):**

| Clan | Totem | Origin |
|---|---|---|
| Acheera | Colobus monkey | Waceera, 1st daughter |
| Agachiku | Wild cat | Wangeci, 2nd daughter |
| Airîîtî | Goat | Wairîîtî, 3rd daughter |
| Ambui | Dove | Wambui, 4th daughter |
| Angari | Serval cat | Wangari, 5th daughter |
| Anjirû | Elephant | Wanjirû, 6th daughter |
| Aithîîrîga | Python | Waithîîrîga, 7th daughter |
| Airimu | Bush pig | Wairimu, 8th daughter |
| Ithaga | Mole | Nyambura, 9th daughter |

All Kikuyu clans: `lineage_type=patrilineal`, `is_verified=True`

**Luo clans:** Joka-Jok (Siaya), Joka-Owiny (Homabay), Seje (Kisumu),
Karachuonyo (Homabay), Alego (Siaya), Uyoma (Siaya)

**Maasai sections (as SubGroups — no clan layer):**
Ilkisonko (Kajiado), Ilpurko (Narok), Ilmatapato (Narok), Ilwuasinkishu (Nakuru), Ildamat (Trans-Mara)

**Luhya SubGroups** (seed 5 of the 20+, mark others as planned):
Bukusu, Maragoli, Wanga, Tachoni, Samia — all under Luhya ethnic group.
Note: Luhya itself has no direct clans — all clans belong to sub-groups.
The Wanga sub-group had a kingdom (Wanga Kingdom, `era=colonial`, ruling dynasty: Nabongo).

**Kalenjin SubGroups** (seed 4):
Nandi, Tugen, Kipsigis, Marakwet — all under Kalenjin ethnic group.

> **Seeding rule:** When creating a Clan, check whether the parent is an EthnicGroup
> or a SubGroup and set the correct FK. Leave the other FK null. Use `get_or_create`.

Print a summary count at the end.

---

## SECTION 10 — Next.js Integration Points (READ ONLY — no changes yet)

**Do not modify the `kabila-site` repo.** This section documents what the frontend
will need so you understand the contract your API must satisfy.

The Next.js app uses two dynamic route pages:
- `app/tribes/[slug]/page.tsx` — fetches `GET /api/v1/ethnic-groups/?search={slug}`
- `app/clans/[slug]/page.tsx` — fetches `GET /api/v1/clans/{id}/` or `?search={slug}`

Both pages call `/api/v1/mipaka/resolve/` after initial load to enrich location data.
The Ulimi language lookup is called from Ulimi's own frontend, not from Kabila's.

The API must therefore:
1. Return `mipaka_location_label` and `mipaka_historical_name` on `EthnicGroup` and `Clan` responses
2. Support both numeric ID and name-based lookups on `/clans/`
3. Return `ulimi_language_codes` on `EthnicGroup` responses

---

## IMPLEMENTATION ORDER

Execute strictly in this order. Do not skip ahead.

1. Create `requirements.txt`
2. Run `pip install -r requirements.txt`
3. Run `django-admin startproject config .` — creates `config/` and `manage.py`
4. Run `python manage.py startapp kabila` — creates `kabila/` app folder
5. Overwrite `config/settings.py` and `config/urls.py` with versions from Sections 1.3 and 1.4
6. Create `kabila/models.py` — all models including MipakaLocationMixin
7. Run `python manage.py makemigrations kabila`
8. Create `kabila/serializers.py`
9. Create `kabila/mipaka.py` — MipakaService + mipaka_resolve view
10. Create `kabila/views.py` — all ViewSets + ulimi_language_lookup
11. Create `kabila/urls.py`
12. Create `kabila/admin.py`
13. Create `kabila/management/commands/sync_mipaka_labels.py`
14. Create `scripts/seed_kenya.py`
15. Run `python manage.py migrate`
16. Run `python manage.py shell < scripts/seed_kenya.py`
17. Run `python manage.py runserver` and verify `/api/v1/` browsable API loads
18. Verify `/api/v1/ethnic-groups/` returns Kikuyu, Luo, Maasai, Luhya, Kalenjin
19. Verify `/api/v1/sub-groups/?ethnic_group={luhya_id}` returns Bukusu, Maragoli, Wanga, Tachoni, Samia
20. Verify `/api/v1/clans/?sub_group={bukusu_id}` returns Bukusu clans
21. Verify `/api/v1/mipaka/resolve/?q=Siaya&country=KE` proxies correctly to Mipaka
22. Verify `/api/v1/ulimi/languages/?ethnic_group=1` returns language list

---

## CONSTRAINTS — read before writing any code

- **Never modify** anything in the `kabila-site` repo
- **Never rename** any endpoint — Ulimi and Mipaka are already integrated against these URLs
- All Mipaka calls must be wrapped in try/except — a Mipaka outage must never cause a 500
- Use `get_or_create` in all seed scripts — must be safe to re-run
- Do not use `SOLID` ShadingType anywhere (unrelated docx constraint — ignore)
- `.env` must never be committed — `.env.example` only
- All ArrayFields require `default=list` not `default=[]`
- The `sync_mipaka_labels` command must use `update_fields` — never a full `.save()`

---

## ENVIRONMENT VARIABLES (.env.example)

```
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=kabila
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

MIPAKA_BASE=https://mipaka-api.up.railway.app/api/v1
```

---

## DONE

When all 17 verification steps pass, reply with:
"Kabila API scaffold complete. All 22 steps verified."
Then stop — do not proceed to the `kabila-site` repo.
