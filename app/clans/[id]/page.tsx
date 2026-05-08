import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { fetchClan } from "@/lib/api";
import s from "../../detail.module.css";

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
        <div className={s.errorPage}>
          <p className={s.errorText}>Clan not found. The API may be unavailable.</p>
          <Link href="/clans" className={s.backLink}>&larr; Back to clans</Link>
        </div>
        <Footer />
      </>
    );
  }

  const groupName = clan.ethnic_group?.name ?? clan.sub_group?.ethnic_group_name ?? "";
  const groupId = clan.ethnic_group?.id;
  const subGroupName = clan.sub_group?.name;
  const subGroupId = clan.sub_group?.id;
  const subClans = clan.sub_clans ?? [];
  const parentClanName = clan.parent_clan_name;
  // Determine the "back" target: sub-group if clan belongs to one, else ethnic group
  const backHref = subGroupId ? `/sub-groups/${subGroupId}` : groupId ? `/ethnic-groups/${groupId}` : "/clans";
  const backLabel = subGroupName ?? groupName;

  return (
    <>
      <Nav />

      {/* Breadcrumb */}
      <div className={s.breadcrumb}>
        <Link href="/">Kabila</Link>
        <span className={s.breadcrumbSep}>›</span>
        <Link href="/ethnic-groups">Ethnic groups</Link>
        <span className={s.breadcrumbSep}>›</span>
        {groupId ? (
          <Link href={`/ethnic-groups/${groupId}`}>{groupName}</Link>
        ) : (
          <span>{groupName}</span>
        )}
        {subGroupId && (
          <>
            <span className={s.breadcrumbSep}>›</span>
            <Link href={`/sub-groups/${subGroupId}`}>{subGroupName}</Link>
          </>
        )}
        <span className={s.breadcrumbSep}>›</span>
        <span className={s.breadcrumbCurrent}>{clan.name}</span>
      </div>

      {/* Dark hero (compact) */}
      <div className={s.heroCompact}>
        <div className={s.heroInner}>
          <Link href={backHref} className={s.heroBack}>
            ← Back to {backLabel}
          </Link>
          <div className={s.heroLabel}>{subGroupName ?? groupName} · Clan</div>
          <div className={s.heroNameCompact}>{clan.name}</div>
          {clan.endonym && <div className={s.heroEndonymCompact}>{clan.endonym}</div>}
          <div className={s.heroTags}>
            {groupName && (
              <span className={s.heroTag}><strong>{groupName}</strong></span>
            )}
            {clan.lineage_type_display && (
              <span className={s.heroTag}><strong>{clan.lineage_type_display}</strong> lineage</span>
            )}
            {clan.totem && (
              <span className={s.heroTagTotem}>Totem: <strong>{clan.totem}</strong></span>
            )}
            {clan.geographic_area && (
              <span className={s.heroTag}>{clan.geographic_area}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body: 2-column */}
      <div className={s.bodyWrap}>
        <div className={s.contentGridNarrowSidebar}>
          {/* ── Main column ── */}
          <div>
            {/* Self-identification */}
            {(clan.endonym || clan.plural_endonym || clan.female_endonym) && (
              <section className={s.section}>
                <div className={s.sectionHeading}>How they identify</div>
                <div className={s.demonymTable}>
                  {clan.endonym && (
                    <div className={s.demonymRow}>
                      <span className={s.demonymLabel}>Man (singular)</span>
                      <span className={s.demonymValue}>{clan.endonym}</span>
                    </div>
                  )}
                  {clan.female_endonym && (
                    <div className={s.demonymRow}>
                      <span className={s.demonymLabel}>Woman (singular)</span>
                      <span className={s.demonymValue}>{clan.female_endonym}</span>
                    </div>
                  )}
                  {clan.plural_endonym && (
                    <div className={s.demonymRow}>
                      <span className={s.demonymLabel}>Clan members (plural)</span>
                      <span className={s.demonymValue}>{clan.plural_endonym}</span>
                    </div>
                  )}
                </div>
                {(clan.endonym || clan.female_endonym) && (
                  <p className={s.demonymNote}>
                    A man says <em>&ldquo;Ndi {clan.endonym ?? clan.name}&rdquo;</em>
                    {clan.female_endonym ? <>, a woman says <em>&ldquo;Ndi {clan.female_endonym}&rdquo;</em></> : ""}.
                  </p>
                )}
              </section>
            )}

            {/* Origin story */}
            {clan.origin_story && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Origin story &amp; oral tradition</div>
                <div className={s.originBlock}>{clan.origin_story}</div>
              </section>
            )}

            {/* Taboos */}
            {clan.taboos && clan.taboos.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Totem &amp; taboos</div>
                <ul className={s.tabooList}>
                  {clan.taboos.map((t, i) => (
                    <li key={i} className={s.tabooItem}>{t}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Naming conventions */}
            {clan.naming_conventions && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Naming conventions</div>
                <div className={s.namingBlock}>{clan.naming_conventions}</div>
              </section>
            )}

            {/* Geographic area */}
            {clan.geographic_area && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Geographic area</div>
                <div className={s.geoBlock}>{clan.geographic_area}</div>
              </section>
            )}

            {/* Sub-clans */}
            <section className={s.section}>
              <div className={s.sectionHeading}>Sub-clans{subClans.length > 0 ? ` (${subClans.length})` : ""}</div>
              {subClans.length > 0 ? (
                <div className={s.subClanGrid}>
                  {subClans.map((sc) => (
                    <Link key={sc.id} href={`/clans/${sc.id}`} className={s.subClanTag}>
                      {sc.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className={s.sectionMuted}>
                  No sub-clans documented yet.{" "}
                  <Link href="/contribute" className={s.inlineLink}>Submit one →</Link>
                </p>
              )}
            </section>

            {/* Sources */}
            {clan.sources && clan.sources.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Sources</div>
                <ul style={{ paddingLeft: 18 }}>
                  {clan.sources.map((src, i) => {
                    if (typeof src === "string") return <li key={i} style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>{src}</li>;
                    const obj = src as Record<string, unknown>;
                    const parts = [obj.title, obj.author || obj.publisher, obj.year].filter(Boolean).join(", ");
                    return (
                      <li key={i} style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>
                        {obj.url ? <a href={String(obj.url)} target="_blank" rel="noopener noreferrer" className={s.inlineLink}>{parts}</a> : parts}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div>
            {/* Totem panel */}
            {clan.totem && (
              <div className={s.totemPanel}>
                <div className={s.totemLabel}>Clan totem</div>
                <div className={s.totemName}>{clan.totem}</div>
              </div>
            )}

            {/* Parent ethnic group link */}
            {groupId && (
              <Link href={`/ethnic-groups/${groupId}`} className={s.parentLinkCard}>
                <div className={s.parentLinkLabel}>Parent ethnic group</div>
                <div className={s.parentLinkName}>{groupName}</div>
                {clan.ethnic_group?.endonym && (
                  <div className={s.parentLinkEndonym}>{clan.ethnic_group.endonym}</div>
                )}
                <div className={s.parentLinkArrow}>→</div>
              </Link>
            )}

            {/* Parent sub-group link */}
            {subGroupId && (
              <Link href={`/sub-groups/${subGroupId}`} className={s.parentLinkCard}>
                <div className={s.parentLinkLabel}>Sub-group</div>
                <div className={s.parentLinkName}>{subGroupName}</div>
                <div className={s.parentLinkArrow}>→</div>
              </Link>
            )}

            {/* Parent clan link */}
            {clan.parent_clan_name && (
              <div className={s.parentLinkCard} style={{ cursor: "default" }}>
                <div className={s.parentLinkLabel}>Parent clan</div>
                <div className={s.parentLinkName}>{clan.parent_clan_name}</div>
              </div>
            )}

            {/* At a glance */}
            <div className={s.sidebarCard}>
              <div className={s.sidebarCardHeader}>At a glance</div>
              <div className={s.sidebarCardBody}>
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Clan name</span>
                  <span className={s.sidebarVal}>{clan.name}</span>
                </div>
                {clan.endonym && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Endonym</span>
                    <span className={s.sidebarVal}>{clan.endonym}</span>
                  </div>
                )}
                {groupName && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Ethnic group</span>
                    <span className={s.sidebarVal}>{groupName}</span>
                  </div>
                )}
                {clan.lineage_type_display && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Lineage</span>
                    <span className={s.sidebarVal}>{clan.lineage_type_display}</span>
                  </div>
                )}
                {clan.totem && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Totem</span>
                    <span className={s.sidebarVal}>{clan.totem}</span>
                  </div>
                )}
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Taboos</span>
                  <span className={s.sidebarVal}>{clan.taboos?.length ?? 0} documented</span>
                </div>
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Sub-clans</span>
                  <span className={s.sidebarVal}>{subClans.length} documented</span>
                </div>
              </div>
            </div>

            {/* Contribute CTA */}
            <div className={s.contributeCard}>
              <div className={s.contributeCardTitle}>Know more?</div>
              <div className={s.contributeCardBody}>
                Incorrect totem, missing sub-clan, or a richer origin story? Help us build the record.
              </div>
              <Link href="/contribute" className={s.contributeBtn}>
                Contribute data →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
