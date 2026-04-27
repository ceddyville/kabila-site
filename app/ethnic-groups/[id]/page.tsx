import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import DetailHeader from "@/components/detail-header";
import GroupCard from "@/components/group-card";
import { fetchEthnicGroup, fetchEthnicGroupClans, fetchEthnicGroupSubGroups } from "@/lib/api";
import styles from "../../browse.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EthnicGroupDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  let group;
  let clans: { id: number; name: string; endonym?: string; ethnic_group_name?: string }[] = [];
  let subGroups: { id: number; name: string; endonym?: string; ethnic_group_name?: string }[] = [];

  try {
    [group, clans, subGroups] = await Promise.all([
      fetchEthnicGroup(numId),
      fetchEthnicGroupClans(numId),
      fetchEthnicGroupSubGroups(numId),
    ]);
  } catch {
    return (
      <>
        <Nav />
        <div className={styles.page}>
          <p className={styles.empty}>Ethnic group not found. The API may be unavailable.</p>
          <Link href="/ethnic-groups" className={styles.backLink}>&larr; Back to groups</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <Link href="/ethnic-groups" className={styles.backLink}>&larr; All ethnic groups</Link>

        <DetailHeader
          title={group.name}
          subtitle={group.endonym}
          badge={group.countries?.[0]?.name}
        />

        <div className={styles.infoGrid}>
          {group.lineage_system_display && (
            <>
              <div className={styles.infoLabel}>Lineage</div>
              <div className={styles.infoValue}>{group.lineage_system_display}</div>
            </>
          )}
          {group.population_estimate && (
            <>
              <div className={styles.infoLabel}>Population</div>
              <div className={styles.infoValue}>{group.population_estimate.toLocaleString()}</div>
            </>
          )}
          {group.languages?.primary && (
            <>
              <div className={styles.infoLabel}>Language</div>
              <div className={styles.infoValue}>{group.languages.primary.name}</div>
            </>
          )}
          {group.community_type_display && (
            <>
              <div className={styles.infoLabel}>Type</div>
              <div className={styles.infoValue}>{group.community_type_display}</div>
            </>
          )}
        </div>

        {group.description && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.sectionBody}>{group.description}</p>
          </div>
        )}

        {group.origin_story && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Origin Story</h2>
            <p className={styles.sectionBody}>{group.origin_story}</p>
          </div>
        )}

        {clans.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Clans ({clans.length})</h2>
            <div className={styles.grid}>
              {clans.map((c) => (
                <GroupCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  endonym={c.endonym}
                  href={`/clans/${c.id}`}
                />
              ))}
            </div>
          </div>
        )}

        {subGroups.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sub-groups ({subGroups.length})</h2>
            <div className={styles.tagRow}>
              {subGroups.map((sg) => (
                <span key={sg.id} className={styles.tag}>{sg.name}</span>
              ))}
            </div>
          </div>
        )}

        {group.sources && group.sources.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sources</h2>
            <ul>
              {group.sources.map((s: Record<string, unknown>, i: number) => {
                const parts = [s.title, s.author || s.publisher, s.year].filter(Boolean).join(", ");
                return (
                  <li key={i} style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>
                    {s.url ? <a href={String(s.url)} target="_blank" rel="noopener noreferrer">{parts}</a> : parts}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
