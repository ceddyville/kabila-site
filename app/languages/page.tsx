import { Suspense } from "react";
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchBar from "@/components/search-bar";
import GroupCard from "@/components/group-card";
import { fetchLanguages } from "@/lib/api";
import styles from "../browse.module.css";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LanguagesPage({ searchParams }: Props) {
  const params = await searchParams;
  const apiParams: Record<string, string> = {};
  if (params.search) apiParams.search = params.search;
  if (params.page) apiParams.page = params.page;

  let languages: { id: number; name: string; endonym?: string; iso_639_code?: string; approx_speakers?: number; family_name?: string }[] = [];
  let count = 0;
  let hasNext = false;
  let hasPrev = false;
  const page = parseInt(params.page ?? "1", 10);

  try {
    const data = await fetchLanguages(apiParams);
    languages = data.results;
    count = data.count;
    hasNext = !!data.next;
    hasPrev = !!data.previous;
  } catch {
    /* API unavailable */
  }

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Languages</h1>
        <p className={styles.pageSub}>{count} languages in the database</p>
        <Suspense>
          <SearchBar placeholder="Search languages..." />
        </Suspense>
        <div className={styles.grid}>
          {languages.map((l) => (
            <GroupCard
              key={l.id}
              id={l.id}
              name={l.name}
              endonym={l.endonym}
              extra={[
                l.family_name,
                l.iso_639_code ? `ISO: ${l.iso_639_code}` : "",
                l.approx_speakers ? `${(l.approx_speakers / 1_000_000).toFixed(1)}M speakers` : "",
              ].filter(Boolean).join(" · ")}
              href={`/languages`}
            />
          ))}
        </div>
        {languages.length === 0 && <p className={styles.empty}>No languages found. The API may be unavailable.</p>}
        <div className={styles.pagination}>
          {hasPrev && <Link href={`?page=${page - 1}`} className={styles.pageBtn}>&larr; Previous</Link>}
          {hasNext && <Link href={`?page=${page + 1}`} className={styles.pageBtn}>Next &rarr;</Link>}
        </div>
      </div>
      <Footer />
    </>
  );
}
