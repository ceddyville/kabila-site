import React from "react";
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { fetchEthnicGroup, fetchEthnicGroupClans, fetchEthnicGroupSubGroups, fetchLanguage } from "@/lib/api";
import type { ClanSummary, SubGroupSummary } from "@/lib/types";
import s from "../../detail.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EthnicGroupDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  let group;
  let clans: ClanSummary[] = [];
  let subGroups: SubGroupSummary[] = [];

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
        <div className={s.errorPage}>
          <p className={s.errorText}>Ethnic group not found. The API may be unavailable.</p>
          <Link href="/ethnic-groups" className={s.backLink}>&larr; Back to groups</Link>
        </div>
        <Footer />
      </>
    );
  }

  const countries = group.countries?.map((c) => c.name) ?? [];
  const langName = group.languages?.primary?.name;
  const langId = group.languages?.primary?.id;
  let langFamily = "";
  let langFamilyChain: string[] = [];
  if (langId) {
    try {
      const lang = await fetchLanguage(langId);
      langFamily = lang.family_name ?? "";
      langFamilyChain = lang.family_chain ?? [];
    } catch { /* ignore */ }
  }
  const altNames = group.alternate_names?.filter(Boolean) ?? [];
  const topLevelSubGroups = subGroups.filter((sg) => !sg.parent_name);
  const culturalNotes = group.cultural_notes ?? {};
  const cultureEntries = Object.entries(culturalNotes).filter(
    ([, v]) => v != null && v !== "",
  );

  function formatCultureKey(k: string): string {
    return k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  }

  function renderCultureValue(v: unknown): React.ReactNode {
    if (v == null) return null;
    if (typeof v === "string" || typeof v === "number") return <>{String(v)}</>;
    if (Array.isArray(v)) {
      if (v.length === 0) return null;
      if (v.every((item) => typeof item === "string" || typeof item === "number")) {
        return (
          <ul className={s.cultureList}>
            {v.map((item, i) => <li key={i}>{String(item)}</li>)}
          </ul>
        );
      }
      // array of objects (e.g. notable_figures)
      return (
        <div className={s.cultureObjList}>
          {(v as Record<string, unknown>[]).map((item, i) => (
            <div key={i} className={s.cultureObjItem}>
              {Object.entries(item).map(([ik, iv]) => (
                <div key={ik} className={s.cultureObjRow}>
                  <span className={s.cultureObjKey}>{formatCultureKey(ik)}</span>
                  <span className={s.cultureObjVal}>{String(iv)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    if (typeof v === "object") {
      return (
        <div className={s.cultureNested}>
          {Object.entries(v as Record<string, unknown>).map(([ik, iv]) => (
            <div key={ik} className={s.cultureNestedRow}>
              <span className={s.cultureNestedKey}>{formatCultureKey(ik)}</span>
              <span className={s.cultureNestedVal}>{renderCultureValue(iv)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <>{String(v)}</>;
  }

  return (
    <>
      <Nav />

      {/* Breadcrumb */}
      <div className={s.breadcrumb}>
        <Link href="/">Kabila</Link>
        <span className={s.breadcrumbSep}>›</span>
        <Link href="/ethnic-groups">Ethnic groups</Link>
        <span className={s.breadcrumbSep}>›</span>
        <span className={s.breadcrumbCurrent}>{group.name}</span>
      </div>

      {/* Dark hero */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroEyebrow}>
            <span className={s.eyebrowLine} />
            {group.community_type_display ?? "Indigenous"}
          </div>
          <div className={s.heroName}>{group.name}</div>
          {group.endonym && <div className={s.heroEndonym}>{group.endonym}</div>}
          {altNames.length > 0 && (
            <div className={s.heroAlt}>
              Also known as: <em>{altNames.join(", ")}</em>
            </div>
          )}
          <div className={s.heroTags}>
            {countries.map((c) => (
              <span key={c} className={s.heroTag}><strong>{c}</strong></span>
            ))}
            {group.lineage_system_display && (
              <span className={s.heroTag}><strong>{group.lineage_system_display}</strong> lineage</span>
            )}
            {langName && langId && (
              <Link href={`/languages/${langId}`} className={s.heroTag}>{langName}</Link>
            )}
            {langName && !langId && (
              <span className={s.heroTag}>{langName}</span>
            )}
            {topLevelSubGroups.length > 0 ? (
              <span className={s.heroTag}>{topLevelSubGroups.length} sub-groups</span>
            ) : clans.length > 0 ? (
              <span className={s.heroTag}>{clans.length} clans documented</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div className={s.metaStrip}>
        <div className={s.metaStripInner}>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Language</div>
            <div className={s.metaVal}>
              {langName && langId ? (
                <Link href={`/languages/${langId}`}>{langName}</Link>
              ) : (langName ?? "—")}
            </div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Language family</div>
            <div className={s.metaValMono}>{langFamilyChain.length > 0 ? langFamilyChain.join(" › ") : "—"}</div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Lineage system</div>
            <div className={s.metaVal}>{group.lineage_system_display ?? "—"}</div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Population</div>
            <div className={s.metaVal}>
              {group.population_estimate
                ? group.population_estimate.toLocaleString()
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Body: 2-column */}
      <div className={s.bodyWrap}>
        <div className={s.contentGrid}>
          {/* ── Main column ── */}
          <div>
            {group.description && (
              <section className={s.section}>
                <div className={s.sectionHeading}>About the {group.name}</div>
                <p className={s.sectionBody}>{group.description}</p>
              </section>
            )}

            {group.origin_story && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Origin story &amp; oral tradition</div>
                <div className={s.originBlock}>{group.origin_story}</div>
              </section>
            )}

            {/* Self-identification */}
            {(!!group.endonym || !!(culturalNotes as Record<string, unknown>)?.endonyms) && (
              <section className={s.section}>
                <div className={s.sectionHeading}>How they identify</div>
                <div className={s.demonymTable}>
                  {(() => {
                    const ens = (culturalNotes as Record<string, Record<string, string>>)?.endonyms;
                    if (ens) {
                      return Object.entries(ens).map(([k, v]) => (
                        <div key={k} className={s.demonymRow}>
                          <span className={s.demonymLabel}>{formatCultureKey(k)}</span>
                          <span className={s.demonymValue}>{String(v)}</span>
                        </div>
                      ));
                    }
                    return group.endonym ? (
                      <div className={s.demonymRow}>
                        <span className={s.demonymLabel}>People (plural)</span>
                        <span className={s.demonymValue}>{group.endonym}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </section>
            )}

            {cultureEntries.filter(([k]) => k !== "endonyms").length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Cultural notes</div>
                <div className={s.culturalTable}>
                  {cultureEntries.filter(([k]) => k !== "endonyms").map(([k, v]) => (
                    <div key={k} className={s.culturalRow}>
                      <div className={s.culturalLabel}>{formatCultureKey(k)}</div>
                      <div className={s.culturalVal}>{renderCultureValue(v)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {topLevelSubGroups.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Sub-groups ({topLevelSubGroups.length})</div>
                <div className={s.clanGrid}>
                  {topLevelSubGroups.map((sg) => (
                    <Link key={sg.id} href={`/sub-groups/${sg.id}`} className={s.clanCard}>
                      <div className={s.clanCardName}>{sg.name}</div>
                      {sg.endonym && <div className={s.clanCardEndonym}>{sg.endonym}</div>}
                      <span className={s.clanCardArrow}>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {clans.length > 0 && topLevelSubGroups.length === 0 && (
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

            {group.sources && group.sources.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Sources</div>
                <ul style={{ paddingLeft: 18 }}>
                  {group.sources.map((src, i) => {
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
            <div className={s.sidebarCard}>
              <div className={s.sidebarCardHeader}>At a glance</div>
              <div className={s.sidebarCardBody}>
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Group name</span>
                  <span className={s.sidebarVal}>{group.name}</span>
                </div>
                {group.endonym && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Endonym</span>
                    <span className={s.sidebarVal}>{group.endonym}</span>
                  </div>
                )}
                {langName && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Language</span>
                    <span className={s.sidebarVal}>{langName}</span>
                  </div>
                )}
                {group.lineage_system_display && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Lineage</span>
                    <span className={s.sidebarVal}>{group.lineage_system_display}</span>
                  </div>
                )}
                {group.population_estimate && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Population</span>
                    <span className={s.sidebarVal}>{group.population_estimate.toLocaleString()}</span>
                  </div>
                )}
                {topLevelSubGroups.length === 0 && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Clans</span>
                    <span className={s.sidebarVal}>{clans.length} documented</span>
                  </div>
                )}
                {topLevelSubGroups.length > 0 && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Sub-groups</span>
                    <span className={s.sidebarVal}>{topLevelSubGroups.length} documented</span>
                  </div>
                )}
              </div>
            </div>

            <div className={s.contributeCard}>
              <div className={s.contributeCardTitle}>Know more?</div>
              <div className={s.contributeCardBody}>
                Missing a clan, incorrect lineage data, or a richer origin story? Submit a correction or addition.
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
