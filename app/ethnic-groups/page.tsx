import { Suspense } from "react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchBar from "@/components/search-bar";
import FilterChips from "@/components/filter-chips";
import GroupCard from "@/components/group-card";
import { fetchEthnicGroups } from "@/lib/api";
import { SAMPLE_ETHNIC_GROUPS } from "@/lib/sample-data";
import styles from "../browse.module.css";
import Link from "next/link";

const REGION_OPTS = [
  { value: "east_africa", label: "East Africa" },
  { value: "west_africa", label: "West Africa" },
  { value: "central_africa", label: "Central Africa" },
  { value: "southern", label: "Southern Africa" },
  { value: "north_africa", label: "North Africa" },
];

const LINEAGE_OPTS = [
  { value: "patrilineal", label: "Patrilineal" },
  { value: "matrilineal", label: "Matrilineal" },
  { value: "bilateral", label: "Bilateral" },
];

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function EthnicGroupsPage({ searchParams }: Props) {
  const params = await searchParams;
  const apiParams: Record<string, string> = {};
  if (params.search) apiParams.search = params.search;
  if (params.region) apiParams.region = params.region;
  if (params.lineage_system) apiParams.lineage_system = params.lineage_system;
  if (params.page) apiParams.page = params.page;

  let groups: { id: number; name: string; endonym?: string; clan_count?: number; sub_group_count?: number; lineage_system_display?: string; countries?: { id: number; name: string }[] }[] = SAMPLE_ETHNIC_GROUPS;
  let count = groups.length;
  let hasNext = false;
  let hasPrev = false;
  const page = parseInt(params.page ?? "1", 10);

  try {
    const data = await fetchEthnicGroups(apiParams);
    groups = data.results;
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
        <h1 className={styles.pageTitle}>Ethnic Groups</h1>
        <p className={styles.pageSub}>{count} groups in the database</p>
        <Suspense>
          <SearchBar placeholder="Search ethnic groups..." />
          <FilterChips paramName="region" options={REGION_OPTS} />
          <FilterChips paramName="lineage_system" options={LINEAGE_OPTS} />
        </Suspense>
        <div className={styles.grid}>
          {groups.map((g) => {
            const stats = [];
            if (g.sub_group_count) stats.push({ label: "sub-groups", value: g.sub_group_count });
            if (g.clan_count) stats.push({ label: "clans", value: g.clan_count });
            return (
              <GroupCard
                key={g.id}
                id={g.id}
                name={g.name}
                endonym={g.endonym}
                stats={stats}
                extra={g.lineage_system_display || undefined}
                badge={g.countries?.[0]?.name}
                href={`/ethnic-groups/${g.id}`}
              />
            );
          })}
        </div>
        {groups.length === 0 && <p className={styles.empty}>No ethnic groups found.</p>}
        <div className={styles.pagination}>
          {hasPrev && <Link href={`?page=${page - 1}`} className={styles.pageBtn}>&larr; Previous</Link>}
          {hasNext && <Link href={`?page=${page + 1}`} className={styles.pageBtn}>Next &rarr;</Link>}
        </div>
      </div>
      <Footer />
    </>
  );
}
