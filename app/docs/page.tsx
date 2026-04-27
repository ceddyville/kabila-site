import Nav from "@/components/nav";
import Footer from "@/components/footer";
import styles from "./docs.module.css";

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/ethnic-groups/", desc: "List all ethnic groups (filterable by region, lineage, country)" },
  { method: "GET", path: "/api/v1/ethnic-groups/{id}/", desc: "Ethnic group detail" },
  { method: "GET", path: "/api/v1/ethnic-groups/{id}/clans/", desc: "All clans for a group" },
  { method: "GET", path: "/api/v1/ethnic-groups/{id}/sub-groups/", desc: "Sub-groups for a group" },
  { method: "GET", path: "/api/v1/clans/", desc: "List all clans (filterable by group, lineage, totem)" },
  { method: "GET", path: "/api/v1/clans/{id}/", desc: "Clan detail with sub-clans" },
  { method: "GET", path: "/api/v1/sub-groups/", desc: "List sub-groups" },
  { method: "GET", path: "/api/v1/languages/", desc: "List all languages (searchable)" },
  { method: "GET", path: "/api/v1/language-families/", desc: "Language family tree" },
  { method: "GET", path: "/api/v1/traditional-authorities/", desc: "Traditional authorities and kingdoms" },
  { method: "GET", path: "/api/v1/countries/", desc: "Countries reference" },
  { method: "POST", path: "/api/v1/contributions/", desc: "Submit a community contribution" },
  { method: "GET", path: "/api/v1/mipaka/resolve/", desc: "Resolve Mipaka boundary labels" },
  { method: "GET", path: "/api/v1/ulimi/languages/", desc: "Language lookup for Ulimi integration" },
];

export default function DocsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.kabila.dev";

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <h1 className={styles.title}>API Documentation</h1>
        <p className={styles.sub}>
          The Kabila API is free and open for researchers, educators, and developers.
          All data is structured as JSON and paginated (50 items per page).
        </p>

        <div className={styles.linkCards}>
          <a href={`${apiBase.replace('/api/v1', '')}/api/docs/`} target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
            <h3 className={styles.linkTitle}>Swagger UI</h3>
            <p className={styles.linkDesc}>Interactive API explorer — try endpoints live.</p>
          </a>
          <a href={`${apiBase.replace('/api/v1', '')}/api/redoc/`} target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
            <h3 className={styles.linkTitle}>ReDoc</h3>
            <p className={styles.linkDesc}>Clean, readable API reference documentation.</p>
          </a>
        </div>

        <h2 className={styles.sectionTitle}>Endpoints</h2>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Method</span>
            <span>Path</span>
            <span>Description</span>
          </div>
          {ENDPOINTS.map((ep) => (
            <div key={ep.path + ep.method} className={styles.tableRow}>
              <span className={styles.method}>{ep.method}</span>
              <code className={styles.path}>{ep.path}</code>
              <span className={styles.desc}>{ep.desc}</span>
            </div>
          ))}
        </div>

        <h2 className={styles.sectionTitle}>Base URL</h2>
        <code className={styles.codeBlock}>{apiBase}</code>

        <h2 className={styles.sectionTitle}>Pagination</h2>
        <p className={styles.body}>
          All list endpoints return paginated responses with <code>count</code>, <code>results</code>,
          and optional <code>next</code>/<code>previous</code> links. Use <code>?page=2</code> to navigate.
        </p>

        <h2 className={styles.sectionTitle}>Filtering &amp; Search</h2>
        <p className={styles.body}>
          Most list endpoints support <code>?search=</code> for text search and field-specific
          filters like <code>?region=east_africa</code> or <code>?lineage_system=patrilineal</code>.
        </p>
      </div>
      <Footer />
    </>
  );
}
