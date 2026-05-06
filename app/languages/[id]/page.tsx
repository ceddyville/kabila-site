import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { fetchLanguage, fetchLanguageEthnicGroups } from "@/lib/api";
import type { EthnicGroupSummary } from "@/lib/types";
import s from "../../detail.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LanguageDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  let lang;
  let ethnicGroups: EthnicGroupSummary[] = [];

  try {
    [lang, ethnicGroups] = await Promise.all([
      fetchLanguage(numId),
      fetchLanguageEthnicGroups(numId),
    ]);
  } catch {
    return (
      <>
        <Nav />
        <div className={s.errorPage}>
          <p className={s.errorText}>Language not found. The API may be unavailable.</p>
          <Link href="/language-families" className={s.backLink}>&larr; Back to language families</Link>
        </div>
        <Footer />
      </>
    );
  }

  const familyChain = lang.family_chain ?? [];
  const countries = lang.countries ?? [];
  const dialects = lang.dialects ?? [];
  const samplePhrases = lang.sample_phrases ?? [];
  const relatedLangs = lang.related_languages ?? [];
  const demonyms = lang.demonyms ?? {};

  return (
    <>
      <Nav />

      {/* Breadcrumb */}
      <div className={s.breadcrumb}>
        <Link href="/">Kabila</Link>
        <span className={s.breadSep}>›</span>
        <Link href="/language-families">Language families</Link>
        {familyChain.map((part, i) => (
          <span key={i}>
            <span className={s.breadSep}>›</span>
            <span className={s.breadCurrent}>{part}</span>
          </span>
        ))}
        <span className={s.breadSep}>›</span>
        <span className={s.breadCurrent}>{lang.name}</span>
      </div>

      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          <Link href="/language-families" className={s.backLink}>
            &larr; Language families
          </Link>
          <div className={s.heroEyebrow}>Language</div>
          <h1 className={s.heroName}>{lang.name}</h1>
          {lang.endonym && lang.endonym !== lang.name && (
            <div className={s.heroEndonym}>{lang.endonym}</div>
          )}
          {lang.pronunciation && (
            <div className={s.heroEndonym}>{lang.pronunciation}</div>
          )}
          <div className={s.heroTags}>
            {familyChain.length > 0 && (
              <span className={s.heroTag}>
                <strong>{familyChain.join(" › ")}</strong>
              </span>
            )}
            {lang.iso_639_code && (
              <span className={s.heroTag}>ISO 639: {lang.iso_639_code}</span>
            )}
            {lang.approx_speakers && (
              <span className={s.heroTag}>
                ~{lang.approx_speakers.toLocaleString()} speakers
              </span>
            )}
            {countries.length > 0 && (
              <span className={s.heroTag}>{countries.map(c => c.name).join(", ")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div className={s.metaStrip}>
        <div className={s.metaStripInner}>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Family</div>
            <div className={s.metaVal}>{lang.family_name ?? "—"}</div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Classification</div>
            <div className={s.metaValMono}>{familyChain.join(" › ") || "—"}</div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>Speakers</div>
            <div className={s.metaVal}>
              {lang.approx_speakers
                ? lang.approx_speakers.toLocaleString()
                : "—"}
            </div>
          </div>
          <div className={s.metaCell}>
            <div className={s.metaLabel}>ISO code</div>
            <div className={s.metaValMono}>{lang.iso_639_code ?? "—"}</div>
          </div>
          {lang.guthrie_code && (
            <div className={s.metaCell}>
              <div className={s.metaLabel}>Guthrie</div>
              <div className={s.metaValMono}>{lang.guthrie_code}</div>
            </div>
          )}
          {lang.native_region && (
            <div className={s.metaCell}>
              <div className={s.metaLabel}>Region</div>
              <div className={s.metaVal}>{lang.native_region}</div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={s.bodyWrap}>
        <div className={s.contentGrid}>
          <div>
            {/* Notes / History */}
            {lang.notes && (
              <section className={s.section}>
                <div className={s.sectionHeading}>About {lang.name}</div>
                <div className={s.originBlock}>{lang.notes}</div>
              </section>
            )}

            {/* Demonyms table */}
            {Object.keys(demonyms).length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Naming</div>
                <table className={s.phraseTable}>
                  <tbody>
                    {demonyms.person && (
                      <tr>
                        <td className={s.phraseEn}>Person</td>
                        <td className={s.phraseLocal}>{demonyms.person}</td>
                      </tr>
                    )}
                    {demonyms.people && (
                      <tr>
                        <td className={s.phraseEn}>People</td>
                        <td className={s.phraseLocal}>{demonyms.people}</td>
                      </tr>
                    )}
                    {demonyms.language && (
                      <tr>
                        <td className={s.phraseEn}>Language</td>
                        <td className={s.phraseLocal}>{demonyms.language}</td>
                      </tr>
                    )}
                    {demonyms.country && (
                      <tr>
                        <td className={s.phraseEn}>Country</td>
                        <td className={s.phraseLocal}>{demonyms.country}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {/* Phonology */}
            {(lang.phonology_notes || lang.tone_system) && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Phonology</div>
                {lang.tone_system && (
                  <p className={s.sectionBody}>
                    <strong>Tone system:</strong> {lang.tone_system}
                  </p>
                )}
                {lang.phonology_notes && (
                  <div className={s.originBlock}>{lang.phonology_notes}</div>
                )}
              </section>
            )}

            {/* Grammar */}
            {(lang.grammar_notes || lang.word_order) && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Grammar</div>
                {lang.word_order && (
                  <p className={s.sectionBody}>
                    <strong>Word order:</strong> {lang.word_order}
                  </p>
                )}
                {lang.grammar_notes && (
                  <div className={s.originBlock}>{lang.grammar_notes}</div>
                )}
              </section>
            )}

            {/* Sample phrases */}
            {samplePhrases.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>
                  Sample phrases ({samplePhrases.length})
                </div>
                <table className={s.phraseTable}>
                  <thead>
                    <tr>
                      <th className={s.phraseEn}>English</th>
                      <th className={s.phraseLocal}>{lang.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samplePhrases.map((p, i) => (
                      <tr key={i}>
                        <td className={s.phraseEn}>{p.english}</td>
                        <td className={s.phraseLocal}>{p.local}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Dialects */}
            {dialects.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Dialects ({dialects.length})</div>
                <div className={s.clanGrid}>
                  {dialects.map((d, i) => (
                    <div key={i} className={s.clanCard} style={{ cursor: "default" }}>
                      <div className={s.clanCardName}>{d}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ethnic groups that speak this language */}
            {ethnicGroups.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>
                  Ethnic groups ({ethnicGroups.length})
                </div>
                <div className={s.clanGrid}>
                  {ethnicGroups.map((g) => (
                    <Link key={g.id} href={`/ethnic-groups/${g.id}`} className={s.clanCard}>
                      <div className={s.clanCardName}>{g.name}</div>
                      {g.endonym && <div className={s.clanCardEndonym}>{g.endonym}</div>}
                      <span className={s.clanCardArrow}>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Writing systems */}
            {lang.writing_systems && lang.writing_systems.length > 0 && (
              <section className={s.section}>
                <div className={s.sectionHeading}>Writing systems</div>
                <div className={s.heroTags}>
                  {lang.writing_systems.map((ws, i) => (
                    <span key={i} className={s.heroTag}>{ws}</span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className={s.sidebarCard}>
              <div className={s.sidebarCardHeader}>At a glance</div>
              <div className={s.sidebarCardBody}>
                <div className={s.sidebarRow}>
                  <span className={s.sidebarKey}>Name</span>
                  <span className={s.sidebarVal}>{lang.name}</span>
                </div>
                {lang.endonym && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Endonym</span>
                    <span className={s.sidebarVal}>{lang.endonym}</span>
                  </div>
                )}
                {lang.iso_639_code && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>ISO 639</span>
                    <span className={s.sidebarVal}>{lang.iso_639_code}</span>
                  </div>
                )}
                {lang.guthrie_code && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Guthrie</span>
                    <span className={s.sidebarVal}>{lang.guthrie_code}</span>
                  </div>
                )}
                {lang.glottolog_code && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Glottolog</span>
                    <span className={s.sidebarVal}>{lang.glottolog_code}</span>
                  </div>
                )}
                {lang.family_name && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Family</span>
                    <span className={s.sidebarVal}>{lang.family_name}</span>
                  </div>
                )}
                {countries.length > 0 && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Countries</span>
                    <span className={s.sidebarVal}>{countries.map(c => c.name).join(", ")}</span>
                  </div>
                )}
                {lang.approx_speakers && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Speakers</span>
                    <span className={s.sidebarVal}>~{lang.approx_speakers.toLocaleString()}</span>
                  </div>
                )}
                {lang.word_order && (
                  <div className={s.sidebarRow}>
                    <span className={s.sidebarKey}>Word order</span>
                    <span className={s.sidebarVal}>{lang.word_order}</span>
                  </div>
                )}
              </div>
            </div>

            {relatedLangs.length > 0 && (
              <div className={s.sidebarCard}>
                <div className={s.sidebarCardHeader}>Related languages</div>
                <div className={s.sidebarCardBody}>
                  {relatedLangs.map((rl, i) => (
                    <div key={i} className={s.sidebarRow}>
                      <span className={s.sidebarVal}>{rl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={s.contributeCard}>
              <div className={s.contributeTitle}>Help improve this data</div>
              <p className={s.contributeText}>
                Know more about {lang.name}? Submit a contribution.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
