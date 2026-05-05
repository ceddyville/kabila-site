import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { fetchLanguageFamilies } from "@/lib/api";
import styles from "../browse.module.css";

export default async function LanguageFamiliesPage() {
  let families: { id: number; name: string; description?: string; children?: { id: number; name: string }[] | null }[] = [];

  try {
    const data = await fetchLanguageFamilies();
    families = data.results;
  } catch {
    /* fallback empty */
  }

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Language Families</h1>
        <p className={styles.pageSub}>
          Browse the linguistic classification tree — from macro-families down to individual languages.
        </p>

        <div className={styles.grid}>
          {families.map((f) => (
            <Link key={f.id} href={`/language-families/${f.id}`} className={styles.familyCard}>
              <div className={styles.familyCardName}>{f.name}</div>
              {f.description && (
                <div className={styles.familyCardDesc}>
                  {f.description.length > 120
                    ? f.description.slice(0, 120) + "…"
                    : f.description}
                </div>
              )}
              {f.children && f.children.length > 0 && (
                <div className={styles.familyCardMeta}>
                  {f.children.length} sub-{f.children.length === 1 ? "family" : "families"}
                </div>
              )}
            </Link>
          ))}
        </div>

        {families.length === 0 && (
          <p className={styles.empty}>No language families found. The API may be unavailable.</p>
        )}
      </div>
      <Footer />
    </>
  );
}
