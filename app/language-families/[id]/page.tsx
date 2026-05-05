import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { fetchLanguageFamily } from "@/lib/api";
import s from "../../detail.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LanguageFamilyDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  let family;
  try {
    family = await fetchLanguageFamily(numId);
  } catch {
    return (
      <>
        <Nav />
        <div className={s.errorPage}>
          <p className={s.errorText}>Language family not found. The API may be unavailable.</p>
          <Link href="/language-families" className={s.backLink}>&larr; Back to language families</Link>
        </div>
        <Footer />
      </>
    );
  }

  const children = family.children ?? [];
  const languages = family.languages ?? [];
  const classificationParts = family.classification?.split(" › ") ?? [];

  return (
    <>
      <Nav />

      {/* Breadcrumb */}
      <div className={s.breadcrumb}>
        <Link href="/">Kabila</Link>
        <span className={s.breadSep}>›</span>
        <Link href="/language-families">Language families</Link>
        {classificationParts.slice(0, -1).map((part, i) => {
          // Find parent IDs — for now just show text for ancestors
          return (
            <span key={i}>
              <span className={s.breadSep}>›</span>
              <span className={s.breadCurrent}>{part}</span>
            </span>
          );
        })}
        <span className={s.breadSep}>›</span>
        <span className={s.breadCurrent}>{family.name}</span>
      </div>

      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          <Link href={family.parent_name ? "javascript:history.back()" : "/language-families"} className={s.backLink}>
            &larr; {family.parent_name ?? "All families"}
          </Link>
          <div className={s.heroEyebrow}>Language Family</div>
          <h1 className={s.heroName}>{family.name}</h1>
          {family.classification && (
            <div className={s.heroTags}>
              <span className={s.heroTag}>{family.classification}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={s.bodyWrap}>
        <div className={s.contentGrid}>
          <div>
            {/* Description / History */}
            {family.description && (
              <section className={s.section}>
                <div className={s.sectionHeading}>About this language family</div>
                <div className={s.originBlock}>{family.description}</div>
              </section>
            )}

            {/* Child sub-families */}
            {children.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>
                  Sub-families ({children.length})
                </div>
                <div className={s.clanGrid}>
                  {children.map((child) => (
                    <Link key={child.id} href={`/language-families/${child.id}`} className={s.clanCard}>
                      <div className={s.clanCardName}>{child.name}</div>
                      {child.description && (
                        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.4 }}>
                          {child.description.length > 100
                            ? child.description.slice(0, 100) + "…"
                            : child.description}
                        </div>
                      )}
                      {child.children && child.children.length > 0 && (
                        <div style={{ fontSize: 11, color: "var(--ink-mid)", marginTop: 6 }}>
                          {child.children.length} sub-{child.children.length === 1 ? "family" : "families"}
                        </div>
                      )}
                      {child.languages && child.languages.length > 0 && (
                        <div style={{ fontSize: 11, color: "var(--laterite)", marginTop: 4 }}>
                          {child.languages.length} {child.languages.length === 1 ? "language" : "languages"}
                        </div>
                      )}
                      <span className={s.clanCardArrow}>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Languages directly under this family */}
            {languages.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>
                  Languages ({languages.length})
                </div>
                <div className={s.clanGrid}>
                  {languages.map((lang) => (
                    <Link key={lang.id} href={`/languages/${lang.id}`} className={s.clanCard}>
                      <div className={s.clanCardName}>{lang.name}</div>
                      <span className={s.clanCardArrow}>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {children.length === 0 && languages.length === 0 && (
              <section className={s.section}>
                <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
                  No sub-families or languages have been documented for this family yet.
                </p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className={s.sidebarCard}>
              <div className={s.sidebarCardHeader}>Classification</div>
              <div className={s.sidebarCardBody}>
                {classificationParts.map((part, i) => (
                  <div key={i} className={s.sidebarRow} style={{ paddingLeft: i * 12 }}>
                    <span className={s.sidebarVal} style={{
                      fontWeight: i === classificationParts.length - 1 ? 600 : 400,
                      color: i === classificationParts.length - 1 ? "var(--ink-dark)" : "var(--ink-soft)",
                    }}>
                      {i > 0 && "└ "}{part}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {(children.length > 0 || languages.length > 0) && (
              <div className={s.sidebarCard}>
                <div className={s.sidebarCardHeader}>At a glance</div>
                <div className={s.sidebarCardBody}>
                  {children.length > 0 && (
                    <div className={s.sidebarRow}>
                      <span className={s.sidebarKey}>Sub-families</span>
                      <span className={s.sidebarVal}>{children.length}</span>
                    </div>
                  )}
                  {languages.length > 0 && (
                    <div className={s.sidebarRow}>
                      <span className={s.sidebarKey}>Languages</span>
                      <span className={s.sidebarVal}>{languages.length}</span>
                    </div>
                  )}
                  {family.parent_name && (
                    <div className={s.sidebarRow}>
                      <span className={s.sidebarKey}>Parent</span>
                      <span className={s.sidebarVal}>{family.parent_name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={s.contributeCard}>
              <div className={s.contributeTitle}>Help improve this data</div>
              <p className={s.contributeText}>
                Know more about {family.name} languages? Submit a contribution.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
