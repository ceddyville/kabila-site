import { Suspense } from "react";
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchBar from "@/components/search-bar";
import FilterChips from "@/components/filter-chips";
import GroupCard from "@/components/group-card";
import { fetchClans } from "@/lib/api";
import { SAMPLE_CLANS } from "@/lib/sample-data";
import styles from "../browse.module.css";

const LINEAGE_OPTS = [
  { value: "patrilineal", label: "Patrilineal" },
  { value: "matrilineal", label: "Matrilineal" },
  { value: "bilateral", label: "Bilateral" },
];

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ClansPage({ searchParams }: Props) {
  const params = await searchParams;
  const apiParams: Record<string, string> = {};
  if (params.search) apiParams.search = params.search;
  if (params.lineage_type) apiParams.lineage_type = params.lineage_type;
  if (params.ethnic_group) apiParams.ethnic_group = params.ethnic_group;
  if (params.page) apiParams.page = params.page;

  let clans: { id: number; name: string; endonym?: string; ethnic_group_name?: string; totem?: string }[] = SAMPLE_CLANS;
  let count = clans.length;
  let hasNext = false;
  let hasPrev = false;
  const page = parseInt(params.page ?? "1", 10);

  try {
    const data = await fetchClans(apiParams);
    clans = data.results.map((c) => ({
      id: c.id,
      name: c.name,
      endonym: c.endonym,
      ethnic_group_name: c.ethnic_group?.name ?? c.ethnic_group_name,
      totem: c.totem,
    }));
    count = data.count;
    hasNext = !!data.next;
    hasPrev = !!data.previous;
  } catch {
    /* fallback to sample data */
  }

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Clans</h1>
        <p className={styles.pageSub}>{count} clans in the database</p>
        <Suspense>
          <SearchBar placeholder="Search clans, totems..." />
          <FilterChips paramName="lineage_type" options={LINEAGE_OPTS} />
        </Suspense>
        <div className={styles.grid}>
          {clans.map((c) => (
            <GroupCard
              key={c.id}
              id={c.id}
              name={c.name}
              endonym={c.endonym}
              extra={[c.ethnic_group_name, c.totem ? `Totem: ${c.totem}` : ""].filter(Boolean).join(" · ")}
              href={`/clans/${c.id}`}
            />
          ))}
        </div>
        {clans.length === 0 && <p className={styles.empty}>No clans found.</p>}
        <div className={styles.pagination}>
          {hasPrev && <Link href={`?page=${page - 1}`} className={styles.pageBtn}>&larr; Previous</Link>}
          {hasNext && <Link href={`?page=${page + 1}`} className={styles.pageBtn}>Next &rarr;</Link>}
        </div>
      </div>
      <Footer />
    </>
  );
}
