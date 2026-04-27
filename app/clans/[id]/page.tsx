import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import DetailHeader from "@/components/detail-header";
import GroupCard from "@/components/group-card";
import { fetchClan } from "@/lib/api";
import styles from "../../browse.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClanDetailPage({ params }: Props) {
  const { id } = await params;

  let clan;
  try {
    clan = await fetchClan(parseInt(id, 10));
  } catch {
    return (
      <>
        <Nav />
        <div className={styles.page}>
          <p className={styles.empty}>Clan not found. The API may be unavailable.</p>
          <Link href="/clans" className={styles.backLink}>&larr; Back to clans</Link>
        </div>
        <Footer />
      </>
    );
  }

  const groupName = clan.ethnic_group?.name ?? clan.sub_group?.ethnic_group_name ?? "";

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <Link href="/clans" className={styles.backLink}>&larr; All clans</Link>

        <DetailHeader
          title={clan.name}
          subtitle={clan.endonym}
          badge={groupName}
        />

        <div className={styles.infoGrid}>
          {clan.totem && (
            <>
              <div className={styles.infoLabel}>Totem</div>
              <div className={styles.infoValue}>{clan.totem}</div>
            </>
          )}
          {clan.lineage_type_display && (
            <>
              <div className={styles.infoLabel}>Lineage</div>
              <div className={styles.infoValue}>{clan.lineage_type_display}</div>
            </>
          )}
          {clan.geographic_area && (
            <>
              <div className={styles.infoLabel}>Geographic Area</div>
              <div className={styles.infoValue}>{clan.geographic_area}</div>
            </>
          )}
          {clan.parent_clan_name && (
            <>
              <div className={styles.infoLabel}>Parent Clan</div>
              <div className={styles.infoValue}>{clan.parent_clan_name}</div>
            </>
          )}
        </div>

        {clan.origin_story && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Origin Story</h2>
            <p className={styles.sectionBody}>{clan.origin_story}</p>
          </div>
        )}

        {clan.naming_conventions && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Naming Conventions</h2>
            <p className={styles.sectionBody}>{clan.naming_conventions}</p>
          </div>
        )}

        {clan.taboos && clan.taboos.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Taboos</h2>
            <div className={styles.tagRow}>
              {clan.taboos.map((t, i) => (
                <span key={i} className={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {clan.sub_clans && clan.sub_clans.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sub-clans ({clan.sub_clans.length})</h2>
            <div className={styles.grid}>
              {clan.sub_clans.map((sc) => (
                <GroupCard
                  key={sc.id}
                  id={sc.id}
                  name={sc.name}
                  endonym={sc.endonym}
                  href={`/clans/${sc.id}`}
                />
              ))}
            </div>
          </div>
        )}

        {clan.sources && clan.sources.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sources</h2>
            <ul>
              {clan.sources.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
