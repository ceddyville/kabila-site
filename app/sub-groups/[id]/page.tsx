import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { fetchSubGroup, fetchSubGroupClans, fetchSubGroupChildren } from "@/lib/api";
import type { ClanSummary, SubGroupSummary } from "@/lib/types";
import s from "../../detail.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubGroupDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  let subGroup;
  let clans: ClanSummary[] = [];
  let children: SubGroupSummary[] = [];

  try {
    [subGroup, clans, children] = await Promise.all([
      fetchSubGroup(numId),
      fetchSubGroupClans(numId),
      fetchSubGroupChildren(numId),
    ]);
  } catch {
    return (
      <>
        <Nav />
        <div className={s.errorPage}>
          <p className={s.errorText}>Sub-group not found. The API may be unavailable.</p>
          <Link href="/ethnic-groups" className={s.backLink}>&larr; Back to ethnic groups</Link>
        </div>
        <Footer />
      </>
    );
  }

  const groupName = subGroup.ethnic_group?.name ?? "";
  const groupId = subGroup.ethnic_group?.id;
  const langName = subGroup.language?.name;
  const parentName = subGroup.parent_name;

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
        <span className={s.breadcrumbSep}>›</span>
        <span className={s.breadcrumbCurrent}>{subGroup.name}</span>
      </div>

      {/* Dark hero */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          {groupId && (
            <Link href={`/ethnic-groups/${groupId}`} className={s.heroBack}>
              ← Back to {groupName}
            </Link>
          )}
          <div className={s.heroEyebrow}>
            <span className={s.eyebrowLine} />
            {subGroup.group_type_display ?? "Sub-group"}
          </div>
          <div className={s.heroName}>{subGroup.name}</div>
          {subGroup.endonym && <div className={s.heroEndonym}>{subGroup.endonym}</div>}
          {subGroup.alternate_names && subGroup.alternate_names.length > 0 && (
            <div className={s.heroAlt}>
              Also known as: <em>{subGroup.alternate_names.join(", ")}</em>
            </div>
          )}
          <div className={s.heroTags}>
            {groupName && (
              <span className={s.heroTag}><strong>{groupName}</strong></span>
            )}
            {subGroup.lineage_system_display && (
              <span className={s.heroTag}><strong>{subGroup.lineage_system_display}</strong> lineage</span>
            )}
            {langName && (
              <span className={s.heroTag}>{langName}</span>
            )}
            {parentName && (
              <span className={s.heroTag}>Part of <strong>{parentName}</strong></span>
            )}
            {clans.length > 0 && (
              <span className={s.heroTag}>{clans.length} clans documented</span>
            )}
            {children.length > 0 && (
              <span className={s.heroTag}>{children.length} sub-groups</span>
            )}
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div className={s.metaStrip}>
        <div className={s.metaStripInner}>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Language</div>
            <div className={s.metaVal}>{langName ?? "—"}</div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Lineage system</div>
            <div className={s.metaVal}>{subGroup.lineage_system_display ?? "—"}</div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Population</div>
            <div className={s.metaVal}>
              {subGroup.population_estimate
                ? subGroup.population_estimate.toLocaleString()
                : "—"}
            </div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Type</div>
            <div className={s.metaVal}>{subGroup.group_type_display ?? "—"}</div>
          </div>
        </div>
      </div>

      {/* Body: 2-column */}
      <div className={s.bodyWrap}>
        <div className={s.contentGrid}>
          {/* ── Main column ── */}
          <div>
            {/* Description */}
            {subGroup.description && (
              <section className={s.section}>
                <div className={s.sectionHeading}>About the {subGroup.name}</div>
                <p className={s.sectionBody}>{subGroup.description}</p>
              </section>
            )}

            {/* Origin story */}
            {subGroup.origin_story && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Origin story &amp; oral tradition</div>
                <div className={s.originBlock}>{subGroup.origin_story}</div>
              </section>
            )}

            {/* Child sub-groups (e.g. Tugen has sub-groups) */}
            {children.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Sub-groups ({children.length})</div>
                <div className={s.clanGrid}>
                  {children.map((child) => (
                    <Link key={child.id} href={`/sub-groups/${child.id}`} className={s.clanCard}>
                      <div className={s.clanCardName}>{child.name}</div>
                      {child.endonym && <div className={s.clanCardEndonym}>{child.endonym}</div>}
                      <span className={s.clanCardArrow}>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Clans */}
            {clans.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Clans ({clans.length})</div>
                <div className={s.clanGrid}>
                  {clans.map((c) => (
                    <Link key={c.id} href={`/clans/${c.id}`} className={s.clanCard}>
                      <div className={s.clanCardName}>{c.name}</div>
                      {c.endonym && <div className={s.clanCardEndonym}>{c.endonym}</div>}
                      <span className={s.clanCardArrow}>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* No content state */}
            {!subGroup.description && !subGroup.origin_story && children.length === 0 && clans.length === 0 && (
              <section className={s.section}>
                <p className={s.sectionMuted}>
                  No detailed information documented yet.{" "}
                  <Link href="/contribute" className={s.inlineLink}>Contribute data →</Link>
                </p>
              </section>
            )}

            {/* Sources */}
            {subGroup.sources && subGroup.sources.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Sources</div>
                <ul style={{ paddingLeft: 18 }}>
                  {subGroup.sources.map((src, i) => {
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
            {/* Parent ethnic group link */}
            {groupId && (
              <Link href={`/ethnic-groups/${groupId}`} className={s.parentLinkCard}>
                <div className={s.parentLinkLabel}>Parent ethnic group</div>
                <div className={s.parentLinkName}>{groupName}</div>
                {subGroup.ethnic_group?.endonym && (
                  <div className={s.parentLinkEndonym}>{subGroup.ethnic_group.endonym}</div>
                )}
                <div className={s.parentLinkArrow}>→</div>
              </Link>
            )}

            {/* At a glance */}
            <div className={s.sidebarCard}>
              <div className={s.sidebarCardHeader}>At a glance</div>
              <div className={s.sidebarCardBody}>
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Name</span>
                  <span className={s.sidebarVal}>{subGroup.name}</span>
                </div>
                {subGroup.endonym && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Endonym</span>
                    <span className={s.sidebarVal}>{subGroup.endonym}</span>
                  </div>
                )}
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Ethnic group</span>
                  <span className={s.sidebarVal}>{groupName}</span>
                </div>
                {subGroup.group_type_display && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Type</span>
                    <span className={s.sidebarVal}>{subGroup.group_type_display}</span>
                  </div>
                )}
                {langName && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Language</span>
                    <span className={s.sidebarVal}>{langName}</span>
                  </div>
                )}
                {subGroup.lineage_system_display && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Lineage</span>
                    <span className={s.sidebarVal}>{subGroup.lineage_system_display}</span>
                  </div>
                )}
                {subGroup.population_estimate && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Population</span>
                    <span className={s.sidebarVal}>{subGroup.population_estimate.toLocaleString()}</span>
                  </div>
                )}
                {parentName && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Parent sub-group</span>
                    <span className={s.sidebarVal}>{parentName}</span>
                  </div>
                )}
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Sub-groups</span>
                  <span className={s.sidebarVal}>{children.length} documented</span>
                </div>
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Clans</span>
                  <span className={s.sidebarVal}>{clans.length} documented</span>
                </div>
              </div>
            </div>

            {/* Contribute CTA */}
            <div className={s.contributeCard}>
              <div className={s.contributeCardTitle}>Know more?</div>
              <div className={s.contributeCardBody}>
                Missing a clan, origin story, or language detail? Help us build the record for the {subGroup.name}.
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
